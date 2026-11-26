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

test('the IMTS page shows TSbot in an iframe', async ({ page, request }) => {
  const res = await request.get(`http://127.0.0.1:${IMTS_PORT}/`);
  const csp = res.headers()['content-security-policy'];
  expect(csp).toContain('frame-src http://127.0.0.1:8801');
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).not.toContain('script-src');
  for (const [w, h] of [[390, 844], [1280, 900]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(`http://127.0.0.1:${IMTS_PORT}/`);
    await expect(page.locator('h1')).toHaveText('IMTS');
    await expect(page.frameLocator('iframe').locator('tanyasaya-chat textarea')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  }
});

test('other sites cannot embed TSbot', async ({ page }) => {
  await page.goto(`http://127.0.0.1:${OTHER_PORT}/`);
  await page.waitForTimeout(1500);
  const frame = page.frames().find((f) => f !== page.mainFrame());
  expect(await frame?.locator('tanyasaya-chat').count().catch(() => 0)).toBe(0);
});

test('shows the server reason when the bot cannot be loaded, not "connection lost"', async ({ page }) => {
  await page.route(`${API}/api/public/info**`, (r) =>
    r.fulfill({ status: 404, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Bot ini tidak ditemukan. Periksa kode widget di website Anda.' }) })
  );
  await page.goto('/');
  const chat = page.locator('tanyasaya-chat');
  await expect(chat.locator('.msg.bot').first()).toContainText('Bot ini tidak ditemukan');
  await expect(chat.locator('.msg.bot').first()).not.toContainText('Koneksi terputus');
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
  await expect(chat.locator('.msg.bot').first()).toContainText('panduan-pendaftaran.md');
});

/** Serves the real info reply with the owner's manual suggested questions in place of the automatic ones. */
const MANUAL = ['Berapa biaya pendaftaran?', 'Kapan kursus dimulai?'];
async function withManualSuggestions(page: import('@playwright/test').Page) {
  await page.route(`${API}/api/public/info**`, async (r) => {
    const res = await r.fetch();
    r.fulfill({ response: res, json: { ...(await res.json()), suggestions: MANUAL } });
  });
}

test('the back button returns to the manual suggested questions', async ({ page }) => {
  await withManualSuggestions(page);
  await page.goto('/');
  const chat = page.locator('tanyasaya-chat');
  const back = chat.getByRole('button', { name: 'Kembali ke saran pertanyaan' });
  await expect(chat.locator('.chip')).toHaveText(MANUAL);
  // Nothing to go back from yet, so the button is not offered.
  await expect(back).toBeHidden();

  await chat.locator('.chip').first().click();
  await expect(chat.locator('.msg.user')).toHaveText(MANUAL[0]);
  await expect(chat.locator('.cite').first()).toBeVisible();
  await expect(chat.locator('.chip')).toHaveCount(0);
  await expect(back).toBeVisible();
  await expect(chat.locator('.reset svg path')).toHaveAttribute('d', 'M19 12H6M11 6l-6 6 6 6');

  // Back waits until the answer has finished streaming.
  await expect(back).toBeEnabled();
  await back.press('Enter');
  await expect(chat.locator('.chip')).toHaveText(MANUAL);
  await expect(chat.locator('.msg.user')).toHaveCount(0);
  await expect(back).toBeHidden();
  await expect(chat.locator('.chip').first()).toBeFocused();
  // The conversation is gone for good, not just hidden until the next reload.
  await page.reload();
  await expect(chat.locator('.chip')).toHaveText(MANUAL);
  await expect(chat.locator('.msg.user')).toHaveCount(0);
});

test('the back button follows the language switch', async ({ page }) => {
  await page.goto('/');
  const chat = page.locator('tanyasaya-chat');
  await chat.locator('.lang').click();
  await expect(chat.locator('.reset')).toHaveAttribute('aria-label', 'Back to suggested questions');
});

test('server and model text never becomes markup (DOM XSS harness)', async ({ page }) => {
  const payloads = [
    '<img src=x onerror="window.__xss=1">',
    '**<svg onload="window.__xss=2">**',
    '`<script>window.__xss=3</script>`',
    '[1]"><img src=x onerror="window.__xss=4">',
    '*<a href="javascript:window.__xss=5">x</a>*',
    '\u00000\u0000<iframe srcdoc="<script>parent.__xss=6</script>">',
    '1. <details open ontoggle="window.__xss=7">',
    '# <style>*{display:none}</style>',
  ];
  const evil = payloads.join('\n');
  await page.route(`${API}/api/public/info**`, (r) =>
    r.fulfill({
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      json: { name: '<b>Nara</b>', ready: true, greeting: evil, subtitle: '<i>x</i>', suggestions: ['<img src=x onerror="window.__xss=8">'], themeColor: 'red;background:url(//evil.example/x)', maxQuestionLength: 500, maxHistory: 6 },
    })
  );
  await page.route(`${API}/api/public/chat**`, (r) => {
    const events = [
      { type: 'sources', items: [{ number: '1"><img src=x onerror="window.__xss=9">', label: '<img src=x onerror="window.__xss=10">', snippet: '<svg onload="window.__xss=11">', document: 'd' }] },
      { type: 'delta', text: evil + ' [1]' },
      { type: 'done', refused: false, sig: '"><img>' },
    ];
    r.fulfill({ contentType: 'application/x-ndjson', headers: { 'Access-Control-Allow-Origin': '*' }, body: events.map((e) => JSON.stringify(e)).join('\n') + '\n' });
  });
  await page.goto('/');
  const chat = page.locator('tanyasaya-chat');
  await chat.locator('.chip').click();
  await expect(chat.locator('.msg.bot .msg-tools')).toHaveCount(1);
  const injected = await chat.evaluate((el) =>
    [...el.shadowRoot!.querySelectorAll('.log img, .log script, .log iframe, .log style, .log a, .log details, .log svg:not(.tool svg)')].map((n) => n.outerHTML)
  );
  expect(injected).toEqual([]);
  await expect(chat.locator('.msg.bot').last()).toContainText('<img src=x onerror=');
  expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
  // The colour is not a hex value, so the widget's own accent stays in place.
  expect(await chat.evaluate((el) => getComputedStyle(el).getPropertyValue('--ts-accent').trim())).not.toContain('url(');
});

test('retrying after a broken answer asks the question once', async ({ page }) => {
  let calls = 0;
  await page.route(`${API}/api/public/chat**`, (r) => {
    calls++;
    const events = calls === 1
      ? [{ type: 'sources', items: [] }, { type: 'delta', text: 'Biaya pendaft' }, { type: 'error', message: 'Koneksi ke model terputus.' }]
      : [{ type: 'sources', items: [] }, { type: 'delta', text: 'Biaya pendaftaran Rp150.000.' }, { type: 'done', refused: false }];
    r.fulfill({ contentType: 'application/x-ndjson', headers: { 'Access-Control-Allow-Origin': '*' }, body: events.map((e) => JSON.stringify(e)).join('\n') + '\n' });
  });
  await page.goto('/');
  const chat = page.locator('tanyasaya-chat');
  await chat.locator('textarea').fill('Berapa biaya pendaftaran?');
  await chat.locator('textarea').press('Enter');
  await chat.locator('[data-action="retry"]').click();
  await expect(chat.locator('.msg.bot').last()).toContainText('Rp150.000');
  await expect(chat.locator('.msg.user')).toHaveCount(1);
  await expect(chat.locator('.msg.error')).toHaveCount(0);
});

test('TSbot inside the IMTS iframe is sandboxed and still answers', async ({ page }) => {
  await page.goto(`http://127.0.0.1:${IMTS_PORT}/`);
  await expect(page.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin');
  const chat = page.frameLocator('iframe').locator('tanyasaya-chat');
  await chat.locator('textarea').fill('Berapa biaya pendaftaran?');
  await chat.locator('textarea').press('Enter');
  await expect(chat.locator('.cite').first()).toBeVisible();
  // A sandboxed frame cannot navigate the IMTS page away.
  const frame = page.frames().find((f) => f !== page.mainFrame())!;
  await frame.evaluate(() => { try { window.top!.location.href = 'about:blank#hijack'; } catch {} });
  await page.waitForTimeout(300);
  expect(page.url()).toBe(`http://127.0.0.1:${IMTS_PORT}/`);
});
