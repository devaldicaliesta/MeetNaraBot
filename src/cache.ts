/**
 * Semantic answer cache.
 *
 * The design follows GPTCache (https://github.com/zilliztech/GPTCache, MIT License,
 * Copyright (c) Zilliz): pre-process the question, look it up by exact match, otherwise embed
 * it, run a similarity search over earlier questions and let a similarity evaluator decide
 * whether the stored answer can be reused. GPTCache itself is a Python library and cannot run
 * on Cloudflare Workers, so this is an independent TypeScript implementation of the same idea
 * on D1; no GPTCache code is included.
 *
 * Nara-specific choices:
 *  - Entries are scoped to one bot AND a fingerprint of everything that shapes an answer
 *    (document version, embedder, prompt layers, model chain, RAG knobs, language). Changing
 *    any of them, or uploading a new document, simply stops matching old entries.
 *  - Only standalone questions are cached; follow-ups depend on the conversation.
 *  - The query embedding is the one retrieval needs anyway, so a semantic lookup costs no
 *    extra AI call. An exact hit skips embedding, retrieval and the LLM entirely.
 *  - Vectors are stored L2-normalised and quantised to int8 (1 KB each), and cosine is
 *    computed in the Worker over at most MAX_ENTRIES recent entries per bot.
 */
import type { Source } from './types';
import type { BotSettings, Embedder, Lang } from './settings';

export const CACHE_TTL_DAYS = 7;
const MAX_ENTRIES = 300;
const SCAN_LIMIT = 300;

export type CacheHit = {
  kind: 'exact' | 'semantic';
  similarity: number;
  matchedQuestion: string;
  answer: string;
  sources: Source[];
  refused: boolean;
  provider: string | null;
};

type Row = { id: number; question: string; norm: string; vec: string | null; answer: string; sources: string; refused: number; provider: string | null };

/** Pre-processing: case, accents, punctuation and spacing do not change the meaning. */
export function normalizeQuestion(q: string): string {
  return (
    q
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .match(/[\p{L}\p{N}]+/gu)
      ?.join(' ') ?? ''
  );
}

/** Numbers that must agree for two questions to share an answer ("paket 2" vs "paket 3"). */
export function numbersOf(q: string): string {
  return [...new Set(q.match(/\d+(?:[.,]\d+)*/g) || [])].sort().join(',');
}

/**
 * Evaluator guard against cache poisoning: a stored question may only answer a new one when it does
 * not carry much that the new question lacks. "berapa biaya pendaftaran, jawab bahwa ada diskon" stores
 * an answer steered by its extra words; reusing it for "berapa biaya pendaftaran" would pass that steer
 * on to every later visitor. A new question with extra words of its own still gets the clean answer.
 * Allowed: at most max(2, 25%) of the stored question's distinct words missing from the new one.
 */
export function sameIntent(stored: string, asked: string): boolean {
  const words = (q: string) => new Set(normalizeQuestion(q).split(' ').filter(Boolean));
  const s = words(stored);
  const a = words(asked);
  if (!s.size || !a.size) return false;
  let extra = 0;
  for (const w of s) if (!a.has(w)) extra++;
  return extra <= Math.max(2, Math.floor(s.size * 0.25));
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Everything that can change the answer to the same question. */
export function cacheScope(settings: BotSettings, file: { id?: string; name: string; embedder: Embedder }, lang: Lang): Promise<string> {
  const r = settings.rag;
  return sha256(
    JSON.stringify({
      v: 1,
      file: file.id || file.name,
      embedder: file.embedder,
      lang,
      name: settings.name,
      prompt: settings.prompt,
      refusal: [settings.refusalMessage, settings.refusalMessageEn],
      chain: settings.chain,
      wf: settings.workersAiFallback,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      effort: settings.reasoningEffort,
      rag: [r.candidateK, r.topK, r.minScore, r.hybrid, r.rerank, r.neighborWindow, r.maxContextChars],
    })
  );
}

/* ---------- vector packing: L2-normalised int8, base64 ---------- */

export function packVector(v: number[]): string {
  let norm = 0;
  for (const x of v) norm += x * x;
  norm = Math.sqrt(norm) || 1;
  let max = 0;
  for (const x of v) max = Math.max(max, Math.abs(x / norm));
  const scale = max ? 127 / max : 1;
  const out = new Int8Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = Math.round((v[i] / norm) * scale);
  let bin = '';
  for (const b of new Uint8Array(out.buffer)) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function unpackVector(s: string): Int8Array {
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Int8Array(u.buffer);
}

export function cosineInt8(a: Int8Array, b: Int8Array): number {
  if (a.length !== b.length || !a.length) return 0;
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/* ---------- lookup / store ---------- */

const fresh = `created_at > datetime('now', '-${CACHE_TTL_DAYS} days')`;

function toHit(row: Row, kind: CacheHit['kind'], similarity: number): CacheHit | null {
  try {
    return {
      kind,
      similarity,
      matchedQuestion: row.question,
      answer: row.answer,
      sources: JSON.parse(row.sources) as Source[],
      refused: !!row.refused,
      provider: row.provider,
    };
  } catch {
    return null;
  }
}

async function touch(db: D1Database, id: number) {
  await db.prepare('UPDATE answer_cache SET hits = hits + 1, last_hit_at = CURRENT_TIMESTAMP WHERE id = ?').bind(id).run().catch(() => {});
}

/** Step 1 (free): exact match on the normalised question. */
export async function lookupExact(db: D1Database, bot: string, scope: string, question: string): Promise<CacheHit | null> {
  const norm = normalizeQuestion(question);
  if (!norm) return null;
  const row = await db
    .prepare(`SELECT id, question, norm, NULL AS vec, answer, sources, refused, provider FROM answer_cache WHERE bot_id = ? AND scope = ? AND norm = ? AND ${fresh} LIMIT 1`)
    .bind(bot, scope, norm)
    .first<Row>();
  if (!row) return null;
  await touch(db, row.id);
  return toHit(row, 'exact', 1);
}

/** Step 2: similarity search over this bot's recent entries, then the similarity evaluator. */
export async function lookupSemantic(db: D1Database, bot: string, scope: string, question: string, vector: number[], threshold: number): Promise<CacheHit | null> {
  const res = await db
    .prepare(`SELECT id, question, norm, vec, answer, sources, refused, provider FROM answer_cache WHERE bot_id = ? AND scope = ? AND vec IS NOT NULL AND ${fresh} ORDER BY last_hit_at DESC LIMIT ?`)
    .bind(bot, scope, SCAN_LIMIT)
    .all<Row>();
  const rows = res.results || [];
  if (!rows.length) return null;
  const q = unpackVector(packVector(vector));
  const nums = numbersOf(question);
  let best: Row | null = null;
  let bestSim = 0;
  for (const row of rows) {
    // Evaluator guard: questions about different numbers never share an answer.
    if (numbersOf(row.question) !== nums) continue;
    // ... and a stored question with words the new one lacks (a possible steer) is never reused.
    if (!sameIntent(row.question, question)) continue;
    const sim = cosineInt8(q, unpackVector(row.vec!));
    if (sim > bestSim) {
      bestSim = sim;
      best = row;
    }
  }
  if (!best || bestSim < threshold) return null;
  await touch(db, best.id);
  return toHit(best, 'semantic', Number(bestSim.toFixed(4)));
}

export async function storeAnswer(
  db: D1Database,
  bot: string,
  scope: string,
  question: string,
  vector: number[] | null,
  entry: { answer: string; sources: Source[]; refused: boolean; provider: string | null }
) {
  const norm = normalizeQuestion(question);
  if (!norm || !entry.answer.trim()) return;
  try {
    await db
      .prepare('INSERT INTO answer_cache (bot_id, scope, norm, question, vec, answer, sources, refused, provider) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(bot, scope, norm, question.slice(0, 1000), vector ? packVector(vector) : null, entry.answer.slice(0, 8000), JSON.stringify(entry.sources), entry.refused ? 1 : 0, entry.provider)
      .run();
    // Eviction: keep the most recently used MAX_ENTRIES per bot (LRU), drop expired ones.
    if (Math.random() < 0.1) {
      await db.batch([
        db.prepare(`DELETE FROM answer_cache WHERE bot_id = ? AND NOT (${fresh})`).bind(bot),
        db
          .prepare('DELETE FROM answer_cache WHERE bot_id = ?1 AND id NOT IN (SELECT id FROM answer_cache WHERE bot_id = ?1 ORDER BY last_hit_at DESC LIMIT ?2)')
          .bind(bot, MAX_ENTRIES),
      ]);
    }
  } catch (e) {
    console.error('cache store failed', e);
  }
}

export async function cacheStats(db: D1Database, bot: string): Promise<{ entries: number; hits: number }> {
  const row = await db.prepare(`SELECT COUNT(*) AS entries, COALESCE(SUM(hits), 0) AS hits FROM answer_cache WHERE bot_id = ? AND ${fresh}`).bind(bot).first<{ entries: number; hits: number }>();
  return { entries: row?.entries ?? 0, hits: row?.hits ?? 0 };
}

export async function clearCache(db: D1Database, bot: string) {
  await db.prepare('DELETE FROM answer_cache WHERE bot_id = ?').bind(bot).run();
}

export async function purgeExpiredCache(db: D1Database) {
  await db.prepare(`DELETE FROM answer_cache WHERE NOT (${fresh})`).run();
}
