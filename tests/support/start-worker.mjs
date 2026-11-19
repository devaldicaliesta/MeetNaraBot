// Starts the real Worker for QA: fresh local D1, migrations, a seeded sample document and
// dummy channel secrets. Chat-app API calls go to the fake server started by the tests.
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pbkdf2Sync, randomBytes } from 'node:crypto';

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
const doc = (bot, prefix, name, rows) => [
  `INSERT INTO file (id, bot_id, name, status, chunk_count, embedder) VALUES ('${prefix}-file', '${bot}', '${name}', 'selesai', ${rows.length}, 'workers-ai');`,
  ...rows.flatMap(([label, text], i) => [
    `INSERT INTO chunks (id, bot_id, file_id, idx, label, text) VALUES ('${prefix}-${i}', '${bot}', '${prefix}-file', ${i}, ${q(label)}, ${q(text)});`,
    `INSERT INTO chunks_fts (chunk_id, bot_id, label, text) VALUES ('${prefix}-${i}', '${bot}', ${q(label)}, ${q(text)});`,
  ]),
];
// Same PBKDF2 parameters as src/auth.ts, so seeded accounts can sign in.
const account = (id, email, password, expires) => {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, 30000, 32, 'sha256').toString('hex');
  return `INSERT INTO users (id, email, name, pass_hash, pass_salt, pass_iter, expires_at) VALUES ('${id}', '${email}', 'QA', '${hash}', '${salt.toString('hex')}', 30000, '${expires}');`;
};
const future = new Date(Date.now() + 5 * 864e5).toISOString();
const past = new Date(Date.now() - 864e5).toISOString();
const sql = [
  // Platform bot
  ...doc('default', 'qa000000', 'panduan-pendaftaran.md', chunks),
  // Two user bots owned by different accounts, each with a secret only it may reveal
  account('qauserone0000001', 'owner-a@qa.test', 'owner-a-password', future),
  account('qausertwo0000002', 'owner-b@qa.test', 'owner-b-password', future),
  `INSERT INTO bots (id, owner_id, name) VALUES ('qabotaaaa1', 'qauserone0000001', 'Bot A'), ('qabotbbbb2', 'qausertwo0000002', 'Bot B');`,
  ...doc('qabotaaaa1', 'qaaaaaaa', 'katalog-a.md', [['Katalog A › Kode', 'Kode promo rahasia toko A adalah MANGGA-4417 dan berlaku sampai akhir bulan.']]),
  // Bot A has a second document: answers must name the document each excerpt came from.
  ...doc('qabotaaaa1', 'qaaaaab2', 'jam-buka-a.md', [['Jam Buka › Toko', 'Toko A buka setiap hari pukul 08.00 sampai 21.00, kecuali hari Minggu.']]),
  ...doc('qabotbbbb2', 'qabbbbbb', 'katalog-b.md', [['Katalog B › Kode', 'Kode promo rahasia toko B adalah DURIAN-9083 untuk pelanggan setia.']]),
  // An account whose 7-day period is over, with a bot
  account('qauserexpired003', 'expired@qa.test', 'expired-password', past),
  `INSERT INTO bots (id, owner_id, name) VALUES ('qaexpired1', 'qauserexpired003', 'Bot kedaluwarsa');`,
  ...doc('qaexpired1', 'qaexpire', 'lama.md', [['Lama', 'Isi dokumen lama yang tidak boleh dijawab lagi.']]),
  // The bot TSbot shows (PERMANENT_BOTS): its account is past 7 days but must keep working.
  account('qausertsbot00004', 'tsbot@qa.test', 'tsbot-password', past),
  `INSERT INTO bots (id, owner_id, name) VALUES ('qatsbot001', 'qausertsbot00004', 'TSbot');`,
  // Past its 7 days: signs up again with the same e-mail.
  account('qauseragain00007', 'again@qa.test', 'again-old-password', past),
  `INSERT INTO bots (id, owner_id, name) VALUES ('qaagainold', 'qauseragain00007', 'Bot lama');`,
  // A second permanent bot whose account still has days left: the limit is lifted before it runs out.
  account('qausertsbot00005', 'tsbot-active@qa.test', 'tsbot-active-password', future),
  `INSERT INTO bots (id, owner_id, name) VALUES ('qatsbot002', 'qausertsbot00005', 'TSbot 2');`,
  ...doc('qatsbot001', 'qatsbotf', 'tsbot.md', [['TSbot › Jam', 'Layanan TSbot buka setiap hari kerja pukul 08.00.']]),
].join('\n');
fs.writeFileSync(path.join(state, 'seed.sql'), sql);
wrangler('d1', 'execute', 'tanyasaya-db', '--file', path.join(state, 'seed.sql'));

const vars = {
  ADMIN_PASSWORD: password,
  HF_TOKEN: 'qa-dummy-hf-secret-value',
  DEPLOY_TOKEN: 'qa-deploy-token-0123456789abcdef0123456789abcdef',
  TELEGRAM_BOT_TOKEN: '123456:qa-dummy-telegram-token',
  TELEGRAM_API_BASE: `http://127.0.0.1:${fakePort}/telegram`,
  WHATSAPP_TOKEN: 'qa-dummy-whatsapp-token',
  WHATSAPP_PHONE_NUMBER_ID: '1000000001',
  WHATSAPP_VERIFY_TOKEN: 'qa-verify-token',
  WHATSAPP_APP_SECRET: 'qa-app-secret',
  WHATSAPP_API_BASE: `http://127.0.0.1:${fakePort}/whatsapp`,
  PERMANENT_BOTS: 'qatsbot001,qatsbot002',
};
const args = ['wrangler', 'dev', '--local', '--test-scheduled', '--port', port, '--ip', '127.0.0.1', '--persist-to', state, ...Object.entries(vars).flatMap(([k, v]) => ['--var', `${k}:${v}`])];
const child = spawn('npx', args, { stdio: 'inherit' });
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
child.on('exit', (code) => process.exit(code ?? 0));
