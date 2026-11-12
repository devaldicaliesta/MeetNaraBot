// Builds the Mercury gradient (web/gradients/mercury.ts + the gradients.sh engine) into
// public/gradient/ as plain ES modules, so the static pages can load it with
// <script type="module" src="/gradient/mercury.js">. Run after changing anything in web/gradients:
//
//   npm run build:gradient
//
// The output is committed because the Worker serves public/ as-is (no build step on deploy).
// Splitting keeps the WebGPU shader for the chrome kind in its own chunk, loaded only when used.
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'gradient');

rmSync(OUT, { recursive: true, force: true });
await build({
  entryPoints: [join(ROOT, 'web', 'gradients', 'mercury.ts')],
  outdir: OUT,
  bundle: true,
  splitting: true,
  format: 'esm',
  target: 'es2022',
  minify: true,
  legalComments: 'none',
  chunkNames: 'chunks/[name]-[hash]',
  banner: { js: '/* Mercury gradient. Engine: gradients.sh, MIT (see web/gradients/LICENSE in the Nara repo). */' },
  logLevel: 'info',
});
