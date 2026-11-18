// Builds the IMTS page (imts/ → imts/dist) for Cloudflare Pages (imtsbot.pages.dev). It shows TSbot in an iframe.
//   TSBOT_URL  origin of TSbot, e.g. https://tsbot.pages.dev (required)
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, toOrigin } from './origin.mjs';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'imts');
const OUT = join(SRC, 'dist');
const tsbot = process.env.TSBOT_URL ? toOrigin(process.env.TSBOT_URL, 'TSBOT_URL') : fail('set TSBOT_URL');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const f of ['index.html', '_headers']) {
  const out = readFileSync(join(SRC, f), 'utf8').replaceAll('__TSBOT_URL__', tsbot);
  if (out.includes('__')) fail(`unfilled placeholder left in ${f}`);
  writeFileSync(join(OUT, f), out);
}
cpSync(join(SRC, 'imts.css'), join(OUT, 'imts.css'));
console.log(`build-imts: ${OUT} (frames ${tsbot})`);
