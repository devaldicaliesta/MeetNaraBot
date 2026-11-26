import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clientKey } from '../../src/net.ts';

test('IPv4 addresses stay per address', () => {
  assert.equal(clientKey('198.51.100.7'), '198.51.100.7');
  assert.notEqual(clientKey('198.51.100.7'), clientKey('198.51.100.8'));
});

test('every address in one IPv6 /64 shares one bucket', () => {
  const a = clientKey('2001:db8:1:2:aaaa:bbbb:cccc:dddd');
  assert.equal(a, '2001:db8:1:2::/64');
  assert.equal(clientKey('2001:DB8:1:2::1'), a);
  assert.equal(clientKey('2001:0db8:0001:0002:ffff:0:0:9'), a);
  assert.equal(clientKey('2001:db8:1:2::1%eth0'), a);
});

test('different /64 networks get different buckets', () => {
  assert.notEqual(clientKey('2001:db8:1:2::1'), clientKey('2001:db8:1:3::1'));
  assert.equal(clientKey('::1'), '0:0:0:0::/64');
});

test('IPv4-mapped IPv6 is treated as the IPv4 client', () => {
  assert.equal(clientKey('::ffff:198.51.100.7'), '198.51.100.7');
  assert.equal(clientKey('::ffff:c633:6407'), '198.51.100.7');
});

test('missing or malformed values never merge real clients', () => {
  assert.equal(clientKey(undefined), 'local');
  assert.equal(clientKey(''), 'local');
  assert.equal(clientKey('1:2:3'), '1:2:3');
  assert.equal(clientKey('1::2::3'), '1::2::3');
  assert.equal(clientKey('gggg::1'), 'gggg::1');
  assert.equal(clientKey('::ffff:300.1.1.1'), '::ffff:300.1.1.1');
});
