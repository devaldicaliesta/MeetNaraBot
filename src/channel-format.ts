// Turns a Nara answer (light Markdown with [n] citations) into a chat-app message.
// Pure functions with no imports, so they can be unit-tested directly with Node.

export type FormatSource = { number: number; label: string };

const TELEGRAM_LIMIT = 4096;
const WHATSAPP_LIMIT = 4096;

const FILE_NAME = /\.(md|markdown|txt|csv|json|html?|pdf|docx?)$/i;

/** "Section › Subsection" shown to visitors: file names (the document, or a heading that is one) are left out. */
export function visibleLabel(label: string): string {
  return label
    .split(' › ')
    .map((p) => p.trim())
    .filter((p) => p && !FILE_NAME.test(p))
    .slice(-2)
    .join(' › ');
}

/** Only the sources the answer actually cites, in citation order, with short labels. */
export function citedSources(text: string, sources: FormatSource[]): FormatSource[] {
  const used = new Set<number>();
  for (const m of text.matchAll(/\[(\d{1,2})\]/g)) used.add(Number(m[1]));
  return sources.filter((s) => used.has(s.number)).map((s) => ({ number: s.number, label: visibleLabel(s.label) }));
}

/** Drops citation numbers that do not exist and tidies the spacing before kept ones. */
function tidyCitations(text: string, max: number): string {
  return text.replace(/\s?\[(\d{1,2})\]/g, (_, n) => (Number(n) >= 1 && Number(n) <= max ? ` [${n}]` : ''));
}

function clip(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.lastIndexOf('\n', limit - 2);
  return text.slice(0, cut > limit * 0.6 ? cut : limit - 2) + ' …';
}

const escapeHtml = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);

/**
 * Telegram HTML parse mode. Everything is HTML-escaped first; only <b>, <i> and <code> are
 * produced afterwards, so document or model text can never inject markup or links.
 */
export function toTelegram(answer: string, sources: FormatSource[], lang: 'id' | 'en'): string {
  const cited = citedSources(answer, sources);
  let body = escapeHtml(tidyCitations(answer.trim(), sources.length))
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*\w])\*([^*\s][^*\n]*?)\*(?!\w)/g, '$1<i>$2</i>')
    .replace(/^\s*#{1,6}\s+(.+)$/gm, '<b>$1</b>')
    .replace(/^\s*[-*•]\s+/gm, '• ');
  if (cited.length) {
    body += `\n\n<b>${lang === 'en' ? 'Sources' : 'Sumber'}</b>\n` + cited.map((s) => `[${s.number}] ${escapeHtml(s.label)}`).join('\n');
  }
  return clipHtml(body, TELEGRAM_LIMIT);
}

/** Clips without leaving an unclosed tag behind (tags never span lines in toTelegram output). */
function clipHtml(html: string, limit: number): string {
  if (html.length <= limit) return html;
  const lines = html.split('\n');
  let out = '';
  for (const line of lines) {
    if (out.length + line.length + 3 > limit) break;
    out += (out ? '\n' : '') + line;
  }
  return out + '\n…';
}

/** WhatsApp formatting: *bold*, _italic_, `code`; citations and a source list as plain text. */
export function toWhatsApp(answer: string, sources: FormatSource[], lang: 'id' | 'en'): string {
  const cited = citedSources(answer, sources);
  let body = tidyCitations(answer.trim(), sources.length)
    .replace(/(^|[^*\w])\*([^*\s][^*\n]*?)\*(?!\w)/g, '$1_$2_')
    .replace(/\*\*([^*\n]+)\*\*/g, '*$1*')
    .replace(/^\s*#{1,6}\s+(.+)$/gm, '*$1*')
    .replace(/^\s*[-•]\s+/gm, '• ');
  if (cited.length) body += `\n\n*${lang === 'en' ? 'Sources' : 'Sumber'}*\n` + cited.map((s) => `[${s.number}] ${s.label}`).join('\n');
  return clip(body, WHATSAPP_LIMIT);
}

/** Commands that every channel understands. Returns null for a normal question. */
export function channelCommand(text: string): 'start' | 'help' | 'reset' | null {
  const t = text.trim().toLowerCase().replace(/@\w+$/, '');
  if (/^\/start\b/.test(t)) return 'start';
  if (/^\/(help|bantuan)\b/.test(t) || t === 'menu' || t === 'bantuan' || t === 'help') return 'help';
  if (/^\/(reset|baru|new)\b/.test(t) || t === 'reset' || t === 'mulai baru') return 'reset';
  return null;
}
