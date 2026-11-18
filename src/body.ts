import type { Context } from 'hono';

/**
 * True when the request body is larger than `max` bytes. Content-Length alone is not enough:
 * a chunked request has no length header, so its body is read here (stopping as soon as it
 * passes `max`) and put back on the request for the route to parse.
 */
export async function bodyTooLarge(c: Context<any>, max: number): Promise<boolean> {
  const raw = c.req.raw;
  if (!raw.body) return false;
  const length = raw.headers.get('content-length');
  if (length !== null && !raw.headers.has('transfer-encoding')) return Number(length) > max;
  const reader = raw.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      reader.cancel().catch(() => {});
      return true;
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) {
    body.set(chunk, at);
    at += chunk.byteLength;
  }
  c.req.raw = new Request(raw, { body });
  return false;
}
