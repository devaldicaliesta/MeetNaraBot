// Starts the real Worker for QA: fresh local D1, migrations, a seeded sample document and
// dummy channel secrets. Chat-app API calls go to the fake server started by the tests.
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [port, fakePort, password] = process.argv.slice(2);
const state = path.resolve('.qa/state');
fs.rmSync(state, { recursive: true, force: true });
fs.mkdirSync(state, { recursive: true });

const wrangler = (...args) => execFileSync('npx', ['wrangler', ...args, '--local', '--persist-to', state], { stdio: 'inherit' });
wrangler('d1', 'migrations', 'apply', 'tanyasaya-db');

const chunks = [
  ['Panduan Pendaftaran › Biaya', 'Biaya pendaftaran sebesar Rp150.000 dibayar sekali. Biaya kursus per bulan Rp450.000.'],
  ['Panduan Pendaftaran › Jadwal', 'Kelas akhir pekan berlangsung setiap Sabtu pukul 09.00 sampai 12.00.'],
];
const q = (s) => `'${s.replace(/'/g, "''")}'`;
const sql = [
  `INSERT INTO file (id, name, status, chunk_count, embedder) VALUES ('qa000000-file', 'panduan-pendaftaran.md', 'selesai', ${chunks.length}, 'workers-ai');`,
  ...chunks.flatMap(([label, text], i) => [
    `INSERT INTO chunks (id, idx, label, text) VALUES ('qa000000-${i}', ${i}, ${q(label)}, ${q(text)});`,
    `INSERT INTO chunks_fts (chunk_id, label, text) VALUES ('qa000000-${i}', ${q(label)}, ${q(text)});`,
  ]),
].join('\n');
fs.writeFileSync(path.join(state, 'seed.sql'), sql);
wrangler('d1', 'execute', 'tanyasaya-db', '--file', path.join(state, 'seed.sql'));

const vars = {
  ADMIN_PASSWORD: password,
  DEPLOY_TOKEN: 'qa-deploy-token-0123456789abcdef0123456789abcdef',
  TELEGRAM_BOT_TOKEN: '123456:qa-dummy-telegram-token',
  TELEGRAM_API_BASE: `http://127.0.0.1:${fakePort}/telegram`,
  WHATSAPP_TOKEN: 'qa-dummy-whatsapp-token',
  WHATSAPP_PHONE_NUMBER_ID: '1000000001',
  WHATSAPP_VERIFY_TOKEN: 'qa-verify-token',
  WHATSAPP_APP_SECRET: 'qa-app-secret',
  WHATSAPP_API_BASE: `http://127.0.0.1:${fakePort}/whatsapp`,
};
const args = ['wrangler', 'dev', '--local', '--port', port, '--ip', '127.0.0.1', '--persist-to', state, ...Object.entries(vars).flatMap(([k, v]) => ['--var', `${k}:${v}`])];
const child = spawn('npx', args, { stdio: 'inherit' });
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
child.on('exit', (code) => process.exit(code ?? 0));
