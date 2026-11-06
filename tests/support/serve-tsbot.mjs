// QA for TSbot: builds it against the local mock API, serves tsbot/dist with its _headers (as Cloudflare Pages
// would), and serves two "host" pages that embed it in an iframe: one allowed (IMTS) and one not.
// Usage: node tests/support/serve-tsbot.mjs <tsbotPort> <apiPort> <imtsPort> <otherPort>
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import http from 'node:http';
import { extname, join, normalize } from 'node:path';

const [tsPort, apiPort, imtsPort, otherPort] = process.argv.slice(2).map(Number);
const DIST = join(process.cwd(), 'tsbot', 'dist');
execFileSync('node', ['scripts/build-tsbot.mjs'], {
  stdio: 'inherit',
  env: { ...process.env, NARA_API_URL: `http://127.0.0.1:${apiPort}`, NARA_BOT_ID: '', IMTS_ORIGIN: `http://127.0.0.1:${imtsPort}` },
});

const headers = {};
for (const line of readFileSync(join(DIST, '_headers'), 'utf8').split('\n')) {
  const m = /^\s+([\w-]+):\s*(.+)$/.exec(line);
  if (m) headers[m[1]] = m[2];
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };

http.createServer((req, res) => {
  const path = normalize(new URL(req.url, 'http://x').pathname).replace(/^(\.\.[/\\])+/, '');
  const file = join(DIST, path === '/' ? 'index.html' : path);
  if (!file.startsWith(DIST) || path.includes('_headers')) { res.writeHead(404); return res.end(); }
  try {
    const body = readFileSync(file);
    res.writeHead(200, { ...headers, 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(tsPort, '127.0.0.1');

const host = (title) => (_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><title>${title}</title><h1>${title}</h1><iframe id="tsbot" title="TSbot" src="http://127.0.0.1:${tsPort}/" width="420" height="640"></iframe>`);
};
http.createServer(host('IMTS')).listen(imtsPort, '127.0.0.1');
http.createServer(host('Other site')).listen(otherPort, '127.0.0.1');
console.log(`tsbot QA servers on ${tsPort}, ${imtsPort}, ${otherPort}`);
