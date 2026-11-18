// Shared validation for build scripts: values end up in HTML attributes and CSP headers.
const LOOPBACK = new Set(['127.0.0.1', 'localhost']);

export const fail = (m) => { console.error(`build: ${m}`); process.exit(1); };

/** Accepts only a bare origin: https, or http on loopback (local QA). A bare host gets https://. No path, query, credentials or wildcard. */
export function toOrigin(raw, name) {
  let u;
  const v = String(raw).trim();
  try { u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`); } catch { fail(`${name} is not a URL: ${raw}`); }
  const okScheme = u.protocol === 'https:' || (u.protocol === 'http:' && LOOPBACK.has(u.hostname));
  if (!okScheme) fail(`${name} must use https: ${raw}`);
  if (u.username || u.password || u.search || u.hash || (u.pathname !== '/' && u.pathname !== '')) fail(`${name} must be an origin only (no path): ${raw}`);
  return u.origin;
}
