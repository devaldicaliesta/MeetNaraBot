import { expect, test, type APIRequestContext } from '@playwright/test';
import { QA_PASSWORD } from '../../playwright.config';

// Seeded by tests/support/start-worker.mjs: Bot A (owner-a) knows MANGGA-4417, Bot B (owner-b) knows
// DURIAN-9083, and qaexpired1 belongs to an account whose 7-day period is over.
test.describe.configure({ mode: 'serial' });

const chat = async (request: APIRequestContext, bot: string, question: string) => {
  const res = await request.post(`/api/public/chat?bot=${bot}`, { data: { question, history: [], website: '', lang: 'id' } });
  return { status: res.status(), body: await res.json() };
};
const login = async (request: APIRequestContext, email: string, password: string) => {
  const res = await request.post('/api/auth/login', { data: { email, password } });
  return { status: res.status(), body: await res.json() };
};

test('sign-up validates e-mail and password', async ({ request }) => {
  expect((await request.post('/api/auth/signup', { data: { email: 'not-an-email', password: 'long-enough-pass' } })).status()).toBe(400);
  expect((await request.post('/api/auth/signup', { data: { email: 'short@qa.test', password: 'short' } })).status()).toBe(400);
});

test('a new account gets a session, a first bot and a 7-day expiry', async ({ request }) => {
  const res = await request.post('/api/auth/signup', { data: { email: 'new-user@qa.test', password: 'correct-horse-battery', name: 'Budi' } });
  expect(res.status()).toBe(201);
  const body = await res.json();
  expect(body.token).toMatch(/^nara_[0-9a-f]{64}$/);
  expect(body.bots).toHaveLength(1);
  const days = (Date.parse(body.user.expires_at) - Date.now()) / 864e5;
  expect(days).toBeGreaterThan(6.9);
  expect(days).toBeLessThanOrEqual(7);
  expect(JSON.stringify(body)).not.toContain('pass_hash');

  const auth = { Authorization: `Bearer ${body.token}` };
  const status = await request.get('/api/admin/status', { headers: { ...auth, 'X-Bot-Id': body.bots[0].id } });
  expect(status.status()).toBe(200);
  expect(await status.json()).toMatchObject({ bot: body.bots[0].id, platform: false, account: { email: 'new-user@qa.test' } });

  expect((await request.post('/api/auth/signup', { data: { email: 'NEW-USER@qa.test', password: 'another-password' } })).status()).toBe(409);
});

test("a user cannot reach another user's bot or the platform bot", async ({ request }) => {
  const a = await login(request, 'owner-a@qa.test', 'owner-a-password');
  expect(a.status).toBe(200);
  const auth = { Authorization: `Bearer ${a.body.token}` };
  expect((await request.get('/api/admin/status', { headers: { ...auth, 'X-Bot-Id': 'qabotaaaa1' } })).status()).toBe(200);
  for (const other of ['qabotbbbb2', 'default', 'qaexpired1', '']) {
    for (const path of ['/api/admin/status', '/api/admin/config', '/api/admin/logs', '/api/admin/chunks']) {
      expect((await request.get(path, { headers: { ...auth, 'X-Bot-Id': other } })).status(), `${path} for ${other || '(none)'}`).toBe(403);
    }
  }
  expect((await request.delete('/api/auth/bots/qabotbbbb2', { headers: auth })).status()).toBe(404);
});

test('the platform admin password only manages the platform bot', async ({ request }) => {
  const admin = { Authorization: `Bearer ${QA_PASSWORD}` };
  expect((await request.get('/api/admin/status', { headers: admin })).status()).toBe(200);
  expect((await request.get('/api/admin/status', { headers: { ...admin, 'X-Bot-Id': 'qabotaaaa1' } })).status()).toBe(403);
});

test("public chat answers only from the asked bot's own document", async ({ request }) => {
  const own = await chat(request, 'qabotaaaa1', 'Apa kode promo rahasia toko?');
  expect(own.status).toBe(200);
  expect(own.body.answer).toContain('MANGGA-4417');
  expect(own.body.answer).not.toContain('DURIAN-9083');

  const leak = await chat(request, 'qabotaaaa1', 'Berapa kode promo DURIAN untuk pelanggan setia?');
  expect(leak.body.answer || leak.body.error).not.toContain('DURIAN-9083');

  const b = await chat(request, 'qabotbbbb2', 'Apa kode promo rahasia toko?');
  expect(b.body.answer).toContain('DURIAN-9083');
  expect(b.body.answer).not.toContain('MANGGA-4417');

  const platform = await chat(request, 'default', 'kode promo rahasia MANGGA');
  expect(JSON.stringify(platform.body)).not.toContain('MANGGA-4417');
});

test("a user bot never sees the platform's provider secrets", async ({ request }) => {
  const admin = await request.get('/api/admin/status', { headers: { Authorization: `Bearer ${QA_PASSWORD}` } });
  const hf = (s: any) => s.keys.find((k: any) => k.id === 'huggingface');
  expect(hf(await admin.json())).toMatchObject({ configured: true, source: 'secret' });

  const a = await login(request, 'owner-a@qa.test', 'owner-a-password');
  const user = await request.get('/api/admin/status', { headers: { Authorization: `Bearer ${a.body.token}`, 'X-Bot-Id': 'qabotaaaa1' } });
  expect(hf(await user.json())).toMatchObject({ configured: false, source: null });
});

test('user bots cannot pick expensive Workers AI models', async ({ request }) => {
  const a = await login(request, 'owner-a@qa.test', 'owner-a-password');
  const headers = { Authorization: `Bearer ${a.body.token}`, 'X-Bot-Id': 'qabotaaaa1' };
  const res = await request.post('/api/admin/test-provider', { headers, data: { provider: 'workers-ai', model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' } });
  const body = await res.json();
  expect(body.ok).toBe(false);
  expect(body.error).toContain('tidak tersedia untuk bot pengguna');
});

test('unknown bots are 404 and expired accounts stop answering', async ({ request }) => {
  expect((await request.get('/api/public/info?bot=doesnotexist1')).status()).toBe(404);
  const info = await request.get('/api/public/info?bot=qaexpired1');
  expect(info.status()).toBe(200);
  expect(await info.json()).toMatchObject({ ready: false, subtitle: 'Tidak aktif' });
  const res = await chat(request, 'qaexpired1', 'Apa isi dokumen lama?');
  expect(res.status).toBe(403);
  expect(res.body.error).toContain('tidak aktif');

  const signIn = await login(request, 'expired@qa.test', 'expired-password');
  expect(signIn.status).toBe(403);
  expect(signIn.body.error).toContain('7 hari');
});

test('an expired e-mail can sign up again right away, replacing the old account', async ({ request }) => {
  expect((await login(request, 'again@qa.test', 'again-old-password')).status).toBe(403);
  const res = await request.post('/api/auth/signup', { data: { email: 'again@qa.test', password: 'brand-new-password', name: 'Lagi' } });
  expect(res.status()).toBe(201);
  // The old account and its bot are gone; the new password works, the old one does not.
  expect((await request.get('/api/public/info?bot=qaagainold')).status()).toBe(404);
  expect((await login(request, 'again@qa.test', 'brand-new-password')).status).toBe(200);
  expect((await login(request, 'again@qa.test', 'again-old-password')).status).toBe(401);
  // An active account still cannot be taken over by signing up with its e-mail.
  expect((await request.post('/api/auth/signup', { data: { email: 'owner-a@qa.test', password: 'some-other-password' } })).status()).toBe(409);
});

test('the daily cleanup deletes expired accounts with their bots and data', async ({ request }) => {
  const run = await request.get('/__scheduled?cron=23+3+*+*+*');
  expect(run.ok()).toBeTruthy();
  await expect.poll(async () => (await request.get('/api/public/info?bot=qaexpired1')).status(), { timeout: 10_000 }).toBe(404);
  // The expired account can no longer sign in at all, and active accounts are untouched.
  expect((await login(request, 'expired@qa.test', 'expired-password')).status).toBe(401);
  expect((await request.get('/api/public/info?bot=qabotaaaa1')).status()).toBe(200);
});

test('the TSbot bot (PERMANENT_BOTS) skips the 7-day limit and survives the cleanup', async ({ request }) => {
  const info = await request.get('/api/public/info?bot=qatsbot001');
  expect(await info.json()).toMatchObject({ ready: true });
  expect((await chat(request, 'qatsbot001', 'halo')).status).toBe(200);
  const signIn = await login(request, 'tsbot@qa.test', 'tsbot-password');
  expect(signIn.status).toBe(200);
  expect(signIn.body.user.expires_at).toMatch(/^9999-/);
  await request.get('/__scheduled?cron=23+3+*+*+*');
  await expect.poll(async () => (await request.get('/api/public/info?bot=qaexpired1')).status(), { timeout: 10_000 }).toBe(404);
  expect((await request.get('/api/public/info?bot=qatsbot001')).status()).toBe(200);
});

test('a permanent bot account that still has days left loses its limit at sign-in', async ({ request }) => {
  const signIn = await login(request, 'tsbot-active@qa.test', 'tsbot-active-password');
  expect(signIn.status).toBe(200);
  expect(signIn.body.user.expires_at).toMatch(/^9999-/);
  const me = await request.get('/api/auth/me', { headers: { Authorization: `Bearer ${signIn.body.token}` } });
  expect((await me.json()).user.expires_at).toMatch(/^9999-/);
});

test('an account in PERMANENT_EMAILS keeps working after its 7 days', async ({ request }) => {
  const signIn = await login(request, 'owner-forever@qa.test', 'owner-forever-password');
  expect(signIn.status).toBe(200);
  expect(signIn.body.user.expires_at).toMatch(/^9999-/);
  expect((await request.get('/api/public/info?bot=qaforever1')).status()).toBe(200);
});

test('bots can be created up to the limit and deleted with their data', async ({ request }) => {
  const b = await login(request, 'owner-b@qa.test', 'owner-b-password');
  const auth = { Authorization: `Bearer ${b.body.token}` };
  const created: string[] = [];
  for (let i = 0; i < 2; i++) {
    const res = await request.post('/api/auth/bots', { headers: auth, data: { name: `Bot tambahan ${i}` } });
    expect(res.status()).toBe(201);
    created.push((await res.json()).bot.id);
  }
  expect((await request.post('/api/auth/bots', { headers: auth, data: { name: 'Terlalu banyak' } })).status()).toBe(409);

  expect((await request.delete('/api/auth/bots/qabotbbbb2', { headers: auth })).status()).toBe(200);
  expect((await request.get('/api/public/info?bot=qabotbbbb2')).status()).toBe(404);
  const me = await (await request.get('/api/auth/me', { headers: auth })).json();
  expect(me.bots.map((x: any) => x.id).sort()).toEqual(created.sort());
});

test('user bots cannot index oversized documents (shared AI budget)', async ({ request }) => {
  const b = await login(request, 'owner-b@qa.test', 'owner-b-password');
  const auth = { Authorization: `Bearer ${b.body.token}` };
  const bot = (await (await request.get('/api/auth/me', { headers: auth })).json()).bots[0].id;
  const headers = { ...auth, 'X-Bot-Id': bot };
  expect((await request.post('/api/admin/file', { headers, data: { name: 'besar.md' } })).status()).toBe(200);
  const chunks = Array.from({ length: 10 }, (_, i) => ({ label: `Bagian ${i}`, text: 'isi '.repeat(20) }));
  const res = await request.post('/api/admin/file/chunks', { headers, data: { startIdx: 395, chunks } });
  expect(res.status()).toBe(413);
  expect((await res.json()).error).toContain('400 potongan');
  await request.delete('/api/admin/file', { headers });
});

test('a bot answers from several documents and names the source of each excerpt', async ({ request }) => {
  const a = await login(request, 'owner-a@qa.test', 'owner-a-password');
  const headers = { Authorization: `Bearer ${a.body.token}`, 'X-Bot-Id': 'qabotaaaa1' };
  const status = await (await request.get('/api/admin/status', { headers })).json();
  expect(status.files.map((f: any) => f.name).sort()).toEqual(['jam-buka-a.md', 'katalog-a.md']);
  expect(status.file.status).toBe('selesai');

  const hours = await chat(request, 'qabotaaaa1', 'Jam berapa toko buka?');
  expect(hours.status).toBe(200);
  expect(hours.body.answer).toContain('08.00');
  expect(hours.body.sources.map((s: any) => s.document)).toContain('jam-buka-a.md');
  const promo = await chat(request, 'qabotaaaa1', 'Apa kode promo rahasia toko?');
  expect(promo.body.answer).toContain('MANGGA-4417');
  expect(promo.body.sources.map((s: any) => s.document)).toContain('katalog-a.md');

  // Another owner cannot delete this bot's document by guessing its id.
  const b = await login(request, 'owner-b@qa.test', 'owner-b-password');
  const authB = { Authorization: `Bearer ${b.body.token}` };
  const botB = (await (await request.get('/api/auth/me', { headers: authB })).json()).bots[0].id;
  expect((await request.delete('/api/admin/file?id=qaaaaab2-file', { headers: { ...authB, 'X-Bot-Id': botB } })).status()).toBe(404);

  // Deleting one document keeps the other one answering.
  expect((await request.delete('/api/admin/file?id=qaaaaab2-file', { headers })).status()).toBe(200);
  const after = await (await request.get('/api/admin/status', { headers })).json();
  expect(after.files.map((f: any) => f.name)).toEqual(['katalog-a.md']);
  expect((await chat(request, 'qabotaaaa1', 'Apa kode promo rahasia toko?')).body.answer).toContain('MANGGA-4417');
  expect((await chat(request, 'qabotaaaa1', 'Jam berapa toko buka?')).body.answer).not.toContain('08.00');
});


test('failed logins lock one e-mail, not every account', async ({ request }) => {
  const from = (n: number) => ({ 'cf-connecting-ip': `198.51.100.${n}` });
  for (let i = 0; i < 9; i++) {
    await request.post('/api/auth/login', { headers: from(i + 1), data: { email: 'owner-a@qa.test', password: `wrong-guess-${i}` } });
  }
  // The guessed account is locked even from a fresh IP, with the right password …
  const locked = await request.post('/api/auth/login', { headers: from(50), data: { email: 'owner-a@qa.test', password: 'owner-a-password' } });
  expect(locked.status()).toBe(429);
  // … while another user can still sign in.
  const other = await request.post('/api/auth/login', { headers: from(51), data: { email: 'new-user@qa.test', password: 'correct-horse-battery' } });
  expect(other.status()).toBe(200);
});

test('signing out ends the session', async ({ request }) => {
  const a = await login(request, 'new-user@qa.test', 'correct-horse-battery');
  const auth = { Authorization: `Bearer ${a.body.token}` };
  const bot = a.body.bots[0].id;
  expect((await request.get('/api/auth/me', { headers: auth })).status()).toBe(200);
  await request.post('/api/auth/logout', { headers: auth });
  expect((await request.get('/api/auth/me', { headers: auth })).status()).toBe(401);
  expect((await request.get('/api/admin/status', { headers: { ...auth, 'X-Bot-Id': bot } })).status()).toBe(401);
});

test('sign-ups are limited per IP per day', async ({ request }) => {
  // Earlier tests already used part of this IP's budget of 5 sign-ups.
  let last = 0;
  for (let i = 0; i < 6; i++) {
    last = (await request.post('/api/auth/signup', { data: { email: `bulk-${i}@qa.test`, password: 'bulk-user-password' } })).status();
    if (last === 429) break;
  }
  expect(last).toBe(429);
});
