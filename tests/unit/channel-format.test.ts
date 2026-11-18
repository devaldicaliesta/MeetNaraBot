// Run with: npm run test:unit (Node >= 22.18 runs these TypeScript files directly).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { channelCommand, citedSources, clipHtml, toTelegram, toWhatsApp } from '../../src/channel-format.ts';
import { detectSmallTalk } from '../../src/smalltalk.ts';

const sources = [
  { number: 1, label: 'Panduan › Pendaftaran › Biaya' },
  { number: 2, label: 'Panduan › Jadwal' },
];

test('only cited sources are listed, with short labels', () => {
  assert.deepEqual(citedSources('Biaya Rp150.000 [1].', sources), [{ number: 1, label: 'Pendaftaran › Biaya' }]);
});

test('Telegram output escapes HTML and keeps only safe tags', () => {
  const out = toTelegram('**Rp150.000** <script>alert(1)</script> & *penting* `kode` [1] [9]', sources, 'id');
  assert.match(out, /<b>Rp150\.000<\/b>/);
  assert.match(out, /&lt;script&gt;/);
  assert.match(out, /&amp;/);
  assert.match(out, /<i>penting<\/i>/);
  assert.match(out, /<code>kode<\/code>/);
  assert.doesNotMatch(out, /\[9\]/);
  assert.match(out, /<b>Sumber<\/b>\n\[1\] Pendaftaran › Biaya/);
  assert.doesNotMatch(out, /<(?!\/?(b|i|code)>)/);
});

test('Telegram output stays under the 4096-character limit', () => {
  const long = Array.from({ length: 400 }, (_, i) => `Baris ${i} dengan **teks** panjang [1]`).join('\n');
  assert.ok(toTelegram(long, sources, 'id').length <= 4096);
});

test('one paragraph longer than the Telegram limit is cut, not dropped', () => {
  const out = toTelegram('**Penting** ' + 'kata &amp; '.repeat(800), sources, 'id');
  assert.ok(out.length <= 4096);
  assert.ok(out.length > 3000, 'the start of the paragraph is kept');
  assert.doesNotMatch(out, /<b>|<\/b>/, 'no tag is left half-open');
  assert.doesNotMatch(clipHtml('a &amp;' + 'b'.repeat(10), 9), /&[a-z]*\n/, 'no entity is split');
});

test('WhatsApp output uses *bold* and _italic_', () => {
  const out = toWhatsApp('**Rp150.000** dibayar *sekali* [2]', sources, 'en');
  assert.match(out, /^\*Rp150\.000\* dibayar _sekali_ \[2\]/);
  assert.match(out, /\*Sources\*\n\[2\] Panduan › Jadwal$/);
});

test('channel commands are recognised', () => {
  assert.equal(channelCommand('/start'), 'start');
  assert.equal(channelCommand('/start@meetnara_bot'), 'start');
  assert.equal(channelCommand('reset'), 'reset');
  assert.equal(channelCommand('bantuan'), 'help');
  assert.equal(channelCommand('Berapa biayanya?'), null);
});

test('small talk is caught, real questions are not', () => {
  assert.equal(detectSmallTalk('halo kak')?.kind, 'greeting');
  assert.equal(detectSmallTalk('terima kasih ya')?.kind, 'thanks');
  assert.equal(detectSmallTalk('kamu siapa?')?.kind, 'identity');
  assert.equal(detectSmallTalk('halo, berapa biaya daftarnya?'), null);
});

test('visitor-facing source labels never show file names', async () => {
  const { visibleLabel } = await import('../../src/channel-format.ts');
  assert.equal(visibleLabel('Kebutuhan Fungsional.md › Login › Lupa sandi'), 'Login › Lupa sandi');
  assert.equal(visibleLabel('panduan.pdf › Biaya'), 'Biaya');
  assert.equal(visibleLabel('Panduan › Bab 2 › Biaya'), 'Bab 2 › Biaya');
  assert.equal(visibleLabel('Kebutuhan Fungsional.md'), '');
});
