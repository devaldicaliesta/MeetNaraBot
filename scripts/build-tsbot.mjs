// Builds TSbot (tsbot/ → tsbot/dist) for Cloudflare Pages.
//   NARA_API_URL  origin of the Nara Worker, e.g. https://nara.example.workers.dev  (required)
//   NARA_BOT_ID   bot id to chat with (optional; empty = the platform's own bot)
//   IMTS_ORIGIN   comma-separated origins allowed to show TSbot in an iframe (optional; empty = nobody)
//   tsbot/menu.json  the category menu shown on the start screen (checked below, then inlined as a JSON data block)
// Values are validated strictly because they end up in HTML attributes and the CSP header.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, toOrigin } from './origin.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'tsbot');
const OUT = join(SRC, 'dist');

const api = process.env.NARA_API_URL ? toOrigin(process.env.NARA_API_URL, 'NARA_API_URL') : fail('set NARA_API_URL');
const bot = (process.env.NARA_BOT_ID || '').trim().toLowerCase();
if (!/^[a-z0-9]{0,32}$/.test(bot)) fail('NARA_BOT_ID may only contain a-z and 0-9 (max 32)');
const frames = (process.env.IMTS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean).map((o) => toOrigin(o, 'IMTS_ORIGIN'));
if (!frames.length) console.warn('build-tsbot: IMTS_ORIGIN is empty, so no site can embed TSbot in an iframe yet.');

const menu = checkMenu(JSON.parse(readFileSync(join(SRC, 'menu.json'), 'utf8')));
// Inlined inside <script type="application/json">: escape "<" so no text can close the block, and the JS line separators.
const menuJson = JSON.stringify(menu).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'index.html'), readFileSync(join(SRC, 'index.html'), 'utf8').replaceAll('__NARA_API__', api).replaceAll('__NARA_BOT__', bot).replace('__MENU_JSON__', () => menuJson));
writeFileSync(join(OUT, '_headers'), readFileSync(join(SRC, '_headers'), 'utf8')
  .replaceAll('__NARA_API__', api)
  .replaceAll('__FRAME_ANCESTORS__', frames.length ? frames.join(' ') : "'none'"));
cpSync(join(SRC, 'page.css'), join(OUT, 'page.css'));
// The chat itself is Nara's widget, copied from the same commit so the page never loads script from another origin.
cpSync(join(ROOT, 'public', 'widget.js'), join(OUT, 'widget.js'));
cpSync(join(ROOT, 'public', 'widget.css'), join(OUT, 'widget.css'));
console.log(`build-tsbot: ${OUT} (api ${api}, bot ${bot || 'platform'}, frame-ancestors ${frames.join(' ') || "'none'"})`);
for (const f of ['index.html', '_headers']) {
  if (readFileSync(join(OUT, f), 'utf8').includes('__')) fail(`unfilled placeholder left in ${f}`);
}

/** The menu's shape, with limits that keep the start screen usable. Anything else fails the build. */
function checkMenu(m) {
  const text = (v, name, max) => {
    if (typeof v !== 'string' || !v.trim() || v.length > max) fail(`menu.json: ${name} must be text of 1 to ${max} characters`);
    return v.trim();
  };
  if (!m || typeof m !== 'object') fail('menu.json must be an object');
  const out = {};
  if (m.accent !== undefined) {
    if (!/^#[0-9a-f]{6}$/i.test(m.accent)) fail('menu.json: accent must be a #rrggbb colour');
    out.accent = m.accent;
  }
  for (const [k, max] of [['title', 40], ['subtitle', 80], ['heading', 80], ['intro', 200], ['back', 40], ['placeholder', 120], ['note', 200]]) {
    if (m[k] !== undefined) out[k] = text(m[k], k, max);
  }
  if (!Array.isArray(m.categories) || !m.categories.length || m.categories.length > 12) fail('menu.json: categories must list 1 to 12 categories');
  out.categories = m.categories.map((c, i) => {
    if (typeof c.icon !== 'string' || !/^[MmLlHhVvCcSsQqTtAaZz0-9 .,-]{1,400}$/.test(c.icon)) fail(`menu.json: categories[${i}].icon must be SVG path data`);
    if (!Array.isArray(c.issues) || !c.issues.length || c.issues.length > 12) fail(`menu.json: categories[${i}].issues must list 1 to 12 questions`);
    return { name: text(c.name, `categories[${i}].name`, 40), desc: text(c.desc, `categories[${i}].desc`, 120), icon: c.icon, issues: c.issues.map((q, j) => text(q, `categories[${i}].issues[${j}]`, 300)) };
  });
  return out;
}
