import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { menuQuestions, warm } from '../../scripts/warm-tsbot-cache.mjs';

type Call = { url: string; init: RequestInit };
const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

test('asks every distinct TSbot menu question', () => {
  const menu = JSON.parse(readFileSync('tsbot/menu.json', 'utf8'));
  const qs = menuQuestions(menu);
  const all = menu.categories.flatMap((c: { issues: string[] }) => c.issues);
  assert.equal(qs.length, new Set(all).size);
  assert.equal(qs[0], menu.categories[0].issues[0]);
  assert.deepEqual(menuQuestions({ categories: [{ issues: ['A', 'B'] }, { issues: ['B', 'C'] }] }), ['A', 'B', 'C']);
});

test('sends each question the way the TSbot page does, paced, without an Origin', async () => {
  const calls: Call[] = [];
  const waits: number[] = [];
  const rows = await warm({
    api: 'https://nara.example.workers.dev',
    bot: 'abc123',
    questions: ['Saya lupa PIN Windows', 'Wi-Fi sering putus atau lambat'],
    delayMs: 7000,
    fetchImpl: async (url: string, init: RequestInit) => { calls.push({ url, init }); return reply(200, { answer: 'Jawaban [1]', sources: [] }); },
    wait: async (ms: number) => { waits.push(ms); },
  });
  assert.deepEqual(rows.map((r: { ok: boolean }) => r.ok), [true, true]);
  assert.deepEqual(waits, [7000]);
  assert.equal(calls[0].url, 'https://nara.example.workers.dev/api/public/chat?bot=abc123&lang=id');
  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers['User-Agent'], 'nara-tsbot-cache-warmer');
  assert.equal(headers.Origin, undefined);
  // No history: only a first question is cached, exactly as a visitor's first click.
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), { question: 'Saya lupa PIN Windows', history: [], website: '', lang: 'id' });
});

test('waits out the per-minute limit once, and reports failures instead of throwing', async () => {
  const waits: number[] = [];
  let n = 0;
  const rows = await warm({
    api: 'https://nara.example.workers.dev',
    bot: '',
    questions: ['Q1', 'Q2', 'Q3'],
    delayMs: 10,
    fetchImpl: async (url: string) => {
      assert.ok(!url.includes('bot='), 'platform bot: no bot parameter');
      n++;
      if (n === 1) return reply(429, { error: 'Terlalu cepat' });
      if (n === 2) return reply(200, { answer: 'ok' });
      if (n === 3) return reply(503, { error: 'Dokumen belum siap' });
      throw new Error('network down');
    },
    wait: async (ms: number) => { waits.push(ms); },
  });
  assert.deepEqual(waits, [61_000, 10, 10]);
  assert.deepEqual(rows.map((r: { ok: boolean; error?: string }) => [r.ok, r.error ?? null]), [[true, null], [false, 'Dokumen belum siap'], [false, 'network down']]);
});

test('also understands a streamed (NDJSON) reply', async () => {
  const nd = (events: unknown[]) => new Response(events.map((e) => JSON.stringify(e)).join('\n') + '\n', { headers: { 'Content-Type': 'application/x-ndjson' } });
  const replies = [
    nd([{ type: 'sources', items: [] }, { type: 'delta', text: 'Matikan lalu ' }, { type: 'delta', text: 'nyalakan Wi-Fi [1].' }, { type: 'done', refused: false }]),
    nd([{ type: 'error', message: 'Kuota harian habis' }]),
  ];
  const rows = await warm({ api: 'https://x.example', bot: '', questions: ['A', 'B'], delayMs: 0, fetchImpl: async () => replies.shift()!, wait: async () => {} });
  assert.deepEqual(rows.map((r: { ok: boolean; error?: string }) => [r.ok, r.error ?? null]), [[true, null], [false, 'Kuota harian habis']]);
});
