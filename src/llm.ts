import type { Bindings, ChatMessage } from './types';
import { adaptBody, endpointFor, parseAccountKey } from './openai-compat';
import {
  PROVIDERS,
  WORKERS_AI_PRIMARY,
  WORKERS_AI_BACKUP,
  EMBEDDING_MODEL,
  EMBEDDERS,
  GEMINI_EMBEDDING_MODEL,
  MISTRAL_EMBEDDING_MODEL,
  OPENAI_EMBEDDING_MODEL,
  VECTOR_DIM,
  resolveKey,
  type BotSettings,
  type ChainEntry,
  type Embedder,
  type KeyStore,
} from './settings';

export type FailAttempt = { provider: string; model: string; status: number; message: string };

export class AllProvidersFailed extends Error {
  failed: FailAttempt[];
  // A plain field (not a parameter property) so Node's type stripping can load this file in unit tests.
  constructor(failed: FailAttempt[]) {
    super('Semua penyedia LLM gagal');
    this.failed = failed;
  }
}

/** Ordered chain: owner's entries, then Workers AI as the always-available safety net. */
export function buildChain(settings: BotSettings): ChainEntry[] {
  const chain = [...settings.chain];
  if (settings.workersAiFallback) {
    for (const model of [WORKERS_AI_PRIMARY, WORKERS_AI_BACKUP]) {
      if (!chain.some((e) => e.provider === 'workers-ai' && e.model === model)) chain.push({ provider: 'workers-ai', model });
    }
  }
  return chain;
}

function httpMessage(status: number): string {
  if (status === 401 || status === 403) return 'API key ditolak (tidak valid atau tidak punya akses)';
  if (status === 402) return 'Kredit penyedia habis';
  if (status === 404) return 'Model tidak ditemukan';
  if (status === 429) return 'Batas pemakaian penyedia tercapai';
  if (status >= 500) return 'Server penyedia sedang bermasalah';
  return `HTTP ${status}`;
}

function bodyFor(entry: ChainEntry, settings: BotSettings, messages: ChatMessage[], stream: boolean, maxTokens?: number, temperature?: number) {
  const body: Record<string, unknown> = {
    model: entry.model,
    messages,
    temperature: temperature ?? settings.temperature,
    max_tokens: maxTokens ?? settings.maxTokens,
    stream,
  };
  return adaptBody(entry.provider, entry.model, body, settings.reasoningEffort);
}

/** Pulls text out of one SSE `data:` payload, for both OpenAI-style and Workers AI-style chunks. */
function deltaFrom(payload: any): string {
  if (!payload) return '';
  if (typeof payload.response === 'string') return payload.response;
  const choice = payload.choices?.[0];
  return choice?.delta?.content ?? choice?.message?.content ?? '';
}

async function* readSse(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const text = deltaFrom(JSON.parse(data));
        if (text) yield text;
      } catch {
        /* potongan SSE yang tidak lengkap / keepalive */
      }
    }
  }
}

/**
 * User bots run on the platform's shared Workers AI account, so they may only call the two
 * allow-listed chat models (a bot owner could otherwise pick a far more expensive model).
 */
/**
 * Workers AI for the platform bot runs on the Worker's own binding. A user bot has no binding (see
 * tenantEnv), so its "workers-ai" chain entries go through the owner's own Cloudflare account instead.
 */
const routed = (env: Bindings, entry: ChainEntry): ChainEntry => (entry.provider === 'workers-ai' && !env.AI ? { ...entry, provider: 'cloudflare' } : entry);

/** Runs a Workers AI model: the binding for the platform bot, the owner's own account (REST) for user bots. */
export async function runWorkersAi(env: Bindings, keys: KeyStore, model: string, input: Record<string, unknown>): Promise<any> {
  if (env.AI) return env.AI.run(model as any, input as any);
  const acc = parseAccountKey(resolveKey(env, keys, 'cloudflare'));
  if (!acc) throw new Error('Workers AI untuk bot Anda butuh kunci akun Cloudflare sendiri (ACCOUNT_ID:API_TOKEN) di menu Bot & model');
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc.account}/ai/run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${acc.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Workers AI (akun Anda): ${httpMessage(res.status)}`);
  const data: any = await res.json();
  return data?.result ?? data;
}

async function openStream(env: Bindings, keys: KeyStore, settings: BotSettings, chainEntry: ChainEntry, messages: ChatMessage[]) {
  const entry = routed(env, chainEntry);
  if (entry.provider === 'workers-ai') {
    const res: any = await env.AI.run(entry.model as any, { messages, stream: true, max_tokens: settings.maxTokens, temperature: settings.temperature } as any);
    if (res instanceof ReadableStream) return res as ReadableStream<Uint8Array>;
    // Some models ignore `stream` → wrap the full answer as one SSE event.
    const text = deltaFrom(res);
    return new Response(`data: ${JSON.stringify({ response: text })}\n\n`).body!;
  }
  const key = resolveKey(env, keys, entry.provider);
  if (!key) throw { status: 0, message: `Kunci ${PROVIDERS[entry.provider].name} belum diatur` };
  const ep = endpointFor(PROVIDERS[entry.provider].baseUrl, key);
  if (!ep) throw { status: 0, message: `Format kunci ${PROVIDERS[entry.provider].name} salah: pakai ACCOUNT_ID:API_TOKEN` };
  const res = await fetch(ep.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ep.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyFor(entry, settings, messages, true)),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok || !res.body) throw { status: res.status, message: httpMessage(res.status) };
  return res.body;
}

/**
 * Streams the answer, failing over to the next provider until one produces text.
 * Once text has started flowing we cannot switch provider anymore.
 */
export async function streamChat(
  env: Bindings,
  keys: KeyStore,
  settings: BotSettings,
  messages: ChatMessage[],
  onDelta: (text: string) => void | Promise<void>
): Promise<{ provider: string; model: string; failed: FailAttempt[]; text: string }> {
  const failed: FailAttempt[] = [];
  for (const entry of buildChain(settings)) {
    let started = false;
    let text = '';
    try {
      const stream = await openStream(env, keys, settings, entry, messages);
      for await (const piece of readSse(stream)) {
        started = true;
        text += piece;
        await onDelta(piece);
      }
      if (text.trim()) return { provider: entry.provider, model: entry.model, failed, text };
      failed.push({ provider: entry.provider, model: entry.model, status: 200, message: 'Respons kosong' });
    } catch (err: any) {
      if (started) {
        // Sudah ada teks terkirim: kembalikan apa adanya daripada mengulang dari awal.
        failed.push({ provider: entry.provider, model: entry.model, status: 499, message: 'Aliran terputus di tengah jawaban' });
        return { provider: entry.provider, model: entry.model, failed, text };
      }
      failed.push({ provider: entry.provider, model: entry.model, status: Number(err?.status) || 500, message: String(err?.message || 'Galat jaringan / timeout').slice(0, 200) });
    }
  }
  throw new AllProvidersFailed(failed);
}

/** Short non-streaming call (query rewrite, suggestion generation). */
export async function completeChat(
  env: Bindings,
  keys: KeyStore,
  settings: BotSettings,
  messages: ChatMessage[],
  maxTokens = 200
): Promise<{ text: string; provider: string; model: string }> {
  const failed: FailAttempt[] = [];
  for (const chainEntry of buildChain(settings)) {
    const entry = routed(env, chainEntry);
    try {
      if (entry.provider === 'workers-ai') {
        const res: any = await env.AI.run(entry.model as any, { messages, max_tokens: maxTokens, temperature: 0.1 } as any);
        const text = deltaFrom(res).trim();
        if (text) return { text, provider: entry.provider, model: entry.model };
        continue;
      }
      const key = resolveKey(env, keys, entry.provider);
      const ep = key ? endpointFor(PROVIDERS[entry.provider].baseUrl, key) : null;
      if (!ep) continue;
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${ep.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyFor(entry, settings, messages, false, maxTokens, 0.1)),
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) {
        failed.push({ provider: entry.provider, model: entry.model, status: res.status, message: httpMessage(res.status) });
        continue;
      }
      const data: any = await res.json();
      const text = deltaFrom(data).trim();
      if (text) return { text, provider: entry.provider, model: entry.model };
    } catch (err: any) {
      failed.push({ provider: entry.provider, model: entry.model, status: 500, message: String(err?.message || 'galat') });
    }
  }
  throw new AllProvidersFailed(failed);
}

/* ------------------------------------------------------------------ */
/*  Embeddings                                                          */
/* ------------------------------------------------------------------ */

function normalize(v: number[]): number[] {
  let sum = 0;
  for (const x of v) sum += x * x;
  const n = Math.sqrt(sum) || 1;
  return v.map((x) => x / n);
}

/** Whether this bot can embed with `e` right now: its own key (or, for the platform bot, the binding). */
function canEmbed(env: Bindings, keys: KeyStore, e: Embedder): boolean {
  if (e === 'workers-ai') return !!env.AI || !!parseAccountKey(resolveKey(env, keys, 'cloudflare'));
  return !!resolveKey(env, keys, e);
}

const EMBEDDER_NAME: Record<Embedder, string> = { gemini: 'Gemini', openai: 'OpenAI', mistral: 'Mistral', 'workers-ai': 'Workers AI' };

/**
 * Embedding model for the next upload. "auto" takes the first one this bot has a key for (Gemini, OpenAI,
 * Mistral, then Workers AI). User bots have no platform fallback, so without any own key this throws.
 */
export function pickEmbedder(env: Bindings, keys: KeyStore, settings: BotSettings): Embedder {
  const want = settings.embeddingProvider;
  if (want !== 'auto') {
    if (!canEmbed(env, keys, want)) throw new Error(`Embedding ${EMBEDDER_NAME[want]} dipilih tetapi kuncinya belum diatur di menu Bot & model`);
    return want;
  }
  const found = EMBEDDERS.find((e) => canEmbed(env, keys, e));
  if (!found) throw new Error('Simpan dulu kunci Gemini, OpenAI, Mistral, atau Workers AI (akun Cloudflare sendiri) di menu Bot & model untuk memproses dokumen');
  return found;
}

/**
 * Embedder for the next upload of a bot that may already have documents: those fix the model (vectors
 * of different models cannot be compared), and the bot must still hold a key for it.
 */
export function nextEmbedder(env: Bindings, keys: KeyStore, settings: BotSettings, existing?: Embedder | null): Embedder {
  if (!existing) return pickEmbedder(env, keys, settings);
  if (!canEmbed(env, keys, existing)) {
    throw new Error(`Dokumen bot ini memakai embedding ${EMBEDDER_NAME[existing]}. Simpan dulu kunci ${EMBEDDER_NAME[existing]} di menu Bot & model, atau hapus semua dokumen untuk ganti model`);
  }
  return existing;
}

/** OpenAI-style /embeddings (OpenAI, Mistral). */
async function embedOpenAiStyle(url: string, key: string, model: string, texts: string[], extra: Record<string, unknown>, name: string): Promise<number[][]> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: texts, ...extra }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Embedding ${name} gagal: ${httpMessage(res.status)}`);
  const data: any = await res.json();
  const vectors = [...(data?.data || [])].sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0)).map((d: any) => normalize(d.embedding || []));
  if (vectors.length !== texts.length || vectors.some((v: number[]) => v.length !== VECTOR_DIM)) throw new Error(`Format respons embedding ${name} tidak sesuai`);
  return vectors;
}

export async function embed(
  env: Bindings,
  keys: KeyStore,
  embedder: Embedder,
  texts: string[],
  kind: 'query' | 'document'
): Promise<number[][]> {
  if (embedder === 'gemini') {
    const key = resolveKey(env, keys, 'gemini');
    if (!key) throw new Error('Kunci Gemini belum diatur untuk embedding');
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:batchEmbedContents`,
      {
        method: 'POST',
        headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: texts.map((text) => ({
            model: `models/${GEMINI_EMBEDDING_MODEL}`,
            content: { parts: [{ text }] },
            taskType: kind === 'query' ? 'RETRIEVAL_QUERY' : 'RETRIEVAL_DOCUMENT',
            outputDimensionality: VECTOR_DIM,
          })),
        }),
        signal: AbortSignal.timeout(30000),
      }
    );
    if (!res.ok) throw new Error(`Embedding Gemini gagal: ${httpMessage(res.status)}`);
    const data: any = await res.json();
    const vectors = (data?.embeddings || []).map((e: any) => normalize(e.values || []));
    if (vectors.length !== texts.length || vectors.some((v: number[]) => v.length !== VECTOR_DIM)) {
      throw new Error('Format respons embedding Gemini tidak sesuai');
    }
    return vectors;
  }

  if (embedder === 'openai' || embedder === 'mistral') {
    const key = resolveKey(env, keys, embedder);
    if (!key) throw new Error(`Kunci ${EMBEDDER_NAME[embedder]} belum diatur untuk embedding`);
    return embedder === 'openai'
      ? embedOpenAiStyle('https://api.openai.com/v1/embeddings', key, OPENAI_EMBEDDING_MODEL, texts, { dimensions: VECTOR_DIM }, 'OpenAI')
      : embedOpenAiStyle('https://api.mistral.ai/v1/embeddings', key, MISTRAL_EMBEDDING_MODEL, texts, {}, 'Mistral');
  }

  const res: any = await runWorkersAi(env, keys, EMBEDDING_MODEL, { text: texts });
  let vectors: number[][] | null = null;
  if (Array.isArray(res?.data)) vectors = res.data;
  else if (Array.isArray(res) && Array.isArray(res[0])) vectors = res;
  if (!vectors || vectors.length !== texts.length) throw new Error('Format respons embedding Workers AI tidak sesuai');
  return vectors;
}
