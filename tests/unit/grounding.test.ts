import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkCitations, detectDocLang } from '../../src/grounding.ts';

test('keeps valid citations and reports them', () => {
  const r = checkCitations('Biaya **Rp10.000** [1]. Proses 3 hari [2][1].', 3);
  assert.equal(r.text, 'Biaya **Rp10.000** [1]. Proses 3 hari [2][1].');
  assert.deepEqual(r.cited, [1, 2]);
  assert.deepEqual(r.removed, []);
  assert.equal(r.grounded, true);
});

test('removes citations to excerpts that were never sent', () => {
  const r = checkCitations('Biaya Rp10.000 [1][7]. Jadwal Senin [9].', 2);
  assert.equal(r.text, 'Biaya Rp10.000 [1]. Jadwal Senin.');
  assert.deepEqual(r.removed.sort(), [7, 9]);
  assert.equal(r.grounded, true);
});

test('flags an answer without any valid citation', () => {
  assert.equal(checkCitations('Jawabannya adalah 42.', 3).grounded, false);
  assert.equal(checkCitations('Jawabannya 42 [5].', 3).grounded, false);
});

test('never touches bracketed years', () => {
  const r = checkCitations('Berlaku sejak [2024] [1].', 1);
  assert.equal(r.text, 'Berlaku sejak [2024] [1].');
});

test('detects English and Indonesian documents', () => {
  const en = Array(5).fill('The registration form is available for all students and it can be submitted online by the end of the month.');
  const id = Array(5).fill('Formulir pendaftaran tersedia untuk semua siswa dan dapat dikirim secara daring sampai akhir bulan ini.');
  assert.equal(detectDocLang(en), 'en');
  assert.equal(detectDocLang(id), 'id');
  assert.equal(detectDocLang(['short']), 'id');
});
