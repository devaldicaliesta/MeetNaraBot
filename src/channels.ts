// Telegram and WhatsApp channels. Both webhooks feed the same RAG pipeline as the widget
// (small talk, retrieval gate, citations, quotas, excerpt fallback) and reply in the chat app.
//
// Telegram: Bot API webhook, authenticated with the secret_token header that Telegram echoes back.
// WhatsApp: Meta WhatsApp Cloud API webhook, authenticated with the X-Hub-Signature-256 HMAC of the
// raw body (app secret); GET verification uses WHATSAPP_VERIFY_TOKEN.

import type { Context, Hono } from 'hono';
import type { AppEnv, Bindings, ChatMessage } from './types';
import { channelCommand, toTelegram, toWhatsApp, type FormatSource } from './channel-format';
import { answer } from './rag';
import { getSalt, getSettings, type BotSettings, type Embedder, type Lang } from './settings';

type Env = AppEnv;
type Channel = 'telegram' | 'whatsapp';
type FileRow = { id: string; name: string; status: string; embedder: Embedder | null; lang?: string | null };
type AnswerResult = { refused: boolean; text: string; bestScore: number; provider: string | null; error?: boolean; ungrounded?: boolean };

export type ChannelDeps = {
  activeFile: (db: D1Database) => Promise<FileRow | null>;
  visitorSuggestions: (env: Bindings, settings: BotSettings, lang: Lang) => Promise<string[]>;
  dailyQuota: (env: Bindings, key: string, perKey: number, total: number) => Promise<boolean>;
  allow: (key: string, max: number) => boolean;
  logChat: (db: D1Database, source: string, question: string, res: AnswerResult) => Promise<void>;
};

const GRAPH = 'https://graph.facebook.com/v21.0'; // VERIFY: current WhatsApp Cloud API version
const MAX_WEBHOOK_BODY = 256 * 1024;

/* ------------------------------------------------------------------ */
/*  Small helpers                                                       */
/* ------------------------------------------------------------------ */

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function digestEquals(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

/** Telegram secret_token derived from the bot token, so no extra secret has to be managed. */
export async function telegramSecret(botToken: string): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', enc.encode(`meetnarabot-telegram-webhook|${botToken}`)));
}

async function hmacHex(secret: string, body: ArrayBuffer): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, body));
}

async function chatKey(env: Bindings, channel: Channel, id: string): Promise<string> {
  const salt = await getSalt(env.DB);
  return `${channel}:${hex(await crypto.subtle.digest('SHA-256', enc.encode(`${salt}|${channel}|${id}`))).slice(0, 32)}`;
}

/** Returns false when this message ID was already handled (webhook retry). */
async function firstDelivery(env: Bindings, channel: Channel, messageId: string): Promise<boolean> {
  try {
    const res = await env.DB.prepare('INSERT OR IGNORE INTO channel_seen (id) VALUES (?)').bind(`${channel}:${messageId}`).run();
    if (Math.random() < 0.02) {
      await env.DB.batch([
        env.DB.prepare("DELETE FROM channel_seen WHERE created_at < datetime('now', '-1 day')"),
        env.DB.prepare("DELETE FROM channel_history WHERE updated_at < datetime('now', '-1 day')"),
      ]);
    }
    return (res.meta?.changes ?? 1) > 0;
  } catch {
    return true;
  }
}

async function loadHistory(env: Bindings, key: string, max: number): Promise<ChatMessage[]> {
  try {
    const row = await env.DB.prepare("SELECT history FROM channel_history WHERE id = ? AND updated_at >= datetime('now', '-1 day')").bind(key).first<{ history: string }>();
    const list = row ? (JSON.parse(row.history) as ChatMessage[]) : [];
    return Array.isArray(list) ? list.filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').slice(-max) : [];
  } catch {
    return [];
  }
}

async function saveHistory(env: Bindings, key: string, history: ChatMessage[]) {
  await env.DB.prepare('INSERT INTO channel_history (id, history, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET history = excluded.history, updated_at = CURRENT_TIMESTAMP')
    .bind(key, JSON.stringify(history.slice(-12)))
    .run()
    .catch((e) => console.error('history not saved', e));
}

async function clearHistory(env: Bindings, key: string) {
  await env.DB.prepare('DELETE FROM channel_history WHERE id = ?').bind(key).run().catch(() => {});
}

/* ------------------------------------------------------------------ */
/*  Shared conversation logic                                          */
/* ------------------------------------------------------------------ */

const T = {
  noDoc: { id: '{name} belum punya dokumen referensi, jadi untuk sementara belum bisa menjawab. Coba lagi nanti, ya.', en: "{name} doesn't have a reference document yet, so it can't answer for now. Please try again later." },
  tooLong: { id: 'Pertanyaannya terlalu panjang. Coba ringkas jadi maksimal {n} karakter, ya.', en: 'That question is a bit long. Please keep it under {n} characters.' },
  perMinute: { id: 'Wah, pertanyaannya cepat sekali. Tunggu sekitar satu menit, lalu tanyakan lagi, ya.', en: "You're asking faster than I can keep up. Wait about a minute, then ask again." },
  daily: { id: 'Maaf, kuota pertanyaan untuk hari ini sudah habis. Silakan kembali besok, aku siap membantu lagi.', en: "Sorry, today's question quota has run out. Please come back tomorrow and I'll be happy to help again." },
  textOnly: { id: 'Maaf, aku hanya bisa membaca pesan teks. Silakan ketik pertanyaanmu, ya.', en: 'Sorry, I can only read text messages. Please type your question.' },
  reset: { id: 'Percakapan sudah dimulai dari awal. Silakan ajukan pertanyaan baru.', en: 'The conversation has been reset. Go ahead and ask a new question.' },
  error: { id: 'Maaf, ada gangguan saat menyusun jawaban. Coba kirim pertanyaanmu lagi sebentar lagi, ya.', en: 'Sorry, something went wrong while preparing the answer. Please send your question again in a moment.' },
  privateOnly: { id: 'Aku hanya menjawab di chat pribadi. Kirim pertanyaanmu langsung ke aku, ya.', en: 'I only answer in private chats. Please message me directly.' },
} as const;
const t = (k: keyof typeof T, lang: Lang, vars: Record<string, string | number> = {}) => T[k][lang].replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? ''));

function welcome(settings: BotSettings, docName: string | null, examples: string[], lang: Lang, channel: Channel): string {
  const en = lang === 'en';
  const reset = channel === 'telegram' ? '/reset' : 'reset';
  const intro = docName
    ? en
      ? `Hi, I'm **${settings.name}**. Ask me anything about **${docName}** and I'll answer from the document, with numbered sources.`
      : `Halo, aku **${settings.name}**. Tanyakan apa saja tentang **${docName}**, nanti kujawab dari isi dokumennya lengkap dengan nomor sumber.`
    : t('noDoc', lang, { name: settings.name });
  const ex = examples.length ? (en ? '\n\nFor example:\n' : '\n\nContohnya:\n') + examples.slice(0, 3).map((q) => `- ${q}`).join('\n') : '';
  const tip = en ? `\n\nSend "${reset}" to start a new conversation.` : `\n\nKirim "${reset}" untuk memulai percakapan baru.`;
  return intro + ex + tip;
}

type Reply = { text: string; sources: FormatSource[] };

/** Runs one chat-app message through the RAG pipeline and returns the reply to send. */
async function converse(env: Bindings, deps: ChannelDeps, channel: Channel, userId: string, text: string, lang: Lang): Promise<Reply> {
  const settings = await getSettings(env);
  const file = await deps.activeFile(env.DB);
  const ready = file?.status === 'selesai';
  const key = await chatKey(env, channel, userId);
  const command = channelCommand(text);

  if (command === 'reset') {
    await clearHistory(env, key);
    return { text: t('reset', lang), sources: [] };
  }
  if (command === 'start' || command === 'help') {
    const examples = ready ? await deps.visitorSuggestions(env, settings, lang).catch(() => []) : [];
    return { text: welcome(settings, ready ? file!.name : null, examples, lang, channel), sources: [] };
  }
  if (!ready) return { text: t('noDoc', lang, { name: settings.name }), sources: [] };

  const question = text.trim();
  if (question.length > settings.limits.maxQuestionLength) return { text: t('tooLong', lang, { n: settings.limits.maxQuestionLength }), sources: [] };
  if (!deps.allow(`chat:${key}`, settings.limits.requestsPerMinute)) return { text: t('perMinute', lang), sources: [] };
  if (!(await deps.dailyQuota(env, key, settings.limits.dailyPerIp, settings.limits.dailyTotal))) return { text: t('daily', lang), sources: [] };

  const history = await loadHistory(env, key, settings.limits.maxHistory);
  const examples = await deps.visitorSuggestions(env, settings, lang).catch(() => []);
  let out = '';
  let sources: FormatSource[] = [];
  let failedMessage = '';
  const res = await answer({
    env,
    settings,
    question,
    history,
    file: { id: file!.id, name: file!.name, embedder: file!.embedder || 'workers-ai', lang: file!.lang },
    lang,
    debug: false,
    examples,
    bot: 'default',
    emit: async (e) => {
      if (e.type === 'delta') out += e.text;
      else if (e.type === 'done' && e.text) out = e.text;
      else if (e.type === 'sources') sources = e.items.map((s) => ({ number: s.number, label: s.label }));
      else if (e.type === 'error') failedMessage = e.message;
    },
  });
  if (settings.logQuestions) await deps.logChat(env.DB, channel, question, res);
  const reply = out.trim() || failedMessage || t('error', lang);
  if (out.trim()) await saveHistory(env, key, [...history, { role: 'user', content: question }, { role: 'assistant', content: out.trim().slice(0, 2000) }]);
  return { text: reply, sources };
}

/* ------------------------------------------------------------------ */
/*  Telegram                                                            */
/* ------------------------------------------------------------------ */

async function telegramApi(env: Bindings, token: string, method: string, body: unknown): Promise<any> {
  const res = await fetch(`${env.TELEGRAM_API_BASE || 'https://api.telegram.org'}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(`Telegram ${method}: ${data.description || res.status}`);
  return data.result;
}

async function handleTelegram(env: Bindings, deps: ChannelDeps, update: any) {
  const token = env.TELEGRAM_BOT_TOKEN!;
  const msg = update?.message;
  if (!msg?.chat?.id || !msg.message_id) return;
  if (!(await firstDelivery(env, 'telegram', `${msg.chat.id}:${msg.message_id}`))) return;
  const settings = await getSettings(env);
  const lang: Lang = /^en/i.test(msg.from?.language_code || '') ? 'en' : /^(id|ms)/i.test(msg.from?.language_code || '') ? 'id' : settings.language;
  const send = (text: string) =>
    telegramApi(env, token, 'sendMessage', { chat_id: msg.chat.id, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true }, reply_parameters: { message_id: msg.message_id, allow_sending_without_reply: true } });

  if (msg.chat.type !== 'private') {
    if (typeof msg.text === 'string' && channelCommand(msg.text)) await send(toTelegram(t('privateOnly', lang), [], lang));
    return;
  }
  if (typeof msg.text !== 'string' || !msg.text.trim()) {
    await send(toTelegram(t('textOnly', lang), [], lang));
    return;
  }
  await telegramApi(env, token, 'sendChatAction', { chat_id: msg.chat.id, action: 'typing' }).catch(() => {});
  const reply = await converse(env, deps, 'telegram', String(msg.chat.id), msg.text, lang);
  await send(toTelegram(reply.text, reply.sources, lang));
}

/* ------------------------------------------------------------------ */
/*  WhatsApp Cloud API                                                  */
/* ------------------------------------------------------------------ */

async function whatsappApi(env: Bindings, body: unknown): Promise<any> {
  const res = await fetch(`${env.WHATSAPP_API_BASE || GRAPH}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`WhatsApp: ${data?.error?.message || res.status}`);
  return data;
}

async function handleWhatsApp(env: Bindings, deps: ChannelDeps, payload: any) {
  const settings = await getSettings(env);
  const lang: Lang = settings.language;
  for (const entry of payload?.entry || []) {
    for (const change of entry?.changes || []) {
      const value = change?.value;
      if (value?.metadata?.phone_number_id && value.metadata.phone_number_id !== env.WHATSAPP_PHONE_NUMBER_ID) continue;
      for (const msg of value?.messages || []) {
        if (!msg?.from || !msg.id) continue;
        if (!(await firstDelivery(env, 'whatsapp', msg.id))) continue;
        await whatsappApi(env, { messaging_product: 'whatsapp', status: 'read', message_id: msg.id }).catch(() => {});
        const text = msg.type === 'text' ? String(msg.text?.body || '') : msg.type === 'button' ? String(msg.button?.text || '') : '';
        const reply = text.trim() ? await converse(env, deps, 'whatsapp', String(msg.from), text, lang) : { text: t('textOnly', lang), sources: [] };
        await whatsappApi(env, {
          messaging_product: 'whatsapp',
          to: msg.from,
          type: 'text',
          context: { message_id: msg.id },
          text: { body: toWhatsApp(reply.text, reply.sources, lang), preview_url: false },
        });
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Routes                                                              */
/* ------------------------------------------------------------------ */

export function channelRoutes(app: Hono<Env>, deps: ChannelDeps) {
  // Telegram webhook. 404 when the channel is not configured, 401 on a wrong secret token.
  app.post('/api/channels/telegram', async (c) => {
    const token = c.env.TELEGRAM_BOT_TOKEN;
    if (!token) return c.json({ error: 'Telegram is not configured.' }, 404);
    const given = c.req.header('X-Telegram-Bot-Api-Secret-Token') || '';
    if (!given || !(await digestEquals(given, await telegramSecret(token)))) return c.json({ error: 'Unauthorized' }, 401);
    if (Number(c.req.header('Content-Length') || 0) > MAX_WEBHOOK_BODY) return c.json({ error: 'Too large' }, 413);
    const update = await c.req.json().catch(() => null);
    // Answer Telegram immediately; the reply is produced in the background.
    c.executionCtx.waitUntil(handleTelegram(c.env, deps, update).catch((e) => console.error('telegram', e)));
    return c.json({ ok: true });
  });

  // WhatsApp webhook verification handshake (Meta sends hub.challenge once when subscribing).
  app.get('/api/channels/whatsapp', async (c) => {
    const verify = c.env.WHATSAPP_VERIFY_TOKEN;
    if (!verify) return c.text('WhatsApp is not configured.', 404);
    const ok = c.req.query('hub.mode') === 'subscribe' && (await digestEquals(c.req.query('hub.verify_token') || '', verify));
    return ok ? c.text(c.req.query('hub.challenge') || '') : c.text('Forbidden', 403);
  });

  // WhatsApp messages. The X-Hub-Signature-256 HMAC over the raw body must match the app secret.
  app.post('/api/channels/whatsapp', async (c) => {
    const { WHATSAPP_APP_SECRET: secret, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID } = c.env;
    if (!secret || !WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) return c.json({ error: 'WhatsApp is not configured.' }, 404);
    if (Number(c.req.header('Content-Length') || 0) > MAX_WEBHOOK_BODY) return c.json({ error: 'Too large' }, 413);
    const raw = await c.req.arrayBuffer();
    if (raw.byteLength > MAX_WEBHOOK_BODY) return c.json({ error: 'Too large' }, 413);
    const signature = (c.req.header('X-Hub-Signature-256') || '').replace(/^sha256=/, '');
    if (!signature || !(await digestEquals(signature, await hmacHex(secret, raw)))) return c.json({ error: 'Unauthorized' }, 401);
    let payload: unknown = null;
    try {
      payload = JSON.parse(new TextDecoder().decode(raw));
    } catch {
      return c.json({ error: 'Bad JSON' }, 400);
    }
    c.executionCtx.waitUntil(handleWhatsApp(c.env, deps, payload).catch((e) => console.error('whatsapp', e)));
    return c.json({ ok: true });
  });

  /* ---------- Admin: channel status and Telegram webhook management ---------- */

  const origin = (c: Context<Env>) => new URL(c.req.url).origin;

  // Telegram/WhatsApp are configured with platform secrets, so only the platform bot can use them.
  const platformOnly = (c: Context<Env>) =>
    c.get('bot') === 'default' ? null : c.json({ error: c.req.header('X-Lang') === 'en' ? 'Telegram and WhatsApp are only available for the platform bot.' : 'Telegram dan WhatsApp hanya tersedia untuk bot platform.', available: false }, 403);

  app.get('/api/admin/channels', async (c) => {
    const denied = platformOnly(c);
    if (denied) return denied;
    const base = origin(c);
    const tg = c.env.TELEGRAM_BOT_TOKEN;
    let telegram: Record<string, unknown> = { configured: !!tg, webhookUrl: `${base}/api/channels/telegram` };
    if (tg) {
      try {
        const [me, info] = await Promise.all([telegramApi(c.env, tg, 'getMe', {}), telegramApi(c.env, tg, 'getWebhookInfo', {})]);
        telegram = {
          ...telegram,
          username: me?.username || null,
          connected: info?.url === telegram.webhookUrl,
          pending: info?.pending_update_count ?? 0,
          lastError: info?.last_error_message || null,
        };
      } catch (e: any) {
        telegram = { ...telegram, error: String(e?.message || e).replace(tg, '***') };
      }
    }
    return c.json({
      telegram,
      whatsapp: {
        configured: !!(c.env.WHATSAPP_TOKEN && c.env.WHATSAPP_PHONE_NUMBER_ID && c.env.WHATSAPP_APP_SECRET && c.env.WHATSAPP_VERIFY_TOKEN),
        webhookUrl: `${base}/api/channels/whatsapp`,
        missing: (['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_APP_SECRET', 'WHATSAPP_VERIFY_TOKEN'] as const).filter((k) => !c.env[k]),
      },
    });
  });

  app.post('/api/admin/channels/telegram/connect', async (c) => {
    const denied = platformOnly(c);
    if (denied) return denied;
    const tg = c.env.TELEGRAM_BOT_TOKEN;
    if (!tg) return c.json({ error: c.req.header('X-Lang') === 'en' ? 'TELEGRAM_BOT_TOKEN is not set. Add it as a secret first.' : 'TELEGRAM_BOT_TOKEN belum diset. Tambahkan dulu sebagai secret.' }, 400);
    try {
      await telegramApi(c.env, tg, 'setWebhook', {
        url: `${origin(c)}/api/channels/telegram`,
        secret_token: await telegramSecret(tg),
        allowed_updates: ['message'],
        drop_pending_updates: true,
        max_connections: 10,
      });
      const settings = await getSettings(c.env);
      await telegramApi(c.env, tg, 'setMyCommands', {
        commands: [
          { command: 'start', description: settings.language === 'en' ? 'Introduction and example questions' : 'Perkenalan dan contoh pertanyaan' },
          { command: 'reset', description: settings.language === 'en' ? 'Start a new conversation' : 'Mulai percakapan baru' },
          { command: 'help', description: settings.language === 'en' ? 'How to ask' : 'Cara bertanya' },
        ],
      }).catch(() => {});
      return c.json({ success: true });
    } catch (e: any) {
      return c.json({ error: String(e?.message || e).replace(tg, '***') }, 502);
    }
  });

  app.post('/api/admin/channels/telegram/disconnect', async (c) => {
    const denied = platformOnly(c);
    if (denied) return denied;
    const tg = c.env.TELEGRAM_BOT_TOKEN;
    if (!tg) return c.json({ error: c.req.header('X-Lang') === 'en' ? 'TELEGRAM_BOT_TOKEN is not set. Add it as a secret first.' : 'TELEGRAM_BOT_TOKEN belum diset. Tambahkan dulu sebagai secret.' }, 400);
    try {
      await telegramApi(c.env, tg, 'deleteWebhook', { drop_pending_updates: true });
      return c.json({ success: true });
    } catch (e: any) {
      return c.json({ error: String(e?.message || e).replace(tg, '***') }, 502);
    }
  });
}
