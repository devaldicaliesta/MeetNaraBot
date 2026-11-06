import { expect, test, type Page } from '@playwright/test';
import { QA_PASSWORD } from '../../playwright.config';

const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test.beforeAll(async ({ request }) => {
  // Give the mock a small document so the widget has something to answer from.
  const h = { Authorization: `Bearer ${QA_PASSWORD}` };
  await request.delete('/api/admin/file', { headers: h });
  await request.post('/api/admin/file', { headers: h, data: { name: 'panduan-pendaftaran.md' } });
  await request.post('/api/admin/file/chunks', {
    headers: h,
    data: { startIdx: 0, chunks: [{ label: 'Panduan Pendaftaran › Biaya', text: 'Biaya pendaftaran sebesar Rp150.000 dibayar sekali. Biaya kursus per bulan Rp450.000.' }] },
  });
  await request.post('/api/admin/file/done', { headers: h });
});

test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
});

for (const [w, h] of [[390, 844], [1440, 900]] as const) {
  test(`landing page fits a ${w}px screen`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Pengunjung bertanya');
    expect(await overflow(page)).toBe(0);
  });
}

test('widget answers from the document with a clickable citation', async ({ page }) => {
  await page.goto('/');
  await page.click('#try');
  const chat = page.locator('tanyasaya-chat');
  await chat.locator('textarea').fill('Berapa biaya pendaftaran?');
  await chat.locator('textarea').press('Enter');
  const cite = chat.locator('.cite').first();
  await expect(cite).toBeVisible();
  await cite.click();
  await expect(chat.locator('.source.is-active')).toContainText('Biaya');
});

test('widget greets small talk instead of refusing', async ({ page }) => {
  await page.goto('/');
  await page.click('#try');
  const chat = page.locator('tanyasaya-chat');
  await chat.locator('textarea').fill('halo');
  await chat.locator('textarea').press('Enter');
  await expect(chat.locator('.msg.bot .bubble').last()).toContainText('Halo, aku');
});

test('switching to English translates the landing page', async ({ page }) => {
  await page.goto('/');
  await page.locator('.lang-switch button[data-lang="en"]').click();
  await expect(page.locator('h1')).toContainText('Visitors ask');
  await page.locator('.lang-switch button[data-lang="id"]').click();
  await expect(page.locator('h1')).toContainText('Pengunjung bertanya');
});

test('dashboard rejects a wrong password', async ({ page }) => {
  await page.goto('/admin.html');
  await page.fill('#email', 'nobody@qa.test');
  await page.fill('#pass', 'wrong-password');
  await page.press('#pass', 'Enter');
  await expect(page.locator('#loginErr')).toBeVisible();
  await page.click('#platformToggle');
  await page.fill('#pass', 'wrong-password');
  await page.press('#pass', 'Enter');
  await expect(page.locator('#loginErr')).toContainText(/salah|Wrong/);
});

test('the dashboard links back to the landing page', async ({ page }) => {
  await page.goto('/admin');
  await page.locator('.back-home').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('h1')).toContainText('Pengunjung bertanya');
});

test('anyone can sign up, get their own bot, add a second one and embed it', async ({ page }) => {
  const email = `ui-${Date.now()}@qa.test`;
  await page.goto('/');
  await page.locator('a[href="/admin#daftar"]').first().click();
  await expect(page.locator('#fName')).toBeVisible();
  await page.fill('#name', 'Sinta');
  await page.fill('#email', email);
  await page.fill('#pass', 'sinta-password-123');
  await page.click('#authSubmit');
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#botSwitch')).toBeVisible();
  await expect(page.locator('#botSelect option')).toHaveCount(1);
  await expect(page.locator('#accountInfo')).toContainText(email);
  await expect(page.locator('#accountInfo')).toContainText('aktif sampai');

  page.once('dialog', (d) => d.accept('Bot Kedua'));
  await page.click('#botNew');
  await expect(page.locator('#botSelect option')).toHaveCount(2);
  await expect(page.locator('#botSelect')).toHaveValue(/[a-z0-9]{10}/);
  const botId = await page.locator('#botSelect').inputValue();

  await page.goto('/admin#pasang');
  await expect(page.locator('#snippet')).toContainText(`bot="${botId}"`);
  await expect(page.locator('#channelsPanel')).toBeHidden();

  page.once('dialog', (d) => d.accept());
  await page.click('#botDelete');
  await expect(page.locator('#botSelect option')).toHaveCount(1);
});

test('every dashboard page fits a phone screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin.html');
  await page.click('#platformToggle');
  await page.fill('#pass', QA_PASSWORD);
  await page.press('#pass', 'Enter');
  await expect(page.locator('#app')).toBeVisible();
  for (const name of ['ringkasan', 'dokumen', 'model', 'pencarian', 'uji', 'riwayat', 'pasang']) {
    await page.goto(`/admin.html#${name}`);
    await expect(page.locator(`[data-page="${name}"]`)).toBeVisible();
    expect(await overflow(page), `horizontal overflow on #${name}`).toBe(0);
  }
  await expect(page.locator('#channels')).toContainText('Telegram');
  await expect(page.locator('#channels')).toContainText('WhatsApp');
});

test('a bot uses several documents: list, answer with the right source, delete one', async ({ page, request }) => {
  const h = { Authorization: `Bearer ${QA_PASSWORD}` };
  const reg = await (await request.post('/api/admin/file', { headers: h, data: { name: 'jadwal-kelas.md' } })).json();
  await request.post('/api/admin/file/chunks', {
    headers: h,
    data: { fileId: reg.id, startIdx: 0, chunks: [{ label: 'Jadwal Kelas › Akhir pekan', text: 'Kelas akhir pekan berlangsung setiap Sabtu pukul 09.00 sampai 12.00.' }] },
  });
  await request.post('/api/admin/file/done', { headers: h, data: { fileId: reg.id } });

  // The widget answers from the second document; its source shows the section, never a file name.
  await page.goto('/');
  await page.click('#try');
  const chat = page.locator('tanyasaya-chat');
  await chat.locator('textarea').fill('Kapan kelas akhir pekan?');
  await chat.locator('textarea').press('Enter');
  const label = chat.locator('.source-label').first();
  await expect(label).toHaveText('Jadwal Kelas › Akhir pekan');
  await expect(chat.locator('.sources')).not.toContainText('.md');

  // The dashboard lists both documents and deletes only the chosen one.
  await page.goto('/admin.html');
  await page.click('#platformToggle');
  await page.fill('#pass', QA_PASSWORD);
  await page.press('#pass', 'Enter');
  await page.goto('/admin.html#dokumen');
  const cards = page.locator('#docList .doc-card');
  await expect(cards).toHaveCount(2);
  await expect(page.locator('#docEmpty')).toBeVisible();
  page.once('dialog', (d) => d.accept());
  await cards.filter({ hasText: 'jadwal-kelas.md' }).locator('[data-del]').click();
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText('panduan-pendaftaran.md');
});
