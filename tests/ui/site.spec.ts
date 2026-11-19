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

test('a new user picks a permanent account at sign-up and can switch it in the dashboard', async ({ page }) => {
  await page.goto('/admin.html#daftar');
  const choice = page.locator('#permanent');
  await expect(page.locator('#fPermanent')).toBeVisible();
  await expect(choice).toBeChecked();
  await expect(page.locator('#authNote')).toHaveText('Kata sandi minimal 10 karakter.');
  await page.fill('#name', 'Tetap');
  await page.fill('#email', `keep-${Date.now()}@qa.test`);
  await page.fill('#pass', 'tetap-password-123');
  await page.click('#authSubmit');
  await expect(page.locator('#app')).toBeVisible();
  const me = page.locator('#mePermanent');
  await expect(me).toBeChecked();
  await expect(page.locator('#accountCard .days')).toHaveCount(0);

  // Turning it off asks first; dismissing keeps it permanent.
  page.once('dialog', (d) => d.dismiss());
  await me.click();
  await expect(me).toBeChecked();
  page.once('dialog', (d) => d.accept());
  await me.click();
  await expect(page.locator('#accountCard .days')).toHaveText('7');
  await expect(page.locator('#toast')).toContainText('7 hari dari sekarang');
  // Back to permanent, by keyboard, with no confirmation.
  await page.locator('#mePermanent').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#mePermanent')).toBeChecked();
  await expect(page.locator('#accountCard .days')).toHaveCount(0);
});

test('the platform admin can hide the permanent choice, and sign-up and landing text follow', async ({ page }) => {
  await page.goto('/admin.html');
  await page.click('#platformToggle');
  await page.fill('#pass', QA_PASSWORD);
  await page.press('#pass', 'Enter');
  await expect(page.locator('#platformPanel')).toBeVisible();
  const box = page.locator('#allowPermanent');
  await expect(box).toBeEnabled();
  await expect(box).toBeChecked();

  // Off asks first.
  page.once('dialog', (d) => d.accept());
  await box.click();
  await expect(box).not.toBeChecked();
  await expect(page.locator('#allowPermanentState')).toContainText('semua akun aktif 7 hari');

  const other = await page.context().newPage();
  await other.goto('/admin.html#daftar');
  await expect(other.locator('#authNote')).toContainText('Akun aktif selama 7 hari');
  await expect(other.locator('#fPermanent')).toBeHidden();
  await other.goto('/');
  await expect(other.locator('#bandNote')).not.toContainText('permanen');
  await other.close();

  // On again needs no confirmation; the choice is back on the sign-up form and the landing page.
  await box.focus();
  await page.keyboard.press('Space');
  await expect(box).toBeChecked();
  await expect(page.locator('#allowPermanentState')).toContainText('boleh memilih');
  const after = await page.context().newPage();
  await after.goto('/admin.html#daftar');
  await expect(after.locator('#fPermanent')).toBeVisible();
  await after.goto('/');
  await expect(after.locator('#bandNote')).toContainText('pilih akun permanen atau 7 hari');
  await after.close();
});

test('on a phone the dashboard menu is a labelled button, and sign-out is reachable', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 760 } });
  const page = await ctx.newPage();
  await page.goto('/admin.html');
  await page.click('#platformToggle');
  await page.fill('#pass', QA_PASSWORD);
  await page.press('#pass', 'Enter');
  const toggle = page.locator('#navToggle');
  await expect(toggle).toBeVisible();
  await expect(page.locator('#navMenu')).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#logout')).toBeVisible();
  await page.locator('#navMenu a[href="#model"]').click();
  await expect(page.locator('#navCurrent')).toHaveText('Bot & model');
  await expect(page.locator('#navMenu')).toBeHidden();
  await toggle.click();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  await ctx.close();
});

test('only the provider keys in use are listed; the rest fold away', async ({ page }) => {
  await page.goto('/admin.html#model');
  await page.click('#platformToggle');
  await page.fill('#pass', QA_PASSWORD);
  await page.press('#pass', 'Enter');
  const more = page.locator('#keys details.more-keys');
  await expect(page.locator('#keys > .key-row[data-id="gemini"]')).toBeVisible();
  await expect(more).not.toHaveAttribute('open', '');
  await expect(more.locator('.key-row[data-id="groq"]')).toBeHidden();
  await more.locator('summary').click();
  await expect(more.locator('.key-row[data-id="groq"]')).toBeVisible();
});

test('a bot owner does not see the platform switch', async ({ page }) => {
  await page.goto('/admin.html#daftar');
  await page.fill('#name', 'Rani');
  await page.fill('#email', `switch-${Date.now()}@qa.test`);
  await page.fill('#pass', 'rani-password-123');
  await page.click('#authSubmit');
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#platformPanel')).toBeHidden();
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
  // Sign-up defaults to a permanent account (the user can still switch it off).
  await expect(page.locator('#accountInfo')).toContainText('tanpa batas waktu');

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
