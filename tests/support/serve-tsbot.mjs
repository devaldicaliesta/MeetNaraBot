// QA for TSbot: builds it against the local mock API and serves tsbot/dist with its _headers (as Cloudflare Pages
// would). Also serves the real IMTS page (imts/dist, allowed to embed TSbot) and another site that is not allowed.
// Usage: node tests/support/serve-tsbot.mjs <tsbotPort> <apiPort> <imtsPort> <otherPort>
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import http from 'node:http';
import { extname, join, normalize } from 'node:path';

const [tsPort, apiPort, imtsPort, otherPort] = process.argv.slice(2).map(Number);
const build = (script, env) => execFileSync('node', [script], { stdio: 'inherit', env: { ...process.env, ...env } });
build('scripts/build-tsbot.mjs', { NARA_API_URL: `http://127.0.0.1:${apiPort}`, NARA_BOT_ID: '', IMTS_ORIGIN: `http://127.0.0.1:${imtsPort}` });
build('scripts/build-imts.mjs', { TSBOT_URL: `http://127.0.0.1:${tsPort}` });

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };

/** Serves a Pages build directory with the headers from its _headers file (only the /* block is used). */
function servePages(dir, port) {
  const headers = {};
  for (const line of readFileSync(join(dir, '_headers'), 'utf8').split('\n')) {
    const m = /^\s+([\w-]+):\s*(.+)$/.exec(line);
    if (m) headers[m[1]] = m[2];
  }
  http.createServer((req, res) => {
    const path = normalize(new URL(req.url, 'http://x').pathname).replace(/^(\.\.[/\\])+/, '');
    const file = join(dir, path === '/' ? 'index.html' : path);
    if (!file.startsWith(dir) || path.includes('_headers')) { res.writeHead(404); return res.end(); }
    try {
      const body = readFileSync(file);
      res.writeHead(200, { ...headers, 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  }).listen(port, '127.0.0.1');
}
servePages(join(process.cwd(), 'tsbot', 'dist'), tsPort);
servePages(join(process.cwd(), 'imts', 'dist'), imtsPort);

http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><title>Other site</title><iframe title="TSbot" src="http://127.0.0.1:${tsPort}/" width="420" height="640"></iframe>`);
}).listen(otherPort, '127.0.0.1');
console.log(`tsbot QA servers on ${tsPort}, ${imtsPort}, ${otherPort}`);
