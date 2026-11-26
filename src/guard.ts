/**
 * Guardrails without AI calls:
 *  - PII detection/redaction (Indonesian formats + e-mail, cards, bank accounts),
 *  - prompt-injection detection for incoming questions,
 *  - HMAC signatures for assistant turns, so a browser cannot forge "assistant" history.
 */
import type { ChatEvent, ChatMessage } from './types';

/* ------------------------------------------------------------------ */
/*  PII                                                                 */
/* ------------------------------------------------------------------ */

export type PiiKind = 'email' | 'phone' | 'nik' | 'card' | 'npwp' | 'account';

export const PII_LABEL: Record<PiiKind, string> = {
  email: '[EMAIL]',
  phone: '[NO. HP]',
  nik: '[NIK]',
  card: '[NO. KARTU]',
  npwp: '[NPWP]',
  account: '[NO. REKENING]',
};

type Match = { kind: PiiKind; start: number; end: number; key: string };

const digits = (s: string) => s.replace(/\D/g, '');

function luhn(num: string): boolean {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let d = Number(num[num.length - 1 - i]);
    if (i % 2) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/** Order matters: the more specific formats claim their span first. */
const PATTERNS: Array<{ kind: PiiKind; re: RegExp; ok?: (m: string) => boolean; group?: number }> = [
  { kind: 'email', re: /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)*\.\p{L}{2,}/gu },
  { kind: 'npwp', re: /\b\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}\b/g },
  // Bank account: an 8–18 digit number right after "rekening/rek/account", optionally with a bank name ("rekening BCA no. …").
  { kind: 'account', re: /\b(?:no\.?\s*)?(?:rekening|rek\.?|account|acc\.?|a\/c)\s*(?:\p{L}{2,12}\s+)?(?:no\.?|number|nomor)?\s*[:#]?\s*(\d[\d -]{6,20}\d)/giu, group: 1, ok: (m) => digits(m).length >= 8 && digits(m).length <= 18 },
  // NIK: 16 digits; the first two are a province code (11–94).
  { kind: 'nik', re: /\b\d{16}\b/g, ok: (m) => Number(m.slice(0, 2)) >= 11 && Number(m.slice(0, 2)) <= 94 },
  // Payment cards: 13–19 digits (spaces/dashes allowed) that pass the Luhn check.
  { kind: 'card', re: /\b\d(?:[ -]?\d){12,18}\b/g, ok: (m) => luhn(digits(m)) },
  // Indonesian mobile numbers: +62 8xx / 62 8xx / 08xx, with optional spaces or dashes.
  { kind: 'phone', re: /(?<![\d+])(?:\+?62[ -]?|0)8\d(?:[ -]?\d){6,11}(?!\d)/g },
];

export function findPii(text: string): Match[] {
  const out: Match[] = [];
  const taken = (s: number, e: number) => out.some((m) => s < m.end && e > m.start);
  for (const p of PATTERNS) {
    for (const m of text.matchAll(p.re)) {
      const value = p.group ? m[p.group] : m[0];
      if (!value) continue;
      const start = (m.index ?? 0) + (p.group ? m[0].indexOf(value) : 0);
      const end = start + value.length;
      if (taken(start, end) || (p.ok && !p.ok(value))) continue;
      out.push({ kind: p.kind, start, end, key: p.kind === 'email' ? value.toLowerCase() : piiDigitsKey(value) });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

/** Phone numbers are compared without their country/trunk prefix, so 0812… equals +62812…. */
function piiDigitsKey(v: string): string {
  const d = digits(v);
  return d.replace(/^(?:62|0)(?=8)/, '');
}

/** Normalised keys of every PII value in `texts` (used as an allow-list: data the document itself publishes). */
export function piiKeys(texts: string[]): Set<string> {
  const keys = new Set<string>();
  for (const t of texts) for (const m of findPii(t)) keys.add(m.key);
  return keys;
}

/** Replaces PII with a label, except values in `allow`. */
export function redactPii(text: string, allow?: Set<string>): { text: string; kinds: PiiKind[] } {
  const matches = findPii(text).filter((m) => !allow?.has(m.key));
  if (!matches.length) return { text, kinds: [] };
  let out = '';
  let pos = 0;
  for (const m of matches) {
    out += text.slice(pos, m.start) + PII_LABEL[m.kind];
    pos = m.end;
  }
  return { text: out + text.slice(pos), kinds: [...new Set(matches.map((m) => m.kind))] };
}

export const hasPii = (text: string) => findPii(text).length > 0;

/* ------------------------------------------------------------------ */
/*  Prompt injection                                                    */
/* ------------------------------------------------------------------ */

const INJECTION: RegExp[] = [
  /\b(?:abaikan|lupakan|acuhkan|hiraukan|langgar)\b[^.?!\n]{0,40}\b(?:instruksi|perintah|aturan|arahan|prompt)\b/iu,
  /\b(?:ignore|disregard|forget|override|bypass)\b[^.?!\n]{0,40}\b(?:instructions?|rules|prompts?|guidelines|directions)\b/i,
  /\b(?:system|developer|hidden|initial)\s+(?:prompt|message|instructions?)\b/i,
  /\bprompt\s+(?:sistem|awal|tersembunyi)\b/iu,
  /\b(?:tampilkan|tunjukkan|bocorkan|sebutkan|ulangi|cetak)\b[^.?!\n]{0,30}\b(?:instruksi|prompt|aturan)\s+(?:kamu|mu|anda|sistem)\b/iu,
  /\b(?:reveal|show|print|repeat|output)\b[^.?!\n]{0,30}\b(?:your|the)\s+(?:instructions|prompt|rules)\b/i,
  /\b(?:you are now|from now on you are|pretend (?:to be|you are)|act as (?:an? )?(?:unrestricted|uncensored|different))\b/i,
  /\b(?:kamu|anda) sekarang (?:adalah|menjadi)\b/iu,
  /\b(?:developer mode|jailbreak|DAN mode|do anything now)\b/i,
  // Every tag the prompts in rag.ts wrap text in, so visitor text cannot close one and open its own.
  /<\/?\s*(?:system|knowledge(?:_policy)?|rules|role|instructions?|history|question|follow_up|interface_language|context|task|output_format|examples|self_check)\s*>/i,
];

/**
 * Removes characters that render as nothing: format characters (zero-width space, soft hyphen,
 * word joiner, bidi controls, and the Unicode "tag" block that can spell out a hidden instruction
 * a model still reads) plus variation selectors used for the same trick (U+FE0F stays: emoji need it).
 * Without this, "ig\u200Bnore all previous instructions" slipped past every pattern below.
 */
export function stripInvisible(text: string): string {
  return text.replace(/[\p{Cf}\u{FE00}-\u{FE0E}\u{E0100}-\u{E01EF}]/gu, '');
}

export function detectInjection(text: string): boolean {
  const t = stripInvisible(text.normalize('NFKC'));
  return INJECTION.some((re) => re.test(t));
}

export function injectionReply(lang: 'id' | 'en', document: string): string {
  return lang === 'en'
    ? `Sorry, I can only answer questions about the contents of **${document}**. Please ask about something in the document.`
    : `Maaf, aku hanya bisa menjawab pertanyaan tentang isi **${document}**. Silakan tanyakan hal yang ada di dokumen, ya.`;
}

/* ------------------------------------------------------------------ */
/*  Signed assistant turns                                              */
/* ------------------------------------------------------------------ */

const enc = new TextEncoder();
const keyCache = new Map<string, Promise<CryptoKey>>();

function hmacKey(secret: string): Promise<CryptoKey> {
  let k = keyCache.get(secret);
  if (!k) {
    k = crypto.subtle.importKey('raw', enc.encode('nara-history:' + secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
    keyCache.set(secret, k);
  }
  return k;
}

const b64url = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** The history normaliser keeps 2000 characters, so that is what gets signed. */
export async function signAnswer(secret: string, bot: string, text: string): Promise<string> {
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(`${bot}\n${text.slice(0, 2000)}`));
  return b64url(sig).slice(0, 32);
}

/**
 * Keeps visitor turns, and assistant turns only when they carry a valid signature issued by this
 * server for this bot. A forged or edited "assistant" message is dropped, so it can never steer the model.
 */
export async function verifyHistory(secret: string, bot: string, input: unknown, max: number, normalize: (raw: unknown, max: number) => ChatMessage[]): Promise<ChatMessage[]> {
  if (!Array.isArray(input) || max <= 0) return [];
  // Only the newest turns can be kept, so older ones are never checked (bounds the HMAC work per request).
  const raw = input.slice(-Math.max(4, max * 2));
  const sigs = raw.map((m: any) => (typeof m?.sig === 'string' ? m.sig.slice(0, 64) : ''));
  const kept: unknown[] = [];
  for (let i = 0; i < raw.length; i++) {
    const m: any = raw[i];
    const role = m?.role === 'user' ? 'user' : m?.role === 'assistant' || m?.role === 'model' ? 'assistant' : null;
    if (role === 'user') {
      if (!detectInjection(String(m?.content ?? m?.text ?? ''))) kept.push(m);
      continue;
    }
    if (role !== 'assistant') continue;
    const content = typeof m?.content === 'string' ? m.content : typeof m?.text === 'string' ? m.text : '';
    if (sigs[i] && sameString(sigs[i], await signAnswer(secret, bot, content))) kept.push(m);
  }
  return normalize(kept, max);
}

/** Length-safe constant-time comparison of two short ASCII strings (signatures). */
function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Wraps an event emitter so the final `done` event carries the signature of the full answer text. */
export function signingEmitter(emit: (e: ChatEvent) => Promise<void>, secret: string, bot: string) {
  let text = '';
  return async (e: ChatEvent) => {
    if (e.type === 'delta') text += e.text;
    if (e.type === 'done') {
      const final = e.text ?? text;
      return emit({ ...e, sig: await signAnswer(secret, bot, final) });
    }
    return emit(e);
  };
}
