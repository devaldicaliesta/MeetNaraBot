import { Hono, type Context } from 'hono';
import type { Bindings, ChatEvent } from './types';
import {
  PROVIDERS,
  DEFAULT_SETTINGS,
  DEFAULT_LAYERS,
  KEYED_PROVIDERS,
  WORKERS_AI_PRIMARY,
  WORKERS_AI_BACKUP,
  getSettings,
  getKeys,
  keyStatus,
  normalizeSettings,
  writeSetting,
  deleteSetting,
  getSuggestions,
  asLang,
  type Lang,
  type Embedder,
  type KeyStore,
  type ProviderId,
} from './settings';
import { answer, buildSystemPrompt, buildUserTurn, generateSuggestions, normalizeHistory } from './rag';
import { buildChain, embed, pickEmbedder } from './llm';

type Env = { Bindings: Bindings };
type FileRow = { id: string; name: string; status: string; chunk_count: number; error: string | null; created_at: string; embedder: Embedder | null };

const app = new Hono<Env>();

/* ------------------------------------------------------------------ */
/*  Helpers                                                              */
/* ------------------------------------------------------------------ */

// Per-isolate memory: good enough to stop casual abuse on the free tier.
const hits = new Map<string, { n: number; reset: number }>();
function allow(key: string, max: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const rec = hits.get(key);
  if (!rec || now > rec.reset) {
    hits.set(key, { n: 1, reset: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
    return true;
  }
  if (rec.n >= max) return false;
  rec.n++;
  return true;
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ha = enc.encode(a);
  const hb = enc.encode(b);
  if (ha.byteLength !== hb.byteLength) {
    crypto.subtle.timingSafeEqual(ha, ha);
    return false;
  }
  return crypto.subtle.timingSafeEqual(ha, hb);
}

const ip = (c: Context<Env>) => c.req.header('cf-connecting-ip') || 'local';

/** Admin/dashboard messages follow the dashboard's X-Lang header (default Indonesian). */
const tr = (c: Context<Env>, id: string, en: string) => ((c.req.header('X-Lang') || c.req.query('lang')) === 'en' ? en : id);

/** Visitor-facing server messages in both languages. */
const MSG = {
  origin: { id: 'Domain ini belum diizinkan memakai chatbot. Tambahkan di dashboard → Pasang widget.', en: 'This domain is not allowed to use the chatbot yet. Add it in the dashboard → Embed widget.' },
  rejected: { id: 'Permintaan ditolak.', en: 'Request rejected.' },
  perMinute: { id: 'Terlalu banyak pertanyaan dalam semenit. Tunggu sebentar, lalu coba lagi.', en: 'Too many questions in one minute. Wait a moment, then try again.' },
  empty: { id: 'Pertanyaannya masih kosong. Ketik dulu pertanyaanmu.', en: 'The question is empty. Type your question first.' },
  tooLong: { id: 'Pertanyaan terlalu panjang. Maksimal {n} karakter.', en: 'The question is too long. Maximum {n} characters.' },
  noDoc: { id: '{name} belum punya dokumen referensi. Pemilik situs perlu mengunggahnya dulu.', en: "{name} doesn't have a reference document yet. The site owner needs to upload one first." },
  daily: { id: 'Batas pertanyaan harian sudah tercapai. Coba lagi besok.', en: 'The daily question limit has been reached. Try again tomorrow.' },
} as const;
const msg = (key: keyof typeof MSG, lang: Lang, vars: Record<string, string | number> = {}) =>
  MSG[key][lang].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

async function sha(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Durable daily quota in D1 (survives isolate restarts). IPs are stored only as a
 * salted daily hash. Returns false when either the per-visitor or global cap is hit.
 */
async function dailyQuota(env: Bindings, rawIp: string, perIp: number, total: number): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const ipKey = 'ip:' + (await sha(`${day}|${rawIp}|${env.ADMIN_PASSWORD || ''}`));
  try {
    const bump = (key: string) =>
      env.DB.prepare('INSERT INTO usage (day, key, n) VALUES (?, ?, 1) ON CONFLICT(day, key) DO UPDATE SET n = n + 1 RETURNING n').bind(day, key);
    const [a, b] = await env.DB.batch<{ n: number }>([bump(ipKey), bump('total')]);
    if (Math.random() < 0.02) await env.DB.prepare("DELETE FROM usage WHERE day < date('now', '-3 days')").run();
    return (a.results?.[0]?.n ?? 0) <= perIp && (b.results?.[0]?.n ?? 0) <= total;
  } catch {
    return true; // jangan blokir pengunjung hanya karena tabel kuota bermasalah
  }
}

async function activeFile(db: D1Database): Promise<FileRow | null> {
  return db.prepare('SELECT id, name, status, chunk_count, error, created_at, embedder FROM file LIMIT 1').first<FileRow>();
}

function envOrigins(env: Bindings): string[] {
  const raw = env.ALLOWED_ORIGINS;
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

/** NDJSON streaming response helper (used by public chat and admin playground). */
function ndjson(c: Context<Env>, run: (emit: (e: ChatEvent) => Promise<void>) => Promise<void>, extraHeaders: Record<string, string> = {}) {
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const enc = new TextEncoder();
  const emit = async (e: ChatEvent) => {
    try {
      await writer.write(enc.encode(JSON.stringify(e) + '\n'));
    } catch {
      /* klien menutup koneksi */
    }
  };
  const task = run(emit)
    .catch(async (err) => {
      console.error('chat pipeline error', err);
      await emit({ type: 'error', message: tr(c, "Terjadi galat di server saat menyusun jawaban.", "The server hit an error while composing the answer.") });
    })
    .finally(() => writer.close().catch(() => {}));
  c.executionCtx.waitUntil(task);
  return new Response(readable, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Public API (CORS)                                                    */
/* ------------------------------------------------------------------ */

app.use('/api/public/*', async (c, next) => {
  const origin = c.req.header('Origin');
  const self = new URL(c.req.url).origin;
  const settings = await getSettings(c.env);
  const allowed = [...envOrigins(c.env), ...settings.allowedOrigins].map((o) => o.toLowerCase());
  const ok = !origin || origin === self || allowed.length === 0 || allowed.includes(origin.toLowerCase());
  const cors: Record<string, string> = ok && origin
    ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
      }
    : {};
  if (c.req.method === 'OPTIONS') return new Response(null, { status: ok ? 204 : 403, headers: cors });
  if (!ok) return c.json({ error: msg('origin', asLang(c.req.query('lang'), settings.language)) }, 403);
  await next();
  for (const [k, v] of Object.entries(cors)) c.res.headers.set(k, v);
});

app.get('/api/public/info', async (c) => {
  const settings = await getSettings(c.env);
  const file = await activeFile(c.env.DB);
  const ready = file?.status === 'selesai';
  const lang = asLang(c.req.query('lang'), settings.language);
  const en = lang === 'en';
  const auto = ready ? await getSuggestions(c.env) : { id: [], en: [] };
  const manual = en ? settings.suggestionsEn : settings.suggestions;
  // Manual list in the requested language → auto list in that language → the other language as a last resort.
  const suggestions = manual.length ? manual : (en ? auto.en : auto.id).length ? (en ? auto.en : auto.id) : en ? settings.suggestions : settings.suggestionsEn;
  const name = settings.name;
  const greeting =
    (en ? settings.greetingEn : settings.greeting).trim() ||
    (ready
      ? en
        ? `Hi, I'm **${name}**. Ask me anything about **${file!.name}** and I'll answer from the document, with sources.`
        : `Hai, aku **${name}**. Tanyakan apa saja tentang **${file!.name}**, nanti kujawab berdasarkan isi dokumennya lengkap dengan sumbernya.`
      : en
        ? `Hi, I'm **${name}**. My reference document is still being prepared, so I can't answer questions yet.`
        : `Hai, aku **${name}**. Dokumen referensiku sedang disiapkan, jadi untuk sementara aku belum bisa menjawab pertanyaan.`);
  const label = (en ? settings.launcherLabelEn : settings.launcherLabel) || (en ? `Ask ${name}` : /^tanya/i.test(name) ? name : `Tanya ${name}`);
  c.header('Cache-Control', 'public, max-age=30');
  c.header('Vary', 'Origin, Accept-Language');
  return c.json({
    name,
    lang,
    defaultLang: settings.language,
    ready,
    document: ready ? file!.name : null,
    subtitle: ready ? (en ? `Answers from ${file!.name}` : `Menjawab dari ${file!.name}`) : en ? 'Getting ready' : 'Sedang disiapkan',
    greeting,
    suggestions,
    themeColor: settings.themeColor,
    launcherLabel: label,
    maxQuestionLength: settings.limits.maxQuestionLength,
    maxHistory: settings.limits.maxHistory,
  });
});

app.post('/api/public/chat', async (c) => {
  const settings = await getSettings(c.env);
  const wantsStream = (c.req.header('Accept') || '').includes('ndjson');
  const body = await c.req.json<{ question?: string; history?: unknown; website?: string; lang?: string }>().catch(() => ({} as any));
  const question = String(body.question || '').trim();
  const lang = asLang(body.lang, settings.language);

  const fail = (message: string, status: 400 | 429 | 503) =>
    wantsStream ? ndjson(c, async (emit) => emit({ type: 'error', message })) : c.json({ error: message }, status);

  // Anti-bot: the widget's hidden honeypot field must stay empty and real browsers send a User-Agent.
  if ((typeof body.website === 'string' && body.website) || !c.req.header('User-Agent')) return fail(msg('rejected', lang), 400);
  if (!allow(`chat:${ip(c)}`, settings.limits.requestsPerMinute)) return fail(msg('perMinute', lang), 429);
  if (!question) return fail(msg('empty', lang), 400);
  if (question.length > settings.limits.maxQuestionLength) return fail(msg('tooLong', lang, { n: settings.limits.maxQuestionLength }), 400);

  const file = await activeFile(c.env.DB);
  if (!file || file.status !== 'selesai') return fail(msg('noDoc', lang, { name: settings.name }), 503);

  if (!(await dailyQuota(c.env, ip(c), settings.limits.dailyPerIp, settings.limits.dailyTotal))) return fail(msg('daily', lang), 429);

  const history = normalizeHistory(body.history, settings.limits.maxHistory);
  const run = async (emit: (e: ChatEvent) => Promise<void>) => {
    const res = await answer({ env: c.env, settings, question, history, file: { name: file.name, embedder: file.embedder || 'workers-ai' }, lang, debug: false, emit });
    if (settings.logQuestions) await logChat(c.env.DB, 'widget', question, res);
  };

  if (wantsStream) return ndjson(c, run);

  // Plain JSON fallback (curl, integrations)
  let text = '';
  let sources: unknown[] = [];
  let refused = false;
  let error: string | null = null;
  await run(async (e) => {
    if (e.type === 'delta') text += e.text;
    else if (e.type === 'sources') sources = e.items;
    else if (e.type === 'done') refused = e.refused;
    else if (e.type === 'error') error = e.message;
  });
  if (error) return c.json({ error }, 503);
  return c.json({ answer: text, sources, refused });
});

// Backwards-compatible aliases for widgets installed with v1.
app.all('/api/chat', (c) => app.fetch(new Request(new URL('/api/public/chat', c.req.url), c.req.raw), c.env, c.executionCtx));
app.get('/api/bot/info', (c) => app.fetch(new Request(new URL('/api/public/info' + new URL(c.req.url).search, c.req.url), c.req.raw), c.env, c.executionCtx));

async function logChat(db: D1Database, source: string, question: string, res: { refused: boolean; text: string; bestScore: number; provider: string | null; error?: boolean }) {
  try {
    await db
      .prepare('INSERT INTO chat_log (source, question, answer, refused, failed, provider, best_score) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(source, question.slice(0, 1000), res.text.slice(0, 2000), res.refused ? 1 : 0, res.error ? 1 : 0, res.provider, res.bestScore)
      .run();
    if (Math.random() < 0.05) await db.prepare('DELETE FROM chat_log WHERE id <= (SELECT MAX(id) - 3000 FROM chat_log)').run();
  } catch (e) {
    console.error('log failed', e);
  }
}

app.get('/api/health', async (c) => {
  const file = await activeFile(c.env.DB).catch(() => null);
  return c.json({ ok: true, ready: file?.status === 'selesai', bindings: { db: !!c.env.DB, vectorize: !!c.env.VECTORIZE, ai: !!c.env.AI } });
});

/* ------------------------------------------------------------------ */
/*  Admin API                                                            */
/* ------------------------------------------------------------------ */

app.use('/api/admin/*', async (c, next) => {
  if (!c.env.ADMIN_PASSWORD) {
    return c.json({ error: tr(c, "ADMIN_PASSWORD belum diset. Jalankan: npx wrangler secret put ADMIN_PASSWORD", "ADMIN_PASSWORD is not set. Run: npx wrangler secret put ADMIN_PASSWORD") }, 503);
  }
  const auth = c.req.header('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !timingSafeEqual(token, c.env.ADMIN_PASSWORD)) {
    if (!allow(`login-fail:${ip(c)}`, 8)) return c.json({ error: tr(c, "Terlalu banyak percobaan masuk. Tunggu 1 menit.", "Too many sign-in attempts. Wait 1 minute.") }, 429);
    return c.json({ error: tr(c, "Kata sandi admin salah.", "Wrong admin password.") }, 401);
  }
  await next();
});

app.get('/api/admin/status', async (c) => {
  const [settings, keys, file] = await Promise.all([getSettings(c.env), getKeys(c.env), activeFile(c.env.DB)]);
  const stats = await c.env.DB.prepare(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(refused), 0) AS refused,
            COALESCE(SUM(failed), 0) AS failed
       FROM chat_log WHERE source = 'widget' AND created_at >= datetime('now', '-7 days')`
  )
    .first<{ total: number; refused: number; failed: number }>()
    .catch(() => ({ total: 0, refused: 0, failed: 0 }));
  return c.json({
    bindings: { db: !!c.env.DB, vectorize: !!c.env.VECTORIZE, ai: !!c.env.AI },
    file,
    botName: settings.name,
    keys: keyStatus(c.env, keys),
    chain: buildChain(settings),
    embedderForNextUpload: (() => {
      try {
        return pickEmbedder(c.env, keys, settings);
      } catch (e: any) {
        return `error: ${e.message}`;
      }
    })(),
    stats,
  });
});

app.get('/api/admin/config', async (c) => {
  const [settings, keys] = await Promise.all([getSettings(c.env), getKeys(c.env)]);
  return c.json({
    settings,
    defaults: { settings: DEFAULT_SETTINGS, layers: DEFAULT_LAYERS },
    keys: keyStatus(c.env, keys),
    providers: Object.entries(PROVIDERS).map(([id, p]) => ({ id, name: p.name })),
    workersAiModels: [WORKERS_AI_PRIMARY, WORKERS_AI_BACKUP],
  });
});

app.post('/api/admin/config', async (c) => {
  const body = await c.req.json<{ settings?: unknown; keys?: Record<string, string | null> }>().catch(() => null);
  if (!body || typeof body !== 'object') return c.json({ error: tr(c, "Data pengaturan tidak valid.", "Invalid settings data.") }, 400);
  if (body.settings) await writeSetting(c.env.DB, 'bot', normalizeSettings(body.settings));
  if (body.keys && typeof body.keys === 'object') {
    const current: KeyStore = await getKeys(c.env);
    for (const [id, value] of Object.entries(body.keys)) {
      if (!(KEYED_PROVIDERS as string[]).includes(id)) continue;
      if (value === null || value === '') delete current[id as ProviderId];
      else if (typeof value === 'string' && value.trim().length >= 8) current[id as ProviderId] = value.trim();
    }
    await writeSetting(c.env.DB, 'keys', current);
  }
  const [settings, keys] = await Promise.all([getSettings(c.env), getKeys(c.env)]);
  return c.json({ success: true, settings, keys: keyStatus(c.env, keys) });
});

/** Shows the exact assembled 7-layer prompt (with sample knowledge) for review. */
app.post('/api/admin/prompt-preview', async (c) => {
  const body = await c.req.json<{ settings?: unknown }>().catch(() => ({} as any));
  const settings = body.settings ? normalizeSettings(body.settings) : await getSettings(c.env);
  const file = await activeFile(c.env.DB);
  const system = buildSystemPrompt(settings, file?.name || 'dokumen-contoh.md');
  const user = buildUserTurn(
    [{ label: 'Contoh Bab › Contoh Subbab', text: '(Potongan dokumen hasil pencarian akan muncul di sini.)', score: 1, idx: 0 }],
    'Contoh pertanyaan pengunjung?'
  );
  return c.json({ system, user, chars: system.length });
});

app.post('/api/admin/test-provider', async (c) => {
  const { provider, model } = await c.req.json<{ provider: ProviderId; model: string }>().catch(() => ({} as any));
  if (!provider || !(provider in PROVIDERS) || !model) return c.json({ error: tr(c, "Pilih penyedia dan model.", "Choose a provider and a model.") }, 400);
  const settings = normalizeSettings({ ...(await getSettings(c.env)), chain: [{ provider, model }], workersAiFallback: false, maxTokens: 128 });
  const keys = await getKeys(c.env);
  const t = Date.now();
  try {
    const { streamChat } = await import('./llm');
    const out = await streamChat(c.env, keys, settings, [{ role: 'user', content: 'Balas dengan satu kata: siap' }], () => {});
    return c.json({ ok: true, ms: Date.now() - t, reply: out.text.slice(0, 80) });
  } catch (e: any) {
    return c.json({ ok: false, ms: Date.now() - t, error: e?.failed?.[0]?.message || e?.message || 'gagal' });
  }
});

/* ---------- Document ingestion (chunked in the browser) ---------- */

app.post('/api/admin/file', async (c) => {
  const body = await c.req.json<{ name?: string }>().catch(() => ({} as any));
  if (await activeFile(c.env.DB)) return c.json({ error: tr(c, "Sudah ada dokumen aktif. Hapus dulu sebelum mengunggah yang baru.", "A document is already active. Delete it before uploading a new one.") }, 409);
  const [settings, keys] = await Promise.all([getSettings(c.env), getKeys(c.env)]);
  let embedder: Embedder;
  try {
    embedder = pickEmbedder(c.env, keys, settings);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
  const id = crypto.randomUUID();
  const name = String(body.name || 'dokumen.txt').replace(/[\r\n]/g, ' ').slice(0, 200);
  await c.env.DB.prepare('INSERT INTO file (id, name, status, chunk_count, embedder) VALUES (?, ?, ?, 0, ?)').bind(id, name, 'diproses', embedder).run();
  return c.json({ success: true, id, name, embedder });
});

app.post('/api/admin/file/chunks', async (c) => {
  const body = await c.req.json<{ startIdx: number; chunks: Array<{ text: string; label: string; overlap?: string }> }>().catch(() => null);
  if (!body || !Array.isArray(body.chunks) || body.chunks.length < 1 || body.chunks.length > 20) return c.json({ error: tr(c, "Satu batch harus berisi 1–20 potongan.", "A batch must contain 1\u201320 chunks.") }, 400);
  if (!Number.isInteger(body.startIdx) || body.startIdx < 0) return c.json({ error: tr(c, "startIdx tidak valid.", "Invalid startIdx.") }, 400);
  for (const ch of body.chunks) {
    if (typeof ch.text !== 'string' || !ch.text.trim() || ch.text.length > 4000) return c.json({ error: tr(c, "Tiap potongan harus berisi 1–4.000 karakter.", "Each chunk must be 1\u20134,000 characters.") }, 400);
    if (typeof ch.label !== 'string') ch.label = 'Bagian';
  }
  const file = await activeFile(c.env.DB);
  if (!file || file.status !== 'diproses') return c.json({ error: tr(c, "Tidak ada dokumen yang sedang diproses.", "No document is being processed.") }, 400);

  const keys = await getKeys(c.env);
  try {
    // Embed with heading breadcrumb + overlap so each vector carries its context.
    const inputs = body.chunks.map((ch) => `${ch.label}\n${ch.overlap ? ch.overlap.slice(-500) + ' ' : ''}${ch.text}`);
    const vectors = await embed(c.env, keys, file.embedder || 'workers-ai', inputs, 'document');
    const entries = body.chunks.map((ch, i) => ({ id: `${file.id.slice(0, 8)}-${body.startIdx + i}`, values: vectors[i], metadata: { idx: body.startIdx + i } }));

    const stmts: D1PreparedStatement[] = [];
    body.chunks.forEach((ch, i) => {
      const id = entries[i].id;
      const label = ch.label.slice(0, 200);
      stmts.push(c.env.DB.prepare('INSERT OR REPLACE INTO chunks (id, idx, label, text) VALUES (?, ?, ?, ?)').bind(id, body.startIdx + i, label, ch.text));
      stmts.push(c.env.DB.prepare('DELETE FROM chunks_fts WHERE chunk_id = ?').bind(id));
      stmts.push(c.env.DB.prepare('INSERT INTO chunks_fts (chunk_id, label, text) VALUES (?, ?, ?)').bind(id, label, ch.text));
    });
    await c.env.DB.batch(stmts);
    await c.env.VECTORIZE.upsert(entries);
    return c.json({ success: true, count: entries.length });
  } catch (err: any) {
    return c.json({ error: err?.message || 'Gagal membuat embedding.' }, 502);
  }
});

app.post('/api/admin/file/done', async (c) => {
  const file = await activeFile(c.env.DB);
  if (!file) return c.json({ error: tr(c, "Tidak ada dokumen.", "No document.") }, 400);
  const total = (await c.env.DB.prepare('SELECT COUNT(*) AS n FROM chunks').first<{ n: number }>())?.n || 0;
  if (!total) return c.json({ error: tr(c, "Belum ada potongan tersimpan.", "No chunks have been saved yet.") }, 400);
  await c.env.DB.prepare('UPDATE file SET status = ?, chunk_count = ?, error = NULL WHERE id = ?').bind('selesai', total, file.id).run();
  const settings = await getSettings(c.env);
  const suggestions = await generateSuggestions(c.env, settings, file.name);
  await writeSetting(c.env.DB, 'auto_suggestions', suggestions);
  return c.json({ success: true, chunkCount: total, suggestions });
});

app.delete('/api/admin/file', async (c) => {
  const ids = await c.env.DB.prepare('SELECT id FROM chunks').all<{ id: string }>();
  const list = (ids.results || []).map((r) => r.id);
  for (let i = 0; i < list.length; i += 500) await c.env.VECTORIZE.deleteByIds(list.slice(i, i + 500));
  await c.env.DB.batch([c.env.DB.prepare('DELETE FROM chunks'), c.env.DB.prepare('DELETE FROM chunks_fts'), c.env.DB.prepare('DELETE FROM file')]);
  await deleteSetting(c.env.DB, 'auto_suggestions');
  return c.json({ success: true, removed: list.length });
});

app.get('/api/admin/chunks', async (c) => {
  const offset = Math.max(0, Number(c.req.query('offset') || 0));
  const q = (c.req.query('q') || '').trim();
  const rows = q
    ? await c.env.DB.prepare('SELECT idx, label, text FROM chunks WHERE text LIKE ? OR label LIKE ? ORDER BY idx LIMIT 30').bind(`%${q}%`, `%${q}%`).all()
    : await c.env.DB.prepare('SELECT idx, label, text FROM chunks ORDER BY idx LIMIT 30 OFFSET ?').bind(offset).all();
  return c.json({ items: rows.results || [] });
});

app.post('/api/admin/suggestions/regenerate', async (c) => {
  const file = await activeFile(c.env.DB);
  if (!file || file.status !== 'selesai') return c.json({ error: tr(c, "Belum ada dokumen aktif.", "No active document yet.") }, 400);
  const suggestions = await generateSuggestions(c.env, await getSettings(c.env), file.name);
  await writeSetting(c.env.DB, 'auto_suggestions', suggestions);
  return c.json({ suggestions });
});

/* ---------- Playground with retrieval debug ---------- */

app.post('/api/admin/test-chat', async (c) => {
  const body = await c.req.json<{ question?: string; history?: unknown; settings?: unknown; lang?: string }>().catch(() => ({} as any));
  const question = String(body.question || '').trim();
  // Lets the owner try unsaved RAG/prompt settings before saving them.
  const settings = body.settings ? normalizeSettings(body.settings) : await getSettings(c.env);
  const file = await activeFile(c.env.DB);
  return ndjson(c, async (emit) => {
    if (!question) return emit({ type: 'error', message: tr(c, "Tulis pertanyaan dulu.", "Type a question first.") });
    if (!file || file.status !== 'selesai') return emit({ type: 'error', message: tr(c, "Belum ada dokumen aktif. Unggah dokumen di menu Dokumen.", "No active document yet. Upload one in the Document menu.") });
    const history = normalizeHistory(body.history, settings.limits.maxHistory);
    const res = await answer({ env: c.env, settings, question, history, file: { name: file.name, embedder: file.embedder || 'workers-ai' }, lang: asLang(body.lang, settings.language), debug: true, emit });
    if (settings.logQuestions) await logChat(c.env.DB, 'admin', question, res);
  });
});

/* ---------- Question log ---------- */

app.get('/api/admin/logs', async (c) => {
  const filter = c.req.query('filter');
  const where =
    filter === 'refused' ? 'WHERE refused = 1' : filter === 'failed' ? 'WHERE failed = 1' : filter === 'widget' ? "WHERE source = 'widget'" : filter === 'admin' ? "WHERE source = 'admin'" : '';
  const rows = await c.env.DB.prepare(`SELECT id, created_at, source, question, answer, refused, failed, provider, best_score FROM chat_log ${where} ORDER BY id DESC LIMIT 100`).all();
  return c.json({ items: rows.results || [] });
});

app.delete('/api/admin/logs', async (c) => {
  await c.env.DB.prepare('DELETE FROM chat_log').run();
  return c.json({ success: true });
});

app.notFound((c) => (c.req.path.startsWith('/api/') ? c.json({ error: tr(c, "Endpoint tidak ditemukan.", "Endpoint not found.") }, 404) : c.env.ASSETS.fetch(c.req.raw)));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: tr(c, "Galat server. Cek log Worker dengan `npx wrangler tail`.", "Server error. Check the Worker logs with `npx wrangler tail`.") }, 500);
});

export default app;
