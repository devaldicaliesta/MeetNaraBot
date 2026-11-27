// Asks every question of the TSbot menu (tsbot/menu.json) once, so Nara's answer cache already holds the
// answers when a visitor clicks them: a menu click then returns from the cache instead of waiting for a model.
//   NARA_API_URL   origin of the Nara Worker (required)
//   NARA_BOT_ID    bot id TSbot chats with (empty = the platform bot)
//   WARM_DELAY_MS  pause between questions (default 7000: the public API allows 10 questions a minute per visitor)
// A question that is already cached comes straight back from the cache and costs no model call, so running this
// daily only spends model calls on answers that expired (7 days) or were dropped by a document or settings change.
// It never fails the run over one question: the deploy is already done, and a cold answer is only slower.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fail, toOrigin } from './origin.mjs';
import { checkMenu } from './menu.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * The answer text or the error, from the plain JSON reply ({ answer } / { error }) the Worker sends to
 * non-streaming clients, or from an NDJSON stream (delta/done/error events) if a server streams anyway.
 */
async function readAnswer(res) {
  const text = await res.text().catch(() => '');
  if (!(res.headers.get('content-type') || '').includes('ndjson')) {
    try { const b = JSON.parse(text); return { answer: typeof b.answer === 'string' ? b.answer : '', error: b.error }; } catch { return { answer: '' }; }
  }
  let answer = '', error, done = false;
  for (const line of text.split('\n')) {
    let ev;
    try { ev = JSON.parse(line); } catch { continue; }
    if (ev.type === 'delta') answer += ev.text || '';
    else if (ev.type === 'done') { done = true; if (typeof ev.text === 'string') answer = ev.text; }
    else if (ev.type === 'error') error = ev.message;
  }
  return { answer: done && !error ? answer : '', error };
}

/** Every distinct menu question, in menu order. */
export function menuQuestions(menu) {
  return [...new Set(menu.categories.flatMap((c) => c.issues))];
}

/**
 * Asks each question the way the TSbot page does (Indonesian, no history), one at a time.
 * Returns one row per question: { question, ok, cached, ms, error }.
 */
export async function warm({ api, bot, questions, delayMs = 7000, fetchImpl = fetch, wait = sleep, log = () => {} }) {
  const url = `${api}/api/public/chat?${bot ? `bot=${encodeURIComponent(bot)}&` : ''}lang=id`;
  const ask = (question) =>
    fetchImpl(url, {
      method: 'POST',
      // No Origin header: a server-side request, like curl. The API asks for a User-Agent.
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'nara-tsbot-cache-warmer' },
      body: JSON.stringify({ question, history: [], website: '', lang: 'id' }),
      signal: AbortSignal.timeout(90_000),
    });
  const rows = [];
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (i) await wait(delayMs);
    const started = Date.now();
    let row;
    try {
      let res = await ask(question);
      // Over the per-minute limit: wait for the window to pass, then try once more.
      if (res.status === 429) {
        await wait(61_000);
        res = await ask(question);
      }
      const body = await readAnswer(res);
      row = res.ok && body.answer
        ? { question, ok: true, ms: Date.now() - started }
        : { question, ok: false, ms: Date.now() - started, error: String(body.error || `HTTP ${res.status}`).slice(0, 200) };
    } catch (e) {
      row = { question, ok: false, ms: Date.now() - started, error: String(e?.message || e).slice(0, 200) };
    }
    rows.push(row);
    log(`${row.ok ? 'ok  ' : 'FAIL'} ${String(row.ms).padStart(6)} ms  ${question}${row.error ? `  (${row.error})` : ''}`);
  }
  return rows;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const api = process.env.NARA_API_URL ? toOrigin(process.env.NARA_API_URL, 'NARA_API_URL') : fail('set NARA_API_URL');
  const bot = (process.env.NARA_BOT_ID || '').trim().toLowerCase();
  if (!/^[a-z0-9]{0,32}$/.test(bot)) fail('NARA_BOT_ID may only contain a-z and 0-9 (max 32)');
  const delayMs = Number(process.env.WARM_DELAY_MS || 7000);
  const questions = menuQuestions(checkMenu(JSON.parse(readFileSync(join(root, 'tsbot', 'menu.json'), 'utf8'))));
  console.log(`warm-tsbot-cache: ${questions.length} questions to ${api} (bot ${bot || 'platform'}), ${delayMs} ms apart`);
  const rows = await warm({ api, bot, questions, delayMs, log: (l) => console.log(l) });
  const failed = rows.filter((r) => !r.ok);
  console.log(`warm-tsbot-cache: ${rows.length - failed.length}/${rows.length} answered`);
  // GitHub Actions annotation, so a cold menu shows up on the run without failing it.
  if (failed.length) console.log(`::warning::${failed.length} menu question(s) were not cached: ${failed.map((r) => r.error).join('; ').slice(0, 500)}`);
}
