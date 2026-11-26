/**
 * Client address used as the key for per-IP limits (sign-up, sign-in lock, chat quotas).
 *
 * An IPv6 client usually controls a whole /64 (SLAAC privacy addresses, cheap cloud ranges), so
 * keying on the full 128-bit address would hand one host a fresh bucket for every request. IPv6
 * addresses are therefore reduced to their /64 prefix; IPv4 and IPv4-mapped IPv6 stay per address.
 * Pure, no imports, so unit tests can load it.
 */
export function clientKey(raw: string | null | undefined): string {
  const ip = String(raw || '').trim().toLowerCase();
  if (!ip) return 'local';
  if (!ip.includes(':')) return ip;
  const h = expandIpv6(ip.split('%')[0]);
  if (!h) return ip; // not a valid IPv6 literal: keep it unchanged rather than merging buckets
  // ::ffff:a.b.c.d is an IPv4 client.
  if (h.slice(0, 5).every((x) => x === 0) && h[5] === 0xffff) return [h[6] >> 8, h[6] & 255, h[7] >> 8, h[7] & 255].join('.');
  return h.slice(0, 4).map((x) => x.toString(16)).join(':') + '::/64';
}

/** "2001:db8::1" → [0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]; null when malformed. */
function expandIpv6(ip: string): number[] | null {
  let v4: number[] = [];
  const m = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (m) {
    const b = m.slice(1).map(Number);
    if (b.some((x) => x > 255)) return null;
    v4 = [(b[0] << 8) | b[1], (b[2] << 8) | b[3]];
    ip = ip.slice(0, m.index) + '0:0'; // the IPv4 tail takes the last two hextets
  }
  const halves = ip.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const rest = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const fill = halves.length === 2 ? 8 - head.length - rest.length : 0;
  if (fill < (halves.length === 2 ? 1 : 0)) return null;
  const all = [...head, ...Array(fill).fill('0'), ...rest];
  if (all.length !== 8 || !all.every((x) => /^[0-9a-f]{1,4}$/.test(x))) return null;
  const out = all.map((x) => parseInt(x, 16));
  if (v4.length) out.splice(6, 2, ...v4);
  return out;
}
