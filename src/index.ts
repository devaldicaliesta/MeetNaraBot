import { Hono, type Context } from 'hono';
import type { AppEnv, Bindings, ChatEvent } from './types';
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
  settingKey,
  tenantEnv,
  getSuggestions,
  getSalt,
  asLang,
  type Lang,
  type BotSettings,
  type Embedder,
  type KeyStore,
  type ProviderId,
} from './settings';
import { cacheStats, clearCache, purgeExpiredCache } from './cache';
import { answer, buildSystemPrompt, buildUserTurn, generateSuggestions, normalizeHistory } from './rag';
import { buildChain, embed, pickEmbedder } from './llm';
import { channelRoutes } from './channels';
import {
  ACCOUNT_DAYS,
  DEFAULT_BOT,
  MAX_BOTS_PER_USER,
  MIN_PASSWORD,
  botStatus,
  createBot,
  createSession,
  createUser,
  endSession,
  listBots,
  normalizeEmail,
  ownedBot,
  passwordProblem,
  sessionUser,
  verifyLogin,
} from './auth';

type Env = AppEnv;
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

/** Constant-time comparison of SHA-256 digests, so neither content nor length leaks through timing. */
async function secretEquals(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

/** Request bodies larger than this are rejected before parsing (public chat, admin API). */
const MAX_PUBLIC_BODY = 32 * 1024;
const MAX_ADMIN_BODY = 512 * 1024;
const MAX_AUTH_BODY = 4 * 1024;
const tooLarge = (c: Context<Env>, max: number) => Number(c.req.header('Content-Length') || 0) > max;

/** Daily question cap shared by all user bots together (the platform bot has its own settings). */
const platformDailyTotal = (env: Bindings) => Math.max(100, Number(env.PLATFORM_DAILY_TOTAL) || 5000);
const signupsPerDay = (env: Bindings) => Math.max(1, Number(env.MAX_SIGNUPS_PER_DAY) || 200);
/** Chunks user bots may embed with the platform's free Workers AI per day, all users together. */
const platformDailyEmbeds = (env: Bindings) => Math.max(100, Number(env.PLATFORM_DAILY_EMBEDS) || 4000);
/** Largest document (in chunks) a user bot may index. */
const USER_BOT_MAX_CHUNKS = 400;

/** Counts work that spends the platform's shared Workers AI budget; false when today's budget is used up. */
async function spendPlatform(env: Bindings, key: string, amount: number, limit: number): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  try {
    const row = await env.DB.prepare('INSERT INTO usage (day, key, n) VALUES (?, ?, ?) ON CONFLICT(day, key) DO UPDATE SET n = n + excluded.n RETURNING n')
      .bind(day, key, amount)
      .first<{ n: number }>();
    return (row?.n ?? 0) <= limit;
  } catch {
    return true;
  }
}

// Sign-in throttling. Failures are counted durably in D1 (shared by every isolate and data
// centre) per hashed IP and globally, in 10-minute windows, and the lock is checked BEFORE the
// password is compared so a correct guess during a lockout is still refused.
const LOGIN_WINDOW_MIN = 10;
const LOGIN_MAX_PER_IP = 8;
const LOGIN_MAX_GLOBAL = 100;
const loginWindow = () => {
  const now = new Date();
  const slot = Math.floor(now.getUTCMinutes() / LOGIN_WINDOW_MIN);
  return { day: now.toISOString().slice(0, 10), slot: `${now.toISOString().slice(11, 13)}${slot}` };
};
/**
 * Counters for one sign-in attempt. Every attempt counts per IP. Account sign-ins also count per
 * e-mail (so one account cannot be guessed from many IPs); only the platform-admin password has a
 * global counter, so nobody can lock every user out by failing logins on purpose.
 */
async function loginKeys(c: Context<Env>, scope: { email?: string; platform?: boolean }) {
  const { day, slot } = loginWindow();
  const salt = await getSalt(c.env.DB);
  const keys: Array<[string, number]> = [[`lf:${slot}:${await sha(`${salt}|${ip(c)}`)}`, LOGIN_MAX_PER_IP]];
  if (scope.email) keys.push([`lf:${slot}:e:${await sha(`${salt}|${scope.email}`)}`, LOGIN_MAX_PER_IP]);
  if (scope.platform) keys.push([`lf:${slot}:all`, LOGIN_MAX_GLOBAL]);
  return { day, keys };
}
async function loginLocked(c: Context<Env>, scope: { email?: string; platform?: boolean }): Promise<boolean> {
  try {
    const { day, keys } = await loginKeys(c, scope);
    const rows = await c.env.DB.prepare(`SELECT key, n FROM usage WHERE day = ? AND key IN (${keys.map(() => '?').join(',')})`)
      .bind(day, ...keys.map(([k]) => k))
      .all<{ key: string; n: number }>();
    return keys.some(([k, max]) => (rows.results?.find((r) => r.key === k)?.n ?? 0) >= max);
  } catch {
    return false;
  }
}
async function recordLoginFailure(c: Context<Env>, scope: { email?: string; platform?: boolean }) {
  try {
    const { day, keys } = await loginKeys(c, scope);
    await c.env.DB.batch(keys.map(([k]) => c.env.DB.prepare('INSERT INTO usage (day, key, n) VALUES (?, ?, 1) ON CONFLICT(day, key) DO UPDATE SET n = n + 1').bind(day, k)));
  } catch (e) {
    console.error('login failure not recorded', e);
  }
}
const lockedMessage = (c: Context<Env>) =>
  tr(c, `Terlalu banyak percobaan masuk yang salah. Tunggu ${LOGIN_WINDOW_MIN} menit, lalu coba lagi.`, `Too many failed sign-in attempts. Wait ${LOGIN_WINDOW_MIN} minutes, then try again.`);

const ip = (c: Context<Env>) => c.req.header('cf-connecting-ip') || 'local';

/** Admin/dashboard messages follow the dashboard's X-Lang header (default Indonesian). */
const tr = (c: Context<Env>, id: string, en: string) => ((c.req.header('X-Lang') || c.req.query('lang')) === 'en' ? en : id);

/** Visitor-facing server messages in both languages. */
const MSG = {
  origin: { id: 'Domain ini belum diizinkan memakai chatbot. Tambahkan di dashboard → Pasang widget.', en: 'This domain is not allowed to use the chatbot yet. Add it in the dashboard → Embed widget.' },
  rejected: { id: 'Permintaan ditolak.', en: 'Request rejected.' },
  perMinute: { id: 'Wah, pertanyaannya cepat sekali. Tunggu sekitar satu menit, lalu tanyakan lagi, ya.', en: "You're asking faster than I can keep up. Wait about a minute, then ask again." },
  empty: { id: 'Pertanyaannya masih kosong. Ketik dulu pertanyaanmu.', en: 'The question is empty. Type your question first.' },
  tooLong: { id: 'Pertanyaan terlalu panjang. Maksimal {n} karakter.', en: 'The question is too long. Maximum {n} characters.' },
  noDoc: { id: '{name} belum punya dokumen referensi. Pemilik situs perlu mengunggahnya dulu.', en: "{name} doesn't have a reference document yet. The site owner needs to upload one first." },
  daily: { id: 'Maaf, kuota pertanyaan untuk hari ini sudah habis. Silakan kembali besok, aku siap membantu lagi.', en: "Sorry, today's question quota has run out. Please come back tomorrow and I'll be happy to help again." },
  noBot: { id: 'Bot ini tidak ditemukan. Periksa kode widget di website Anda.', en: "This bot doesn't exist. Check the widget code on your website." },
  expired: { id: 'Maaf, bot ini sudah tidak aktif karena masa aktif akun pemiliknya telah berakhir.', en: "Sorry, this bot is no longer active because its owner's account period has ended." },
} as const;
const msg = (key: keyof typeof MSG, lang: Lang, vars: Record<string, string | number> = {}) =>
  MSG[key][lang].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

async function sha(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Durable daily quota in D1 (survives isolate restarts). Visitor IPs/chat ids are stored only as a
 * salted daily hash. Counts per visitor per bot, per bot, and (for user bots) across all user bots.
 */
async function dailyQuota(env: Bindings, rawKey: string, perKey: number, total: number, bot: string): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const visitor = 'ip:' + (await sha(`${day}|${bot}|${rawKey}|${await getSalt(env.DB)}`));
  try {
    const bump = (key: string) =>
      env.DB.prepare('INSERT INTO usage (day, key, n) VALUES (?, ?, 1) ON CONFLICT(day, key) DO UPDATE SET n = n + 1 RETURNING n').bind(day, key);
    const botTotal = bot === DEFAULT_BOT ? 'total' : `total:${bot}`;
    const stmts = [bump(visitor), bump(botTotal), ...(bot === DEFAULT_BOT ? [] : [bump('total:all-users')])];
    const [a, b, p] = await env.DB.batch<{ n: number }>(stmts);
    if (Math.random() < 0.02) await env.DB.prepare("DELETE FROM usage WHERE day < date('now', '-3 days')").run();
    const n = (r?: D1Result<{ n: number }>) => r?.results?.[0]?.n ?? 0;
    return n(a) <= perKey && n(b) <= total && (bot === DEFAULT_BOT || n(p) <= platformDailyTotal(env));
  } catch {
    return true; // jangan blokir pengunjung hanya karena tabel kuota bermasalah
  }
}

async function activeFile(db: D1Database, bot: string): Promise<FileRow | null> {
  return db.prepare('SELECT id, name, status, chunk_count, error, created_at, embedder FROM file WHERE bot_id = ? LIMIT 1').bind(bot).first<FileRow>();
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

/**
 * Deletes vectors by id. Ids that cannot be deleted right now are written to vector_tombstones and
 * retried by the daily cron, so a Vectorize hiccup never blocks deleting a user's data in D1.
 */
async function deleteVectors(env: Bindings, ids: string[]) {
  for (let i = 0; i < ids.length; i += 500) {
    const part = ids.slice(i, i + 500);
    try {
      await env.VECTORIZE.deleteByIds(part);
    } catch (e) {
      console.error('vector delete deferred', e);
      await env.DB.batch(part.map((id) => env.DB.prepare('INSERT OR IGNORE INTO vector_tombstones (id) VALUES (?)').bind(id)));
    }
  }
}

async function retryTombstones(env: Bindings) {
  const rows = await env.DB.prepare('SELECT id FROM vector_tombstones LIMIT 1000').all<{ id: string }>();
  const ids = (rows.results || []).map((r) => r.id);
  for (let i = 0; i < ids.length; i += 500) {
    const part = ids.slice(i, i + 500);
    try {
      await env.VECTORIZE.deleteByIds(part);
      await env.DB.batch(part.map((id) => env.DB.prepare('DELETE FROM vector_tombstones WHERE id = ?').bind(id)));
    } catch (e) {
      console.error('vector tombstones still pending', e);
      return;
    }
  }
}

/** Deletes every trace of a bot: vectors, chunks, keyword index, file, log, settings and the bot row. */
async function purgeBot(env: Bindings, bot: string) {
  const ids = await env.DB.prepare('SELECT id FROM chunks WHERE bot_id = ?').bind(bot).all<{ id: string }>();
  await deleteVectors(env, (ids.results || []).map((r) => r.id));
  await env.DB.batch([
    env.DB.prepare('DELETE FROM chunks WHERE bot_id = ?').bind(bot),
    env.DB.prepare('DELETE FROM chunks_fts WHERE bot_id = ?').bind(bot),
    env.DB.prepare('DELETE FROM file WHERE bot_id = ?').bind(bot),
    env.DB.prepare('DELETE FROM chat_log WHERE bot_id = ?').bind(bot),
    env.DB.prepare('DELETE FROM answer_cache WHERE bot_id = ?').bind(bot),
    env.DB.prepare('DELETE FROM settings WHERE key IN (?, ?, ?)').bind(settingKey('bot', bot), settingKey('keys', bot), settingKey('auto_suggestions', bot)),
    env.DB.prepare('DELETE FROM bots WHERE id = ?').bind(bot),
  ]);
}

/** Daily cleanup: delete accounts whose active period ended, with all of their bots and data. */
async function purgeExpiredAccounts(env: Bindings) {
  const now = new Date().toISOString();
  const users = await env.DB.prepare('SELECT id FROM users WHERE expires_at <= ? LIMIT 25').bind(now).all<{ id: string }>();
  for (const u of users.results || []) {
    for (const b of await listBots(env, u.id)) await purgeBot(env, b.id);
    await env.DB.batch([env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(u.id), env.DB.prepare('DELETE FROM users WHERE id = ?').bind(u.id)]);
  }
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now).run();
  await purgeExpiredCache(env.DB).catch((e) => console.error('cache purge failed', e));
  await retryTombstones(env);
  return (users.results || []).length;
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
/*  Public API (CORS) — the widget passes ?bot=<id>; no id = platform bot */
/* ------------------------------------------------------------------ */

const publicBot = (c: Context<Env>) => (c.req.query('bot') || DEFAULT_BOT).toLowerCase();

app.use('/api/public/*', async (c, next) => {
  const bot = publicBot(c);
  const status = await botStatus(c.env, bot);
  const origin = c.req.header('Origin');
  const settings = status === 'missing' ? DEFAULT_SETTINGS : await getSettings(c.env, bot);
  const lang = asLang(c.req.query('lang'), settings.language);
  const self = new URL(c.req.url).origin;
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
  if (status === 'missing') return c.json({ error: msg('noBot', lang) }, { status: 404, headers: cors });
  if (!ok) return c.json({ error: msg('origin', lang) }, 403);
  c.set('bot', bot);
  await next();
  for (const [k, v] of Object.entries(cors)) c.res.headers.set(k, v);
});

app.get('/api/public/info', async (c) => {
  const bot = c.get('bot');
  const settings = await getSettings(c.env, bot);
  const expired = (await botStatus(c.env, bot)) === 'expired';
  const file = expired ? null : await activeFile(c.env.DB, bot);
  const ready = file?.status === 'selesai';
  const lang = asLang(c.req.query('lang'), settings.language);
  const en = lang === 'en';
  const suggestions = ready ? await visitorSuggestions(c.env, settings, lang, bot) : [];
  const name = settings.name;
  const greeting = expired
    ? msg('expired', lang)
    : (en ? settings.greetingEn : settings.greeting).trim() ||
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
    bot,
    lang,
    defaultLang: settings.language,
    ready,
    document: ready ? file!.name : null,
    subtitle: expired ? (en ? 'Inactive' : 'Tidak aktif') : ready ? (en ? `Answers from ${file!.name}` : `Menjawab dari ${file!.name}`) : en ? 'Getting ready' : 'Sedang disiapkan',
    greeting,
    suggestions,
    themeColor: settings.themeColor,
    launcherLabel: label,
    maxQuestionLength: settings.limits.maxQuestionLength,
    maxHistory: settings.limits.maxHistory,
  });
});

/** Manual list in the requested language → auto list in that language → the other language as a last resort. */
async function visitorSuggestions(env: Bindings, settings: BotSettings, lang: Lang, bot: string): Promise<string[]> {
  const en = lang === 'en';
  const manual = en ? settings.suggestionsEn : settings.suggestions;
  if (manual.length) return manual;
  const auto = await getSuggestions(env, bot);
  const own = en ? auto.en : auto.id;
  return own.length ? own : en ? settings.suggestions : settings.suggestionsEn;
}

app.post('/api/public/chat', async (c) => {
  const bot = c.get('bot');
  const settings = await getSettings(c.env, bot);
  const wantsStream = (c.req.header('Accept') || '').includes('ndjson');
  if (tooLarge(c, MAX_PUBLIC_BODY)) return c.json({ error: msg('rejected', asLang(c.req.query('lang'), settings.language)) }, 413);
  const body = await c.req.json<{ question?: string; history?: unknown; website?: string; lang?: string }>().catch(() => ({} as any));
  const question = String(body.question || '').trim();
  const lang = asLang(body.lang, settings.language);

  const fail = (message: string, status: 400 | 403 | 429 | 503) =>
    wantsStream ? ndjson(c, async (emit) => emit({ type: 'error', message })) : c.json({ error: message }, status);

  // Anti-bot: the widget's hidden honeypot field must stay empty and real browsers send a User-Agent.
  if ((typeof body.website === 'string' && body.website) || !c.req.header('User-Agent')) return fail(msg('rejected', lang), 400);
  if ((await botStatus(c.env, bot)) === 'expired') return fail(msg('expired', lang), 403);
  if (!allow(`chat:${bot}:${ip(c)}`, settings.limits.requestsPerMinute)) return fail(msg('perMinute', lang), 429);
  if (!question) return fail(msg('empty', lang), 400);
  if (question.length > settings.limits.maxQuestionLength) return fail(msg('tooLong', lang, { n: settings.limits.maxQuestionLength }), 400);

  const file = await activeFile(c.env.DB, bot);
  if (!file || file.status !== 'selesai') return fail(msg('noDoc', lang, { name: settings.name }), 503);

  if (!(await dailyQuota(c.env, ip(c), settings.limits.dailyPerIp, settings.limits.dailyTotal, bot))) return fail(msg('daily', lang), 429);

  const history = normalizeHistory(body.history, settings.limits.maxHistory);
  const run = async (emit: (e: ChatEvent) => Promise<void>) => {
    const examples = await visitorSuggestions(c.env, settings, lang, bot).catch(() => []);
    const res = await answer({ env: c.env, settings, question, history, file: { id: file.id, name: file.name, embedder: file.embedder || 'workers-ai' }, lang, debug: false, emit, examples, bot });
    if (settings.logQuestions) await logChat(c.env.DB, 'widget', question, res, bot);
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
app.all('/api/chat', (c) => app.fetch(new Request(new URL('/api/public/chat' + new URL(c.req.url).search, c.req.url), c.req.raw), c.env, c.executionCtx));
app.get('/api/bot/info', (c) => app.fetch(new Request(new URL('/api/public/info' + new URL(c.req.url).search, c.req.url), c.req.raw), c.env, c.executionCtx));

async function logChat(db: D1Database, source: string, question: string, res: { refused: boolean; text: string; bestScore: number; provider: string | null; error?: boolean }, bot: string) {
  try {
    await db
      .prepare('INSERT INTO chat_log (bot_id, source, question, answer, refused, failed, provider, best_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(bot, source, question.slice(0, 1000), res.text.slice(0, 2000), res.refused ? 1 : 0, res.error ? 1 : 0, res.provider, res.bestScore)
      .run();
    if (Math.random() < 0.05) {
      await db.prepare('DELETE FROM chat_log WHERE bot_id = ?1 AND id <= (SELECT MAX(id) - 3000 FROM chat_log WHERE bot_id = ?1)').bind(bot).run();
    }
  } catch (e) {
    console.error('log failed', e);
  }
}

app.get('/api/health', async (c) => {
  const file = await activeFile(c.env.DB, DEFAULT_BOT).catch(() => null);
  return c.json({ ok: true, ready: file?.status === 'selesai', bindings: { db: !!c.env.DB, vectorize: !!c.env.VECTORIZE, ai: !!c.env.AI } });
});

/* ------------------------------------------------------------------ */
/*  Accounts                                                            */
/* ------------------------------------------------------------------ */

const bearer = (c: Context<Env>) => {
  const auth = c.req.header('Authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
};

const passwordMessage = (c: Context<Env>, problem: string) =>
  problem === 'short'
    ? tr(c, `Kata sandi minimal ${MIN_PASSWORD} karakter.`, `The password needs at least ${MIN_PASSWORD} characters.`)
    : problem === 'long'
      ? tr(c, 'Kata sandi terlalu panjang (maksimal 200 karakter).', 'The password is too long (200 characters at most).')
      : tr(c, 'Kata sandi jangan sama dengan atau memuat alamat email Anda.', "Don't use your e-mail address in the password.");

app.use('/api/auth/*', async (c, next) => {
  if (tooLarge(c, MAX_AUTH_BODY)) return c.json({ error: tr(c, 'Data yang dikirim terlalu besar.', 'The request is too large.') }, 413);
  c.header('Cache-Control', 'no-store');
  await next();
});

app.post('/api/auth/signup', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string; name?: string }>().catch(() => ({} as any));
  const email = normalizeEmail(body.email);
  if (!email) return c.json({ error: tr(c, 'Alamat email tidak valid.', 'That e-mail address is not valid.') }, 400);
  const problem = passwordProblem(body.password, email);
  if (problem) return c.json({ error: passwordMessage(c, problem) }, 400);

  // Sign-up throttling: 5 per IP per day and a global daily cap, counted durably in D1.
  const day = new Date().toISOString().slice(0, 10);
  const ipKey = `su:${await sha(`${await getSalt(c.env.DB)}|${ip(c)}`)}`;
  const bump = (key: string) => c.env.DB.prepare('INSERT INTO usage (day, key, n) VALUES (?, ?, 1) ON CONFLICT(day, key) DO UPDATE SET n = n + 1 RETURNING n').bind(day, key);
  const [a, b] = await c.env.DB.batch<{ n: number }>([bump(ipKey), bump('su:all')]);
  if ((a.results?.[0]?.n ?? 0) > 5 || (b.results?.[0]?.n ?? 0) > signupsPerDay(c.env)) {
    return c.json({ error: tr(c, 'Pendaftaran hari ini sudah mencapai batas. Coba lagi besok.', "Today's sign-up limit has been reached. Please try again tomorrow.") }, 429);
  }

  const name = String(body.name || '').trim().replace(/[\r\n<>]/g, '').slice(0, 80) || email.split('@')[0];
  const user = await createUser(c.env, email, String(body.password), name);
  if (!user) return c.json({ error: tr(c, 'Email ini sudah terdaftar. Silakan masuk.', 'This e-mail is already registered. Please sign in.') }, 409);
  const first = await createBot(c.env, user.id, `Bot ${name}`.slice(0, 60));
  const token = await createSession(c.env, user.id);
  return c.json({ token, user, bots: first === 'limit' ? [] : [first], accountDays: ACCOUNT_DAYS }, 201);
});

app.post('/api/auth/login', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>().catch(() => ({} as any));
  const email = normalizeEmail(body.email);
  const scope = { email: email || undefined };
  if (await loginLocked(c, scope)) return c.json({ error: lockedMessage(c) }, 429);
  const password = String(body.password || '');
  const result = email && password.length <= 200 ? await verifyLogin(c.env, email, password) : null;
  if (!result) {
    await recordLoginFailure(c, scope);
    return c.json({ error: tr(c, 'Email atau kata sandi salah.', 'Wrong e-mail or password.') }, 401);
  }
  if (result === 'expired') {
    return c.json({ error: tr(c, `Masa aktif akun ini (${ACCOUNT_DAYS} hari) sudah berakhir. Data akun akan dihapus otomatis; silakan daftar lagi bila perlu.`, `This account's ${ACCOUNT_DAYS}-day period has ended. Its data will be deleted automatically; sign up again if you need to.`) }, 403);
  }
  const token = await createSession(c.env, result.id);
  return c.json({ token, user: result, bots: await listBots(c.env, result.id) });
});

app.post('/api/auth/logout', async (c) => {
  await endSession(c.env, bearer(c));
  return c.json({ success: true });
});

app.get('/api/auth/me', async (c) => {
  const user = await sessionUser(c.env, bearer(c));
  if (!user) return c.json({ error: tr(c, 'Sesi berakhir. Silakan masuk lagi.', 'Your session has ended. Please sign in again.') }, 401);
  return c.json({ user, bots: await listBots(c.env, user.id), maxBots: MAX_BOTS_PER_USER });
});

app.post('/api/auth/bots', async (c) => {
  const user = await sessionUser(c.env, bearer(c));
  if (!user) return c.json({ error: tr(c, 'Sesi berakhir. Silakan masuk lagi.', 'Your session has ended. Please sign in again.') }, 401);
  const body = await c.req.json<{ name?: string }>().catch(() => ({} as any));
  const name = String(body.name || '').trim().replace(/[\r\n<>]/g, '').slice(0, 60) || 'Bot baru';
  const bot = await createBot(c.env, user.id, name);
  if (bot === 'limit') return c.json({ error: tr(c, `Satu akun maksimal punya ${MAX_BOTS_PER_USER} bot.`, `An account can have at most ${MAX_BOTS_PER_USER} bots.`) }, 409);
  await writeSetting(c.env.DB, settingKey('bot', bot.id), normalizeSettings({ ...structuredClone(DEFAULT_SETTINGS), name }));
  return c.json({ bot }, 201);
});

app.delete('/api/auth/bots/:id', async (c) => {
  const user = await sessionUser(c.env, bearer(c));
  if (!user) return c.json({ error: tr(c, 'Sesi berakhir. Silakan masuk lagi.', 'Your session has ended. Please sign in again.') }, 401);
  const bot = await ownedBot(c.env, user.id, c.req.param('id'));
  if (!bot) return c.json({ error: tr(c, 'Bot tidak ditemukan.', 'Bot not found.') }, 404);
  await purgeBot(c.env, bot.id);
  return c.json({ success: true });
});

/* ------------------------------------------------------------------ */
/*  Bot admin API                                                       */
/*  Callers: a signed-in user (session token + X-Bot-Id of a bot they own), */
/*  the platform admin (ADMIN_PASSWORD, platform bot only) or the deploy token. */
/* ------------------------------------------------------------------ */

// Routes the deploy workflow's DEPLOY_TOKEN may call: index the platform document and connect Telegram.
const DEPLOY_ROUTES = /^\/api\/admin\/(status|file(\/chunks|\/done)?|channels\/telegram\/connect)$/;

app.use('/api/admin/*', async (c, next) => {
  const token = bearer(c);
  const finish = async () => {
    if (tooLarge(c, MAX_ADMIN_BODY)) return c.json({ error: tr(c, 'Data yang dikirim terlalu besar.', 'The request is too large.') }, 413);
    c.header('Cache-Control', 'no-store');
    await next();
  };

  // 1) Signed-in user: the bot comes from X-Bot-Id and must be theirs.
  if (token.startsWith('nara_')) {
    const user = await sessionUser(c.env, token);
    if (!user) return c.json({ error: tr(c, 'Sesi berakhir atau masa aktif akun habis. Silakan masuk lagi.', 'Your session or account period has ended. Please sign in again.'), code: 'session' }, 401);
    const bot = await ownedBot(c.env, user.id, String(c.req.header('X-Bot-Id') || ''));
    if (!bot) return c.json({ error: tr(c, 'Bot tidak ditemukan di akun Anda.', 'That bot is not in your account.') }, 403);
    c.set('bot', bot.id);
    c.set('principal', { kind: 'user', user });
    return finish();
  }

  // 2) Deploy token (platform bot only, narrow route list).
  const deploy = c.env.DEPLOY_TOKEN;
  if (deploy && deploy.length >= 32 && token && DEPLOY_ROUTES.test(c.req.path) && (await secretEquals(token, deploy))) {
    c.set('bot', DEFAULT_BOT);
    c.set('principal', { kind: 'deploy' });
    return finish();
  }

  // 3) Platform admin password (platform bot only).
  if (!c.env.ADMIN_PASSWORD) {
    return c.json({ error: tr(c, 'ADMIN_PASSWORD belum diset. Tambahkan repository secret ADMIN_PASSWORD di GitHub lalu jalankan ulang workflow deploy.', 'ADMIN_PASSWORD is not set. Add the ADMIN_PASSWORD repository secret on GitHub and re-run the deploy workflow.') }, 503);
  }
  if (await loginLocked(c, { platform: true })) return c.json({ error: lockedMessage(c) }, 429);
  if (!token || token.length > 512 || !(await secretEquals(token, c.env.ADMIN_PASSWORD))) {
    await recordLoginFailure(c, { platform: true });
    return c.json({ error: tr(c, 'Kata sandi admin salah.', 'Wrong admin password.') }, 401);
  }
  const asked = c.req.header('X-Bot-Id');
  if (asked && asked !== DEFAULT_BOT) return c.json({ error: tr(c, 'Admin platform hanya mengelola bot bawaan.', 'The platform admin only manages the platform bot.') }, 403);
  c.set('bot', DEFAULT_BOT);
  c.set('principal', { kind: 'platform' });
  return finish();
});

/** The environment the current bot may use (platform secrets only for the platform bot). */
const benv = (c: Context<Env>) => tenantEnv(c.env, c.get('bot'));

app.get('/api/admin/status', async (c) => {
  const bot = c.get('bot');
  const env = benv(c);
  const principal = c.get('principal');
  const [settings, keys, file] = await Promise.all([getSettings(c.env, bot), getKeys(c.env, bot), activeFile(c.env.DB, bot)]);
  const stats = await c.env.DB.prepare(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(refused), 0) AS refused,
            COALESCE(SUM(failed), 0) AS failed
       FROM chat_log WHERE bot_id = ? AND source IN ('widget', 'telegram', 'whatsapp') AND created_at >= datetime('now', '-7 days')`
  )
    .bind(bot)
    .first<{ total: number; refused: number; failed: number }>()
    .catch(() => ({ total: 0, refused: 0, failed: 0 }));
  return c.json({
    bot,
    platform: bot === DEFAULT_BOT,
    account: principal.kind === 'user' ? { email: principal.user.email, name: principal.user.name, expiresAt: principal.user.expires_at } : null,
    bindings: { db: !!c.env.DB, vectorize: !!c.env.VECTORIZE, ai: !!c.env.AI },
    file,
    botName: settings.name,
    weakPassword: principal.kind === 'platform' ? (c.env.ADMIN_PASSWORD || '').length < 12 : false,
    keys: keyStatus(env, keys),
    chain: buildChain(settings),
    embedderForNextUpload: (() => {
      try {
        return pickEmbedder(env, keys, settings);
      } catch (e: any) {
        return `error: ${e.message}`;
      }
    })(),
    stats,
  });
});

app.get('/api/admin/config', async (c) => {
  const bot = c.get('bot');
  const [settings, keys] = await Promise.all([getSettings(c.env, bot), getKeys(c.env, bot)]);
  return c.json({
    settings,
    defaults: { settings: DEFAULT_SETTINGS, layers: DEFAULT_LAYERS },
    keys: keyStatus(benv(c), keys),
    providers: Object.entries(PROVIDERS).map(([id, p]) => ({ id, name: p.name })),
    workersAiModels: [WORKERS_AI_PRIMARY, WORKERS_AI_BACKUP],
  });
});

app.post('/api/admin/config', async (c) => {
  const bot = c.get('bot');
  const body = await c.req.json<{ settings?: unknown; keys?: Record<string, string | null> }>().catch(() => null);
  if (!body || typeof body !== 'object') return c.json({ error: tr(c, 'Data pengaturan tidak valid.', 'Invalid settings data.') }, 400);
  if (body.settings) {
    const next = normalizeSettings(body.settings);
    await writeSetting(c.env.DB, settingKey('bot', bot), next);
    if (bot !== DEFAULT_BOT) await c.env.DB.prepare('UPDATE bots SET name = ? WHERE id = ?').bind(next.name, bot).run();
  }
  if (body.keys && typeof body.keys === 'object') {
    const current: KeyStore = await getKeys(c.env, bot);
    for (const [id, value] of Object.entries(body.keys)) {
      if (!(KEYED_PROVIDERS as string[]).includes(id)) continue;
      if (value === null || value === '') delete current[id as ProviderId];
      else if (typeof value === 'string' && value.trim().length >= 8 && value.trim().length <= 512) current[id as ProviderId] = value.trim();
    }
    await writeSetting(c.env.DB, settingKey('keys', bot), current);
  }
  const [settings, keys] = await Promise.all([getSettings(c.env, bot), getKeys(c.env, bot)]);
  return c.json({ success: true, settings, keys: keyStatus(benv(c), keys) });
});

/** Shows the exact assembled 7-layer prompt (with sample knowledge) for review. */
app.post('/api/admin/prompt-preview', async (c) => {
  const bot = c.get('bot');
  const body = await c.req.json<{ settings?: unknown }>().catch(() => ({} as any));
  const settings = body.settings ? normalizeSettings(body.settings) : await getSettings(c.env, bot);
  const file = await activeFile(c.env.DB, bot);
  const system = buildSystemPrompt(settings, file?.name || 'dokumen-contoh.md');
  const user = buildUserTurn(
    [{ label: 'Contoh Bab › Contoh Subbab', text: '(Potongan dokumen hasil pencarian akan muncul di sini.)', score: 1, idx: 0 }],
    'Contoh pertanyaan pengunjung?'
  );
  return c.json({ system, user, chars: system.length });
});

app.post('/api/admin/test-provider', async (c) => {
  const bot = c.get('bot');
  const { provider, model } = await c.req.json<{ provider: ProviderId; model: string }>().catch(() => ({} as any));
  if (!provider || !(provider in PROVIDERS) || !model) return c.json({ error: tr(c, 'Pilih penyedia dan model.', 'Choose a provider and a model.') }, 400);
  if (!allow(`test-provider:${bot}`, 10)) return c.json({ error: tr(c, 'Terlalu banyak tes. Tunggu sebentar.', 'Too many tests. Wait a moment.') }, 429);
  const settings = normalizeSettings({ ...(await getSettings(c.env, bot)), chain: [{ provider, model: String(model).slice(0, 120) }], workersAiFallback: false, maxTokens: 128 });
  const keys = await getKeys(c.env, bot);
  const t = Date.now();
  try {
    const { streamChat } = await import('./llm');
    const out = await streamChat(benv(c), keys, settings, [{ role: 'user', content: 'Balas dengan satu kata: siap' }], () => {});
    return c.json({ ok: true, ms: Date.now() - t, reply: out.text.slice(0, 80) });
  } catch (e: any) {
    return c.json({ ok: false, ms: Date.now() - t, error: e?.failed?.[0]?.message || e?.message || 'gagal' });
  }
});

/* ---------- Document ingestion (chunked in the browser) ---------- */

app.post('/api/admin/file', async (c) => {
  const bot = c.get('bot');
  const body = await c.req.json<{ name?: string }>().catch(() => ({} as any));
  if (await activeFile(c.env.DB, bot)) return c.json({ error: tr(c, 'Sudah ada dokumen aktif. Hapus dulu sebelum mengunggah yang baru.', 'A document is already active. Delete it before uploading a new one.') }, 409);
  const [settings, keys] = await Promise.all([getSettings(c.env, bot), getKeys(c.env, bot)]);
  let embedder: Embedder;
  try {
    embedder = pickEmbedder(benv(c), keys, settings);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
  const id = crypto.randomUUID();
  const name = String(body.name || 'dokumen.txt').replace(/[\r\n]/g, ' ').slice(0, 200);
  await c.env.DB.prepare('INSERT INTO file (id, bot_id, name, status, chunk_count, embedder) VALUES (?, ?, ?, ?, 0, ?)').bind(id, bot, name, 'diproses', embedder).run();
  return c.json({ success: true, id, name, embedder });
});

app.post('/api/admin/file/chunks', async (c) => {
  const bot = c.get('bot');
  const body = await c.req.json<{ startIdx: number; chunks: Array<{ text: string; label: string; overlap?: string }> }>().catch(() => null);
  if (!body || !Array.isArray(body.chunks) || body.chunks.length < 1 || body.chunks.length > 20) return c.json({ error: tr(c, 'Satu batch harus berisi 1–20 potongan.', 'A batch must contain 1–20 chunks.') }, 400);
  if (!Number.isInteger(body.startIdx) || body.startIdx < 0 || body.startIdx > 2000) return c.json({ error: tr(c, 'startIdx tidak valid.', 'Invalid startIdx.') }, 400);
  for (const ch of body.chunks) {
    if (typeof ch.text !== 'string' || !ch.text.trim() || ch.text.length > 4000) return c.json({ error: tr(c, 'Tiap potongan harus berisi 1–4.000 karakter.', 'Each chunk must be 1–4,000 characters.') }, 400);
    if (typeof ch.label !== 'string') ch.label = 'Bagian';
  }
  const file = await activeFile(c.env.DB, bot);
  if (!file || file.status !== 'diproses') return c.json({ error: tr(c, 'Tidak ada dokumen yang sedang diproses.', 'No document is being processed.') }, 400);
  if (bot !== DEFAULT_BOT) {
    if (body.startIdx + body.chunks.length > USER_BOT_MAX_CHUNKS) {
      return c.json({ error: tr(c, `Dokumen terlalu besar: maksimal ${USER_BOT_MAX_CHUNKS} potongan per bot. Ringkas dokumennya atau perbesar ukuran potongan.`, `The document is too large: at most ${USER_BOT_MAX_CHUNKS} chunks per bot. Shorten it or use a larger chunk size.`) }, 413);
    }
    if (file.embedder !== 'gemini' && !(await spendPlatform(c.env, 'emb:all-users', body.chunks.length, platformDailyEmbeds(c.env)))) {
      return c.json({ error: tr(c, 'Kuota pemrosesan dokumen gratis untuk hari ini sudah habis. Coba lagi besok, atau simpan kunci Gemini Anda sendiri di menu Bot & model.', "Today's free document-processing quota is used up. Try again tomorrow, or save your own Gemini key in Bot & model.") }, 429);
    }
  }

  const keys = await getKeys(c.env, bot);
  try {
    // Embed with heading breadcrumb + overlap so each vector carries its context.
    const inputs = body.chunks.map((ch) => `${ch.label}\n${typeof ch.overlap === 'string' ? ch.overlap.slice(-500) + ' ' : ''}${ch.text}`);
    const vectors = await embed(benv(c), keys, file.embedder || 'workers-ai', inputs, 'document');
    // Vector ids start with the (random) file id, so they never collide across bots; `bot` drives the query filter.
    // The full random file id (not a prefix) keeps ids unique across every bot.
    const entries = body.chunks.map((_, i) => ({ id: `${file.id}-${body.startIdx + i}`, values: vectors[i], metadata: { idx: body.startIdx + i, bot } }));

    const stmts: D1PreparedStatement[] = [];
    body.chunks.forEach((ch, i) => {
      const id = entries[i].id;
      const label = ch.label.slice(0, 200);
      stmts.push(c.env.DB.prepare('INSERT OR REPLACE INTO chunks (id, bot_id, idx, label, text) VALUES (?, ?, ?, ?, ?)').bind(id, bot, body.startIdx + i, label, ch.text));
      stmts.push(c.env.DB.prepare('DELETE FROM chunks_fts WHERE chunk_id = ? AND bot_id = ?').bind(id, bot));
      stmts.push(c.env.DB.prepare('INSERT INTO chunks_fts (chunk_id, bot_id, label, text) VALUES (?, ?, ?, ?)').bind(id, bot, label, ch.text));
    });
    await c.env.DB.batch(stmts);
    await c.env.VECTORIZE.upsert(entries);
    return c.json({ success: true, count: entries.length });
  } catch (err: any) {
    return c.json({ error: err?.message || 'Gagal membuat embedding.' }, 502);
  }
});

app.post('/api/admin/file/done', async (c) => {
  const bot = c.get('bot');
  const file = await activeFile(c.env.DB, bot);
  if (!file) return c.json({ error: tr(c, 'Tidak ada dokumen.', 'No document.') }, 400);
  const total = (await c.env.DB.prepare('SELECT COUNT(*) AS n FROM chunks WHERE bot_id = ?').bind(bot).first<{ n: number }>())?.n || 0;
  if (!total) return c.json({ error: tr(c, 'Belum ada potongan tersimpan.', 'No chunks have been saved yet.') }, 400);
  await c.env.DB.prepare('UPDATE file SET status = ?, chunk_count = ?, error = NULL WHERE id = ? AND bot_id = ?').bind('selesai', total, file.id, bot).run();
  const settings = await getSettings(c.env, bot);
  const suggestions = await generateSuggestions(c.env, settings, file.name, bot);
  await writeSetting(c.env.DB, settingKey('auto_suggestions', bot), suggestions);
  return c.json({ success: true, chunkCount: total, suggestions });
});

app.delete('/api/admin/file', async (c) => {
  const bot = c.get('bot');
  const ids = await c.env.DB.prepare('SELECT id FROM chunks WHERE bot_id = ?').bind(bot).all<{ id: string }>();
  const list = (ids.results || []).map((r) => r.id);
  await deleteVectors(c.env, list);
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM chunks WHERE bot_id = ?').bind(bot),
    c.env.DB.prepare('DELETE FROM chunks_fts WHERE bot_id = ?').bind(bot),
    c.env.DB.prepare('DELETE FROM file WHERE bot_id = ?').bind(bot),
    c.env.DB.prepare('DELETE FROM answer_cache WHERE bot_id = ?').bind(bot),
  ]);
  await deleteSetting(c.env.DB, settingKey('auto_suggestions', bot));
  return c.json({ success: true, removed: list.length });
});

app.get('/api/admin/chunks', async (c) => {
  const bot = c.get('bot');
  const offset = Math.max(0, Math.min(100_000, Number(c.req.query('offset') || 0) || 0));
  const q = (c.req.query('q') || '').trim().slice(0, 200);
  const rows = q
    ? await c.env.DB.prepare('SELECT idx, label, text FROM chunks WHERE bot_id = ? AND (text LIKE ? OR label LIKE ?) ORDER BY idx LIMIT 30').bind(bot, `%${q}%`, `%${q}%`).all()
    : await c.env.DB.prepare('SELECT idx, label, text FROM chunks WHERE bot_id = ? ORDER BY idx LIMIT 30 OFFSET ?').bind(bot, offset).all();
  return c.json({ items: rows.results || [] });
});

app.post('/api/admin/suggestions/regenerate', async (c) => {
  const bot = c.get('bot');
  const file = await activeFile(c.env.DB, bot);
  if (!file || file.status !== 'selesai') return c.json({ error: tr(c, 'Belum ada dokumen aktif.', 'No active document yet.') }, 400);
  // Each regeneration is an AI call: a few per minute, and user bots count it in the daily quota.
  if (!allow(`regen:${bot}`, 3)) return c.json({ error: tr(c, 'Tunggu sebentar sebelum membuat ulang saran.', 'Wait a moment before regenerating suggestions.') }, 429);
  const settings = await getSettings(c.env, bot);
  if (bot !== DEFAULT_BOT && !(await dailyQuota(c.env, 'owner-regen', 20, settings.limits.dailyTotal, bot))) {
    return c.json({ error: tr(c, 'Kuota hari ini untuk membuat ulang saran sudah habis.', "Today's quota for regenerating suggestions is used up.") }, 429);
  }
  const suggestions = await generateSuggestions(c.env, settings, file.name, bot);
  await writeSetting(c.env.DB, settingKey('auto_suggestions', bot), suggestions);
  return c.json({ suggestions });
});

/* ---------- Playground with retrieval debug ---------- */

app.post('/api/admin/test-chat', async (c) => {
  const bot = c.get('bot');
  const body = await c.req.json<{ question?: string; history?: unknown; settings?: unknown; lang?: string; cache?: boolean }>().catch(() => ({} as any));
  const question = String(body.question || '').trim().slice(0, 2000);
  // Lets the owner try unsaved RAG/prompt settings before saving them.
  const settings = body.settings ? normalizeSettings(body.settings) : await getSettings(c.env, bot);
  const file = await activeFile(c.env.DB, bot);
  return ndjson(c, async (emit) => {
    if (!question) return emit({ type: 'error', message: tr(c, 'Tulis pertanyaan dulu.', 'Type a question first.') });
    if (!file || file.status !== 'selesai') return emit({ type: 'error', message: tr(c, 'Belum ada dokumen aktif. Unggah dokumen di menu Dokumen.', 'No active document yet. Upload one in the Document menu.') });
    if (!allow(`test-chat:${bot}`, 20)) return emit({ type: 'error', message: tr(c, 'Terlalu banyak uji coba dalam semenit. Tunggu sebentar.', 'Too many test questions in a minute. Wait a moment.') });
    // Owner tests of user bots spend the shared budget too (counted like visitor questions).
    if (bot !== DEFAULT_BOT && !(await dailyQuota(c.env, 'owner-test', 200, settings.limits.dailyTotal, bot))) {
      return emit({ type: 'error', message: tr(c, 'Kuota uji coba hari ini sudah habis. Coba lagi besok.', "Today's test quota is used up. Please try again tomorrow.") });
    }
    const history = normalizeHistory(body.history, settings.limits.maxHistory);
    const lang = asLang(body.lang, settings.language);
    const examples = await visitorSuggestions(c.env, settings, lang, bot).catch(() => []);
    const res = await answer({ env: c.env, settings, question, history, file: { id: file.id, name: file.name, embedder: file.embedder || 'workers-ai' }, lang, debug: true, emit, examples, bot, useCache: !body.settings && body.cache !== false });
    if (settings.logQuestions) await logChat(c.env.DB, 'admin', question, res, bot);
  });
});

/* ---------- Answer cache ---------- */

app.get('/api/admin/cache', async (c) => c.json(await cacheStats(c.env.DB, c.get('bot'))));

app.delete('/api/admin/cache', async (c) => {
  await clearCache(c.env.DB, c.get('bot'));
  return c.json({ success: true });
});

/* ---------- Question log ---------- */

app.get('/api/admin/logs', async (c) => {
  const bot = c.get('bot');
  const filter = c.req.query('filter');
  const where =
    filter === 'refused' ? 'AND refused = 1' : filter === 'failed' ? 'AND failed = 1' : filter === 'widget' ? "AND source IN ('widget', 'telegram', 'whatsapp')" : filter === 'admin' ? "AND source = 'admin'" : '';
  const rows = await c.env.DB.prepare(`SELECT id, created_at, source, question, answer, refused, failed, provider, best_score FROM chat_log WHERE bot_id = ? ${where} ORDER BY id DESC LIMIT 100`)
    .bind(bot)
    .all();
  return c.json({ items: rows.results || [] });
});

app.delete('/api/admin/logs', async (c) => {
  await c.env.DB.prepare('DELETE FROM chat_log WHERE bot_id = ?').bind(c.get('bot')).run();
  return c.json({ success: true });
});

// Telegram and WhatsApp webhooks plus their admin endpoints (platform bot only).
channelRoutes(app, {
  activeFile: (db) => activeFile(db, DEFAULT_BOT),
  visitorSuggestions: (env, settings, lang) => visitorSuggestions(env, settings, lang, DEFAULT_BOT),
  dailyQuota: (env, key, perKey, total) => dailyQuota(env, key, perKey, total, DEFAULT_BOT),
  allow,
  logChat: (db, source, question, res) => logChat(db, source, question, res, DEFAULT_BOT),
});

app.notFound((c) => (c.req.path.startsWith('/api/') ? c.json({ error: tr(c, 'Endpoint tidak ditemukan.', 'Endpoint not found.') }, 404) : c.env.ASSETS.fetch(c.req.raw)));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: tr(c, 'Galat server. Cek log Worker dengan `npx wrangler tail`.', 'Server error. Check the Worker logs with `npx wrangler tail`.') }, 500);
});

export default {
  fetch: app.fetch,
  // Daily cron (wrangler.jsonc → triggers.crons): remove expired accounts and their data.
  async scheduled(_event: ScheduledController, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(purgeExpiredAccounts(env).then((n) => console.log(`purged ${n} expired account(s)`)));
  },
};
