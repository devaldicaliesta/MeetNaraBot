import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cosineInt8, normalizeQuestion, numbersOf, packVector, unpackVector } from '../../src/cache.ts';

test('normalizeQuestion ignores case, accents and punctuation', () => {
  assert.equal(normalizeQuestion('  Berapa BIAYA-nya?? '), 'berapa biaya nya');
  assert.equal(normalizeQuestion('Café?'), normalizeQuestion('cafe'));
});

test('numbersOf keeps questions about different numbers apart', () => {
  assert.equal(numbersOf('paket 2 berapa'), numbersOf('berapa paket 2?'));
  assert.notEqual(numbersOf('paket 2'), numbersOf('paket 3'));
});

test('int8 packing preserves cosine similarity', () => {
  const a = Array.from({ length: 1024 }, (_, i) => Math.sin(i));
  const b = a.map((x, i) => x + 0.1 * Math.cos(i * 7));
  const exact = a.reduce((s, x, i) => s + x * b[i], 0) / Math.sqrt(a.reduce((s, x) => s + x * x, 0) * b.reduce((s, x) => s + x * x, 0));
  const approx = cosineInt8(unpackVector(packVector(a)), unpackVector(packVector(b)));
  assert.ok(Math.abs(exact - approx) < 0.01, `${exact} vs ${approx}`);
  assert.ok(Math.abs(cosineInt8(unpackVector(packVector(a)), unpackVector(packVector(a))) - 1) < 1e-6);
});
