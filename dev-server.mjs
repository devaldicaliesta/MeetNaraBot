// Mock server for UI work without a Cloudflare account: `npm run dev:mock`.
// Same endpoints and response shapes as the Worker, but retrieval is a simple keyword
// overlap score and the "AI" answer is stitched from the best-matching chunk.
// For the real pipeline use `npm run dev` (wrangler dev --remote).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectSmallTalk, smallTalkReply } from './src/smalltalk.ts'; // Node >= 22.18 runs TypeScript directly (type stripping).

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const PORT = Number(process.env.PORT || 8787);
const PASSWORD = process.env.ADMIN_PASSWORD || 'dev';

const LAYERS = {
  role: 'You are {name}, a friendly, patient and meticulous document assistant.',
  context: 'You are embedded on the owner\'s website to help visitors understand the document "{document}".',
  task: 'Answer the visitor\'s question using only the document excerpts provided in <knowledge>.',
  rules: '',
  format: 'Reply in the same language the visitor used (default: Indonesian). Keep it to at most 3 short paragraphs.',
  examples: '<example>\nVisitor: Berapa lama proses pendaftaran?\nAssistant: Proses pendaftaran memakan waktu **3 hari kerja** [1].\n</example>',
};
const DEFAULTS = {
  name: 'MeetNaraBot', language: 'id', greeting: '', greetingEn: '', suggestions: [], suggestionsEn: [],
  refusalMessage: 'Maaf, informasi itu tidak ada di dokumen yang saya miliki.', refusalMessageEn: "Sorry, that information isn't in the document I have.",
  launcherLabel: '', launcherLabelEn: '', themeColor: '#5B3FE0', prompt: { ...LAYERS },
  chain: [{ provider: 'gemini', model: 'gemini-3.5-flash' }, { provider: 'gemini', model: 'gemini-3.5-flash-lite' }, { provider: 'huggingface', model: 'openai/gpt-oss-120b' }],
  workersAiFallback: true, embeddingProvider: 'auto', temperature: 0.2, maxTokens: 1024, reasoningEffort: 'low',
  rag: { chunkSize: 1000, chunkOverlap: 150, candidateK: 20, topK: 5, minScore: 0.4, hybrid: true, rerank: false, neighborWindow: 1, maxContextChars: 9000, queryRewrite: true },
  limits: { maxQuestionLength: 500, maxHistory: 6, requestsPerMinute: 10, dailyPerIp: 100, dailyTotal: 3000 },
  allowedOrigins: [], logQuestions: true,
};
const PROVIDERS = [['workers-ai', 'Workers AI (Cloudflare)', ''], ['gemini', 'Google Gemini', 'GEMINI_API_KEY'], ['groq', 'Groq', 'GROQ_API_KEY'], ['openrouter', 'OpenRouter', 'OPENROUTER_API_KEY'], ['cerebras', 'Cerebras', 'CEREBRAS_API_KEY'], ['sambanova', 'SambaNova', 'SAMBANOVA_API_KEY'], ['huggingface', 'Hugging Face Router', 'HF_TOKEN']];

let settings = structuredClone(DEFAULTS);
const keys = {}; // never sent back to the client
let file = null;
let chunks = [];
let suggestions = { id: [], en: [] };
const logs = [];

const keyStatus = () => PROVIDERS.filter(([id]) => id !== 'workers-ai').map(([id, name, secret]) => ({ id, name, secret, configured: !!keys[id], source: keys[id] ? 'dashboard' : null }));
const chain = () => [...settings.chain, ...(settings.workersAiFallback ? [{ provider: 'workers-ai', model: '@cf/zai-org/glm-4.7-flash' }, { provider: 'workers-ai', model: '@cf/meta/llama-3.1-8b-instruct-fast' }] : [])];

function send(res, data, status = 200, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(data));
}
const body = (req) => new Promise((ok) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => { try { ok(JSON.parse(b || '{}')); } catch { ok({}); } }); });
const STOP = new Set('yang dan di ke dari untuk dengan pada adalah ini itu atau juga tidak apa siapa bagaimana berapa kapan dimana bagian dibahas jelaskan tentang saya kamu what does the section cover how much who where when about'.split(' '));
const words = (t) => (t.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter((w) => w.length > 2 && !STOP.has(w));

function retrieve(q, s) {
  const qw = [...new Set(words(q))];
  const scored = chunks.map((c) => {
    const tw = new Set(words(c.label + ' ' + c.text));
    const hit = qw.filter((w) => [...tw].some((t) => t.startsWith(w))).length;
    return { ...c, score: qw.length ? Math.min(0.95, 0.2 + (hit / qw.length) * 0.7) : 0, kw: hit };
  }).sort((a, b) => b.score - a.score);
  const best = scored[0]?.score || 0;
  const pass = best >= s.rag.minScore;
  const sel = pass ? scored.slice(0, s.rag.topK).filter((c) => c.kw > 0) : [];
  return { sel, best, scored };
}

function buildSystem(s) {
  const fill = (t) => t.replaceAll('{name}', s.name).replaceAll('{document}', file?.name || 'dokumen');
  return ['role', 'context', 'task'].map((k) => `<${k}>\n${fill(s.prompt[k])}\n</${k}>`).join('\n\n') +
    `\n\n<knowledge_policy>\n…\n</knowledge_policy>\n\n<rules>\n1. Use ONLY facts found inside <knowledge>.\n…${s.prompt.rules ? '\n' + s.prompt.rules : ''}\n</rules>\n\n<output_format>\n${fill(s.prompt.format)}\n</output_format>\n\n<examples>\n${fill(s.prompt.examples)}\n</examples>\n\n<self_check>\n…\n</self_check>`;
}

async function streamAnswer(res, question, s, debug, source, lang = 'id') {
  res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' });
  const emit = (e) => res.write(JSON.stringify(e) + '\n');
  const t0 = Date.now();
  if (!file || file.status !== 'selesai') { emit({ type: 'error', message: lang === 'en' ? `${s.name} doesn't have a reference document yet.` : `${s.name} belum punya dokumen referensi.` }); return res.end(); }
  const small = detectSmallTalk(question);
  if (small) {
    const l = small.lang ?? lang;
    const ex = (l === 'en' ? s.suggestionsEn : s.suggestions).length ? (l === 'en' ? s.suggestionsEn : s.suggestions) : suggestions[l] || [];
    const reply = smallTalkReply(small.kind, l, s.name, file.name, l === lang ? ex : []);
    if (debug) emit({ type: 'debug', data: { query: question, rewritten: null, gate: 'smalltalk', smallTalk: small.kind, candidates: [], timings: { total: 1 } } });
    emit({ type: 'sources', items: [] });
    emit({ type: 'delta', text: reply });
    emit({ type: 'done', refused: false, provider: 'smalltalk', model: small.kind, ms: Date.now() - t0 });
    if (s.logQuestions) logs.unshift({ id: logs.length + 1, created_at: new Date().toISOString().slice(0, 19).replace('T', ' '), source, question, answer: reply, refused: 0, failed: 0, provider: 'smalltalk:' + small.kind, best_score: 0 });
    return res.end();
  }
  const { sel, best, scored } = retrieve(question, s);
  if (debug) emit({ type: 'debug', data: { query: question, rewritten: null, embedder: 'workers-ai', keywordQuery: words(question).join(' OR '), bestVectorScore: best, keywordHits: scored.filter((c) => c.kw).length, gate: sel.length ? 'pass' : 'refuse', candidates: scored.slice(0, 10).map((c) => ({ label: c.label, idx: c.idx, vScore: c.score, kRank: c.kw ? 1 : undefined, rrf: 0, selected: sel.includes(c) })), timings: { vector: 3, keyword: 2, total: 6 } } });
  const sources = sel.map((c, i) => ({ number: i + 1, label: c.label, document: file.name, snippet: c.text.slice(0, 280), score: c.score }));
  emit({ type: 'sources', items: sources });
  const text = sel.length
    ? `${sel[0].text.split(/(?<=[.!?])\s/).slice(0, 2).join(' ')} [1]${sel[1] ? (lang === 'en' ? `\n\nRelated details are in **${sel[1].label}** [2].` : `\n\nInformasi terkait juga ada di bagian **${sel[1].label}** [2].`) : ''}\n\n${lang === 'en' ? '*(Mock mode: stitched from the top chunk, not written by Gemini.)*' : '*(Mode mock: jawaban disusun dari potongan teratas, bukan dari Gemini.)*'}`
    : lang === 'en' ? s.refusalMessageEn : s.refusalMessage;
  for (const w of text.split(/(?<= )/)) { emit({ type: 'delta', text: w }); await new Promise((r) => setTimeout(r, 18)); }
  emit({ type: 'done', refused: !sel.length, provider: 'mock', model: 'keyword-overlap', ms: Date.now() - t0 });
  if (s.logQuestions) logs.unshift({ id: logs.length + 1, created_at: new Date().toISOString().slice(0, 19).replace('T', ' '), source, question, answer: text, refused: sel.length ? 0 : 1, failed: 0, provider: 'mock', best_score: best });
  res.end();
}

function info(lang) {
  lang = lang === 'en' || lang === 'id' ? lang : settings.language;
  const en = lang === 'en';
  const ready = file?.status === 'selesai';
  const n = settings.name;
  const manual = en ? settings.suggestionsEn : settings.suggestions;
  return {
    name: n, lang, defaultLang: settings.language, ready, document: ready ? file.name : null,
    subtitle: ready ? (en ? `Answers from ${file.name}` : `Menjawab dari ${file.name}`) : en ? 'Getting ready' : 'Sedang disiapkan',
    greeting: (en ? settings.greetingEn : settings.greeting) || (ready
      ? (en ? `Hi, I'm **${n}**. Ask me anything about **${file.name}** and I'll answer from the document, with sources.` : `Hai, aku **${n}**. Tanyakan apa saja tentang **${file.name}**, nanti kujawab berdasarkan isi dokumennya lengkap dengan sumbernya.`)
      : (en ? `Hi, I'm **${n}**. My reference document is still being prepared, so I can't answer questions yet.` : `Hai, aku **${n}**. Dokumen referensiku sedang disiapkan, jadi untuk sementara aku belum bisa menjawab pertanyaan.`)),
    suggestions: manual.length ? manual : ready ? suggestions[lang] : [],
    themeColor: settings.themeColor, launcherLabel: (en ? settings.launcherLabelEn : settings.launcherLabel) || (en ? `Ask ${n}` : /^tanya/i.test(n) ? n : `Tanya ${n}`),
    maxQuestionLength: settings.limits.maxQuestionLength, maxHistory: settings.limits.maxHistory,
  };
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }

  if (p === '/api/public/info' || p === '/api/bot/info') return send(res, info(url.searchParams.get('lang')), 200, cors);
  if ((p === '/api/public/chat' || p === '/api/chat') && req.method === 'POST') {
    const b = await body(req);
    if (b.website) return send(res, { error: b.lang === 'en' ? 'Request rejected.' : 'Permintaan ditolak.' }, 400, cors);
    return streamAnswer(res, String(b.question || '').trim(), settings, false, 'widget', b.lang === 'en' || b.lang === 'id' ? b.lang : settings.language);
  }

  if (p.startsWith('/api/admin/')) {
    if ((req.headers.authorization || '') !== 'Bearer ' + PASSWORD) return send(res, { error: req.headers['x-lang'] === 'en' ? 'Wrong admin password.' : 'Kata sandi admin salah.' }, 401);
    const b = req.method === 'POST' ? await body(req) : {};
    if (p === '/api/admin/channels') {
      const base = `http://localhost:${PORT}`;
      return send(res, { telegram: { configured: false, webhookUrl: `${base}/api/channels/telegram` }, whatsapp: { configured: false, webhookUrl: `${base}/api/channels/whatsapp`, missing: ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_APP_SECRET', 'WHATSAPP_VERIFY_TOKEN'] } });
    }
    if (p === '/api/admin/status') {
      const w = logs.filter((l) => l.source === 'widget');
      return send(res, { bindings: { db: true, vectorize: true, ai: true }, file, botName: settings.name, weakPassword: PASSWORD.length < 12, keys: keyStatus(), chain: chain(), embedderForNextUpload: keys.gemini ? 'gemini' : 'workers-ai', stats: { total: w.length, refused: w.filter((l) => l.refused).length, failed: 0 } });
    }
    if (p === '/api/admin/config' && req.method === 'GET') return send(res, { settings, defaults: { settings: DEFAULTS, layers: LAYERS }, keys: keyStatus(), providers: PROVIDERS.map(([id, name]) => ({ id, name })), workersAiModels: ['@cf/zai-org/glm-4.7-flash', '@cf/meta/llama-3.1-8b-instruct-fast'] });
    if (p === '/api/admin/config') {
      if (b.settings) settings = { ...DEFAULTS, ...b.settings, rag: { ...DEFAULTS.rag, ...b.settings.rag }, limits: { ...DEFAULTS.limits, ...b.settings.limits }, prompt: { ...LAYERS, ...b.settings.prompt } };
      for (const [id, v] of Object.entries(b.keys || {})) { if (v) keys[id] = v; else delete keys[id]; }
      return send(res, { success: true, settings, keys: keyStatus() });
    }
    if (p === '/api/admin/prompt-preview') { const s = b.settings || settings; return send(res, { system: buildSystem(s), user: '<knowledge>\n[1] Contoh Bab › Contoh Subbab\n(Potongan dokumen hasil pencarian akan muncul di sini.)\n</knowledge>\n\n<question>\nContoh pertanyaan pengunjung?\n</question>', chars: buildSystem(s).length }); }
    if (p === '/api/admin/test-provider') return send(res, b.provider === 'workers-ai' || keys[b.provider] ? { ok: true, ms: 420, reply: 'siap' } : { ok: false, ms: 5, error: 'Kunci belum diatur' });
    if (p === '/api/admin/file' && req.method === 'POST') {
      if (file) return send(res, { error: 'Sudah ada dokumen aktif. Hapus dulu sebelum mengunggah yang baru.' }, 409);
      file = { id: 'mock', name: b.name, status: 'diproses', chunk_count: 0, error: null, created_at: new Date().toISOString().slice(0, 19).replace('T', ' '), embedder: keys.gemini ? 'gemini' : 'workers-ai' };
      chunks = [];
      return send(res, { success: true, id: file.id, name: file.name, embedder: file.embedder });
    }
    if (p === '/api/admin/file/chunks') { b.chunks.forEach((c, i) => chunks.push({ idx: b.startIdx + i, label: c.label, text: c.text })); file.chunk_count = chunks.length; await new Promise((r) => setTimeout(r, 150)); return send(res, { success: true, count: b.chunks.length }); }
    if (p === '/api/admin/file/done') {
      file.status = 'selesai';
      const heads = [...new Set(chunks.map((c) => c.label.split(' (')[0].split(' › ').pop()))].filter((l) => !/^Bagian \d+$/.test(l)).slice(0, 4);
      suggestions = { id: heads.map((l) => `Apa yang dibahas di bagian "${l}"?`), en: heads.map((l) => `What does the "${l}" section cover?`) };
      return send(res, { success: true, chunkCount: chunks.length, suggestions });
    }
    if (p === '/api/admin/file' && req.method === 'DELETE') { const n = chunks.length; file = null; chunks = []; suggestions = { id: [], en: [] }; return send(res, { success: true, removed: n }); }
    if (p === '/api/admin/chunks') {
      const q = (url.searchParams.get('q') || '').toLowerCase(); const off = Number(url.searchParams.get('offset') || 0);
      return send(res, { items: (q ? chunks.filter((c) => (c.label + c.text).toLowerCase().includes(q)) : chunks.slice(off)).slice(0, 30) });
    }
    if (p === '/api/admin/suggestions/regenerate') return send(res, { suggestions });
    if (p === '/api/admin/test-chat') return streamAnswer(res, String(b.question || '').trim(), b.settings || settings, true, 'admin', b.lang === 'en' ? 'en' : 'id');
    if (p === '/api/admin/logs' && req.method === 'GET') {
      const f = url.searchParams.get('filter');
      return send(res, { items: logs.filter((l) => (f === 'refused' ? l.refused : f === 'failed' ? l.failed : f === 'admin' ? l.source === 'admin' : f === 'widget' ? l.source === 'widget' : true)) });
    }
    if (p === '/api/admin/logs') { logs.length = 0; return send(res, { success: true }); }
    return send(res, { error: 'Endpoint tidak ditemukan.' }, 404);
  }

  const fp = path.join(ROOT, p === '/' ? 'index.html' : path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
  if (fp.startsWith(ROOT) && fs.existsSync(fp) && fs.statSync(fp).isFile()) {
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(fp)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type + '; charset=utf-8' });
    return fs.createReadStream(fp).pipe(res);
  }
  res.writeHead(404); res.end('Not found');
}).listen(PORT, process.env.HOST || '127.0.0.1', () => console.log(`Mock MeetNaraBot: http://localhost:${PORT}  ·  dashboard /admin.html  ·  kata sandi: ${PASSWORD === 'dev' ? 'dev (ubah dengan ADMIN_PASSWORD=...)' : '(dari ADMIN_PASSWORD)'}`));
