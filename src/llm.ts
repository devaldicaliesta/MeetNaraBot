import type { Bindings, ChatMessage } from './types';
import {
  PROVIDERS,
  WORKERS_AI_PRIMARY,
  WORKERS_AI_BACKUP,
  EMBEDDING_MODEL,
  GEMINI_EMBEDDING_MODEL,
  VECTOR_DIM,
  resolveKey,
  type BotSettings,
  type ChainEntry,
  type Embedder,
  type KeyStore,
} from './settings';

export type FailAttempt = { provider: string; model: string; status: number; message: string };

export class AllProvidersFailed extends Error {
  constructor(public failed: FailAttempt[]) {
    super('Semua penyedia LLM gagal');
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

function bodyFor(entry: ChainEntry, settings: BotSettings, messages: ChatMessage[], stream: boolean, maxTokens?: number) {
  const body: Record<string, unknown> = {
    model: entry.model,
    messages,
    temperature: settings.temperature,
    max_tokens: maxTokens ?? settings.maxTokens,
    stream,
  };
  if (entry.provider === 'gemini' && settings.reasoningEffort) body.reasoning_effort = settings.reasoningEffort;
  return body;
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

async function openStream(env: Bindings, keys: KeyStore, settings: BotSettings, entry: ChainEntry, messages: ChatMessage[]) {
  if (entry.provider === 'workers-ai') {
    const res: any = await env.AI.run(entry.model as any, { messages, stream: true, max_tokens: settings.maxTokens, temperature: settings.temperature } as any);
    if (res instanceof ReadableStream) return res as ReadableStream<Uint8Array>;
    // Some models ignore `stream` → wrap the full answer as one SSE event.
    const text = deltaFrom(res);
    return new Response(`data: ${JSON.stringify({ response: text })}\n\n`).body!;
  }
  const key = resolveKey(env, keys, entry.provider);
  if (!key) throw { status: 0, message: `Kunci ${PROVIDERS[entry.provider].name} belum diatur` };
  const res = await fetch(`${PROVIDERS[entry.provider].baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
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
  for (const entry of buildChain(settings)) {
    try {
      if (entry.provider === 'workers-ai') {
        const res: any = await env.AI.run(entry.model as any, { messages, max_tokens: maxTokens, temperature: 0.1 } as any);
        const text = deltaFrom(res).trim();
        if (text) return { text, provider: entry.provider, model: entry.model };
        continue;
      }
      const key = resolveKey(env, keys, entry.provider);
      if (!key) continue;
      const res = await fetch(`${PROVIDERS[entry.provider].baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bodyFor(entry, settings, messages, false, maxTokens), temperature: 0.1 }),
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

export function pickEmbedder(env: Bindings, keys: KeyStore, settings: BotSettings): Embedder {
  if (settings.embeddingProvider === 'workers-ai') return 'workers-ai';
  const hasGemini = !!resolveKey(env, keys, 'gemini');
  if (settings.embeddingProvider === 'gemini') {
    if (!hasGemini) throw new Error('Embedding Gemini dipilih tetapi kunci Gemini belum diatur');
    return 'gemini';
  }
  return hasGemini ? 'gemini' : 'workers-ai';
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

  const res: any = await env.AI.run(EMBEDDING_MODEL as any, { text: texts } as any);
  let vectors: number[][] | null = null;
  if (Array.isArray(res?.data)) vectors = res.data;
  else if (Array.isArray(res) && Array.isArray(res[0])) vectors = res;
  if (!vectors || vectors.length !== texts.length) throw new Error('Format respons embedding Workers AI tidak sesuai');
  return vectors;
}
