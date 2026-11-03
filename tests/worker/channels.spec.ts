import { createHash, createHmac } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { FAKE_API_PORT } from '../../playwright.config';
import { startFakeChatApi } from '../support/fake-chat-api';

// Must match tests/support/start-worker.mjs and src/channels.ts (telegramSecret).
const TG_TOKEN = '123456:qa-dummy-telegram-token';
const TG_SECRET = createHash('sha256').update(`meetnarabot-telegram-webhook|${TG_TOKEN}`).digest('hex');
const WA_SECRET = 'qa-app-secret';

const fake = startFakeChatApi(FAKE_API_PORT);
test.beforeAll(() => fake.listen());
test.afterAll(() => fake.close());

let updateId = 1000;
const tgUpdate = (text: string, chat = 777, type = 'private') => {
  updateId++;
  return { update_id: updateId, message: { message_id: updateId, date: 0, text, chat: { id: chat, type }, from: { id: chat, language_code: 'id' } } };
};
const sentTo = (chat: number, includes: string) => (c: { service: string; method: string; body: any }) =>
  c.service === 'telegram' && c.method === 'sendMessage' && c.body.chat_id === chat && String(c.body.text).includes(includes);

test.describe('Telegram webhook', () => {
  test('rejects requests without the secret token', async ({ request }) => {
    const res = await request.post('/api/channels/telegram', { data: tgUpdate('halo') });
    expect(res.status()).toBe(401);
    const wrong = await request.post('/api/channels/telegram', { data: tgUpdate('halo'), headers: { 'X-Telegram-Bot-Api-Secret-Token': 'nope' } });
    expect(wrong.status()).toBe(401);
  });

  test('greets on /start with example questions', async ({ request }) => {
    const res = await request.post('/api/channels/telegram', { data: tgUpdate('/start', 701), headers: { 'X-Telegram-Bot-Api-Secret-Token': TG_SECRET } });
    expect(res.status()).toBe(200);
    const call = await fake.waitFor(sentTo(701, 'panduan-pendaftaran.md'));
    expect(call.body.parse_mode).toBe('HTML');
    expect(call.body.text).toContain('<b>Nara</b>');
    expect(call.body.text).toContain('/reset');
  });

  test('answers small talk without refusing', async ({ request }) => {
    await request.post('/api/channels/telegram', { data: tgUpdate('halo kak', 702), headers: { 'X-Telegram-Bot-Api-Secret-Token': TG_SECRET } });
    const call = await fake.waitFor(sentTo(702, 'Halo, aku'));
    expect(call.body.text).not.toContain('tidak ada di dokumen');
  });

  test('answers a document question with sources, even when no AI model is reachable', async ({ request }) => {
    // The QA Worker has no AI keys and no Workers AI, so this exercises the friendly excerpt fallback.
    await request.post('/api/channels/telegram', { data: tgUpdate('Berapa biaya pendaftaran?', 703), headers: { 'X-Telegram-Bot-Api-Secret-Token': TG_SECRET } });
    const call = await fake.waitFor(sentTo(703, 'Rp150.000'));
    expect(call.body.text).toContain('Maaf');
    expect(call.body.text).toContain('<b>Sumber</b>');
    expect(call.body.text).toMatch(/\[1\] Panduan Pendaftaran › Biaya/);
    expect(call.body.text).not.toMatch(/<(?!\/?(b|i|code)>)/); // only the safe tags are produced
  });

  test('handles a retried update only once', async ({ request }) => {
    const update = tgUpdate('makasih', 704);
    for (let i = 0; i < 3; i++) await request.post('/api/channels/telegram', { data: update, headers: { 'X-Telegram-Bot-Api-Secret-Token': TG_SECRET } });
    await fake.waitFor(sentTo(704, 'Sama-sama'));
    await new Promise((r) => setTimeout(r, 1500));
    expect(fake.calls.filter(sentTo(704, 'Sama-sama'))).toHaveLength(1);
  });

  test('stays quiet in groups unless a command is used', async ({ request }) => {
    await request.post('/api/channels/telegram', { data: tgUpdate('halo semua', -500, 'group'), headers: { 'X-Telegram-Bot-Api-Secret-Token': TG_SECRET } });
    await request.post('/api/channels/telegram', { data: tgUpdate('/start', -501, 'group'), headers: { 'X-Telegram-Bot-Api-Secret-Token': TG_SECRET } });
    await fake.waitFor(sentTo(-501, 'chat pribadi'));
    expect(fake.calls.filter((c) => c.method === 'sendMessage' && c.body.chat_id === -500)).toHaveLength(0);
  });
});

test.describe('WhatsApp webhook', () => {
  const sign = (raw: string) => 'sha256=' + createHmac('sha256', WA_SECRET).update(raw).digest('hex');
  const waPayload = (text: string, from: string, id: string) =>
    JSON.stringify({ object: 'whatsapp_business_account', entry: [{ changes: [{ field: 'messages', value: { metadata: { phone_number_id: '1000000001' }, messages: [{ from, id, type: 'text', text: { body: text } }] } }] }] });

  test('completes the verification handshake only with the right token', async ({ request }) => {
    const ok = await request.get('/api/channels/whatsapp?hub.mode=subscribe&hub.verify_token=qa-verify-token&hub.challenge=4242');
    expect(ok.status()).toBe(200);
    expect(await ok.text()).toBe('4242');
    const bad = await request.get('/api/channels/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=4242');
    expect(bad.status()).toBe(403);
  });

  test('rejects messages with a bad signature', async ({ request }) => {
    const raw = waPayload('halo', '6281100000001', 'wamid.bad');
    const res = await request.post('/api/channels/whatsapp', { data: raw, headers: { 'Content-Type': 'application/json', 'X-Hub-Signature-256': 'sha256=' + '0'.repeat(64) } });
    expect(res.status()).toBe(401);
  });

  test('replies to a signed message with WhatsApp formatting', async ({ request }) => {
    const raw = waPayload('Berapa biaya pendaftaran?', '6281100000002', 'wamid.qa-1');
    const res = await request.post('/api/channels/whatsapp', { data: raw, headers: { 'Content-Type': 'application/json', 'X-Hub-Signature-256': sign(raw) } });
    expect(res.status()).toBe(200);
    const call = await fake.waitFor((c) => c.service === 'whatsapp' && c.method === 'message' && c.body.to === '6281100000002');
    expect(call.body.text.body).toContain('Rp150.000');
    expect(call.body.text.body).toContain('*Sumber*');
    expect(call.body.context.message_id).toBe('wamid.qa-1');
  });
});
