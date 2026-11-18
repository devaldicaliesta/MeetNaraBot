// Builds TSbot (tsbot/ → tsbot/dist) for Cloudflare Pages.
//   NARA_API_URL  origin of the Nara Worker, e.g. https://nara.example.workers.dev  (required)
//   NARA_BOT_ID   bot id to chat with (optional; empty = the platform's own bot)
//   IMTS_ORIGIN   comma-separated origins allowed to show TSbot in an iframe (optional; empty = nobody)
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

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'index.html'), readFileSync(join(SRC, 'index.html'), 'utf8').replaceAll('__NARA_API__', api).replaceAll('__NARA_BOT__', bot));
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
