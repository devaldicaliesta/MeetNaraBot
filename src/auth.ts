// Accounts, sessions and bot ownership.
//
// Passwords: PBKDF2-SHA256 with a per-user random salt. The iteration count is stored per user so it
// can be raised later; 30,000 keeps a sign-in inside the Workers free-tier CPU budget (~5 ms).
// Sessions: 32 random bytes sent to the browser once; only their SHA-256 is stored. Tokens travel in
// the Authorization header (not a cookie), so there is no ambient credential to forge (no CSRF).

import type { Bindings } from './types';

export const PBKDF2_ITERATIONS = 30_000;
export const SESSION_DAYS = 7;
/** How long an account stays active after sign-up. Its bots and data are deleted afterwards. */
export const ACCOUNT_DAYS = 7;
export const MIN_PASSWORD = 10;
export const MAX_BOTS_PER_USER = 3;
export const DEFAULT_BOT = 'default';

/** Expiry given to accounts that must not expire (see keepPermanentAccounts). */
export const NO_EXPIRY = '9999-12-31T23:59:59.999Z';

/** Bot ids from PERMANENT_BOTS (comma-separated), e.g. the bot TSbot shows. Their accounts never expire. */
export function permanentBots(env: Bindings): string[] {
  return String(env.PERMANENT_BOTS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((id) => /^[a-z0-9]{6,32}$/.test(id));
}

/** E-mail addresses from PERMANENT_EMAILS (comma-separated) whose accounts never expire, e.g. the site owner's. */
export function permanentEmails(env: Bindings): string[] {
  return String(env.PERMANENT_EMAILS || '')
    .split(',')
    .map((s) => normalizeEmail(s))
    .filter((e): e is string => !!e);
}

/**
 * Moves the expiry of every account that owns a permanent bot (PERMANENT_BOTS) or has a
 * permanent e-mail (PERMANENT_EMAILS) to NO_EXPIRY, so the usual expiry checks (sign-in,
 * sessions, widget, daily purge) all treat it as active. Sessions that were cut short to the
 * old account expiry get their normal SESSION_DAYS back. Returns the number of accounts changed.
 */
export async function keepPermanentAccounts(env: Bindings): Promise<number> {
  const ids = permanentBots(env);
  const emails = permanentEmails(env);
  if (!ids.length && !emails.length) return 0;
  const marks = (n: number) => Array.from({ length: n }, () => '?').join(',');
  const owners = [
    ...(ids.length ? [`SELECT owner_id FROM bots WHERE id IN (${marks(ids.length)})`] : []),
    ...(emails.length ? [`SELECT id FROM users WHERE email IN (${marks(emails.length)})`] : []),
  ].join(' UNION ');
  const args = [...ids, ...emails];
  const full = `strftime('%Y-%m-%dT%H:%M:%fZ', created_at, '+${SESSION_DAYS} days')`;
  const [users] = await env.DB.batch([
    env.DB.prepare(`UPDATE users SET expires_at = ? WHERE expires_at < ? AND id IN (${owners})`).bind(NO_EXPIRY, NO_EXPIRY, ...args),
    env.DB.prepare(`UPDATE sessions SET expires_at = ${full} WHERE expires_at < ${full} AND user_id IN (${owners})`).bind(...args),
  ]);
  return users.meta?.changes ?? 0;
}

export type User = { id: string; email: string; name: string; expires_at: string };
export type BotRow = { id: string; owner_id: string; name: string; created_at: string };

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer | Uint8Array) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (h: string) => new Uint8Array((h.match(/../g) || []).map((x) => parseInt(x, 16)));
const random = (n: number) => crypto.getRandomValues(new Uint8Array(n));

/** Lowercase, readable public id without look-alike characters (used in widget snippets and URLs). */
export function newId(len = 10): string {
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
  return [...random(len)].map((b) => alphabet[b % alphabet.length]).join('');
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return hex(bits);
}

async function sha256Hex(text: string): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}

function constantTimeEqualHex(a: string, b: string): boolean {
  const x = fromHex(a);
  const y = fromHex(b);
  if (x.byteLength !== y.byteLength || x.byteLength === 0) return false;
  return crypto.subtle.timingSafeEqual(x, y);
}

export function normalizeEmail(raw: unknown): string | null {
  const email = String(raw || '').trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null;
}

/** Returns an error code, or null when the password is acceptable. */
export function passwordProblem(password: unknown, email: string): 'short' | 'long' | 'email' | null {
  const p = String(password || '');
  if (p.length < MIN_PASSWORD) return 'short';
  if (p.length > 200) return 'long';
  if (p.toLowerCase() === email || p.toLowerCase().includes(email.split('@')[0]) && email.split('@')[0].length >= 6) return 'email';
  return null;
}

export async function createUser(env: Bindings, email: string, password: string, name: string): Promise<User | null> {
  const salt = random(16);
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  const id = newId(16);
  const expires = new Date(Date.now() + ACCOUNT_DAYS * 86_400_000).toISOString();
  const res = await env.DB.prepare('INSERT OR IGNORE INTO users (id, email, name, pass_hash, pass_salt, pass_iter, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, email, name.slice(0, 80), hash, hex(salt), PBKDF2_ITERATIONS, expires)
    .run();
  return (res.meta?.changes ?? 0) > 0 ? { id, email, name: name.slice(0, 80), expires_at: expires } : null;
}

// A fixed dummy record so an unknown e-mail costs the same work as a wrong password (no account enumeration by timing).
const DUMMY = { salt: '00112233445566778899aabbccddeeff', iter: PBKDF2_ITERATIONS };

export async function verifyLogin(env: Bindings, email: string, password: string): Promise<User | 'expired' | null> {
  const row = await env.DB.prepare('SELECT id, email, name, pass_hash, pass_salt, pass_iter, expires_at FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string; email: string; name: string; pass_hash: string; pass_salt: string; pass_iter: number; expires_at: string }>();
  const hash = await pbkdf2(password, fromHex(row?.pass_salt || DUMMY.salt), row?.pass_iter || DUMMY.iter);
  if (!row || !constantTimeEqualHex(hash, row.pass_hash)) return null;
  // The owner of a permanent bot may have signed up before PERMANENT_BOTS was set: lift the limit now,
  // whether or not the 7 days are over yet.
  if (row.expires_at < NO_EXPIRY && (await keepPermanentAccounts(env))) {
    const fresh = await env.DB.prepare('SELECT expires_at FROM users WHERE id = ?').bind(row.id).first<{ expires_at: string }>();
    if (fresh) row.expires_at = fresh.expires_at;
  }
  if (row.expires_at <= new Date().toISOString()) return 'expired';
  await env.DB.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').bind(row.id).run();
  return { id: row.id, email: row.email, name: row.name, expires_at: row.expires_at };
}

export async function changePassword(env: Bindings, userId: string, password: string) {
  const salt = random(16);
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET pass_hash = ?, pass_salt = ?, pass_iter = ? WHERE id = ?').bind(hash, hex(salt), PBKDF2_ITERATIONS, userId),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId),
  ]);
}

/** Creates a session and returns the raw token (shown to the client once). */
export async function createSession(env: Bindings, userId: string): Promise<string> {
  const token = 'nara_' + hex(random(32));
  const account = await env.DB.prepare('SELECT expires_at FROM users WHERE id = ?').bind(userId).first<{ expires_at: string }>();
  // A session never outlives the account it belongs to.
  const expires = new Date(Math.min(Date.now() + SESSION_DAYS * 86_400_000, Date.parse(account?.expires_at || '') || Infinity)).toISOString();
  await env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').bind(await sha256Hex(token), userId, expires).run();
  if (Math.random() < 0.05) await env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(new Date().toISOString()).run();
  return token;
}

export async function sessionUser(env: Bindings, token: string): Promise<User | null> {
  if (!/^nara_[0-9a-f]{64}$/.test(token)) return null;
  const row = await env.DB.prepare(
    'SELECT u.id, u.email, u.name, u.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?1 AND s.expires_at > ?2 AND u.expires_at > ?2'
  )
    .bind(await sha256Hex(token), new Date().toISOString())
    .first<User>();
  return row || null;
}

export async function endSession(env: Bindings, token: string) {
  if (/^nara_[0-9a-f]{64}$/.test(token)) await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(await sha256Hex(token)).run();
}

export async function listBots(env: Bindings, userId: string): Promise<BotRow[]> {
  const res = await env.DB.prepare('SELECT id, owner_id, name, created_at FROM bots WHERE owner_id = ? ORDER BY created_at').bind(userId).all<BotRow>();
  return res.results || [];
}

export async function ownedBot(env: Bindings, userId: string, botId: string): Promise<BotRow | null> {
  if (!/^[a-z0-9]{6,32}$/.test(botId)) return null;
  return (await env.DB.prepare('SELECT id, owner_id, name, created_at FROM bots WHERE id = ? AND owner_id = ?').bind(botId, userId).first<BotRow>()) || null;
}

/** Public bot lookup for the widget: 'default' always exists; other bots must belong to an active account. */
export async function botStatus(env: Bindings, botId: string): Promise<'active' | 'expired' | 'missing'> {
  if (botId === DEFAULT_BOT) return 'active';
  if (!/^[a-z0-9]{6,32}$/.test(botId)) return 'missing';
  const row = await env.DB.prepare('SELECT u.expires_at FROM bots b JOIN users u ON u.id = b.owner_id WHERE b.id = ?').bind(botId).first<{ expires_at: string }>();
  if (!row) return 'missing';
  if (row.expires_at > new Date().toISOString()) return 'active';
  if (permanentBots(env).includes(botId)) {
    await keepPermanentAccounts(env);
    return 'active';
  }
  return 'expired';
}

export async function createBot(env: Bindings, userId: string, name: string): Promise<BotRow | 'limit'> {
  const count = (await env.DB.prepare('SELECT COUNT(*) AS n FROM bots WHERE owner_id = ?').bind(userId).first<{ n: number }>())?.n ?? 0;
  if (count >= MAX_BOTS_PER_USER) return 'limit';
  const bot: BotRow = { id: newId(10), owner_id: userId, name: name.slice(0, 60) || 'Bot baru', created_at: new Date().toISOString() };
  await env.DB.prepare('INSERT INTO bots (id, owner_id, name) VALUES (?, ?, ?)').bind(bot.id, userId, bot.name).run();
  return bot;
}
