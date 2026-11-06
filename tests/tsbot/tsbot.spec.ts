import { expect, test } from '@playwright/test';
import { IMTS_PORT, OTHER_PORT, QA_PASSWORD } from '../../playwright.config';

const API = 'http://127.0.0.1:8799';

test.beforeAll(async ({ request }) => {
  const h = { Authorization: `Bearer ${QA_PASSWORD}` };
  await request.delete(`${API}/api/admin/file`, { headers: h });
  await request.post(`${API}/api/admin/file`, { headers: h, data: { name: 'panduan-pendaftaran.md' } });
  await request.post(`${API}/api/admin/file/chunks`, {
    headers: h,
    data: { startIdx: 0, chunks: [{ label: 'Panduan Pendaftaran › Biaya', text: 'Biaya pendaftaran sebesar Rp150.000 dibayar sekali. Biaya kursus per bulan Rp450.000.' }] },
  });
  await request.post(`${API}/api/admin/file/done`, { headers: h });
});

test('serves strict security headers', async ({ request }) => {
  const res = await request.get('/');
  const csp = res.headers()['content-security-policy'];
  expect(csp).toContain("script-src 'self'");
  expect(csp).not.toContain('unsafe-inline');
  expect(csp).toContain(`connect-src ${API}`);
  expect(csp).toContain(`frame-ancestors http://127.0.0.1:${IMTS_PORT}`);
  expect(res.headers()['x-content-type-options']).toBe('nosniff');
  expect(res.headers()['referrer-policy']).toBe('no-referrer');
});

for (const [w, h] of [[390, 844], [1440, 900]] as const) {
  test(`chat fills a ${w}px page without a launcher`, async ({ page }) => {
    const violations: string[] = [];
    page.on('console', (m) => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()); });
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/');
    const chat = page.locator('tanyasaya-chat');
    await expect(chat.locator('textarea')).toBeVisible();
    await expect(chat.locator('.launcher')).toBeHidden();
    await expect(chat.locator('.close')).toBeHidden();
    const box = await chat.locator('.panel').boundingBox();
    expect(box?.width).toBe(w);
    expect(box?.height).toBe(h);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
    await page.keyboard.press('Escape');
    await expect(chat.locator('textarea')).toBeVisible();
    expect(violations).toEqual([]);
  });
}

test('answers from the document with a clickable citation', async ({ page }) => {
  await page.goto('/');
  const chat = page.locator('tanyasaya-chat');
  await chat.locator('textarea').fill('Berapa biaya pendaftaran?');
  await chat.locator('textarea').press('Enter');
  const cite = chat.locator('.cite').first();
  await expect(cite).toBeVisible();
  await cite.click();
  await expect(chat.locator('.source.is-active')).toContainText('Biaya');
});

test('IMTS can embed TSbot in an iframe', async ({ page }) => {
  await page.goto(`http://127.0.0.1:${IMTS_PORT}/`);
  await expect(page.frameLocator('#tsbot').locator('tanyasaya-chat textarea')).toBeVisible();
});

test('other sites cannot embed TSbot', async ({ page }) => {
  await page.goto(`http://127.0.0.1:${OTHER_PORT}/`);
  await page.waitForTimeout(1500);
  const frame = page.frames().find((f) => f !== page.mainFrame());
  expect(await frame?.locator('tanyasaya-chat').count().catch(() => 0)).toBe(0);
});

test('names the problem and offers a retry when the API is unreachable', async ({ page }) => {
  let down = true;
  await page.route(`${API}/api/public/info**`, (r) => (down ? r.abort() : r.continue()));
  await page.goto('/');
  const chat = page.locator('tanyasaya-chat');
  const retry = chat.locator('[data-action="reload-info"]');
  await expect(retry).toBeVisible();
  down = false;
  await retry.click();
  await expect(retry).toBeHidden();
  await expect(chat.locator('.msg.bot').first()).toContainText('panduan-pendaftaran');
});
