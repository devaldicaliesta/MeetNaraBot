// A stand-in for the Telegram Bot API and the WhatsApp Cloud API. It records every call so tests
// can assert what the bot would have sent, without contacting Telegram or Meta.
import http from 'node:http';

export type Call = { service: 'telegram' | 'whatsapp'; method: string; body: any };

export function startFakeChatApi(port: number) {
  const calls: Call[] = [];
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const body = raw ? JSON.parse(raw) : {};
      const url = req.url || '';
      res.setHeader('Content-Type', 'application/json');
      if (url.startsWith('/telegram/')) {
        const method = url.split('/').pop() || '';
        calls.push({ service: 'telegram', method, body });
        const result = method === 'getMe' ? { id: 1, username: 'meetnara_qa_bot' } : method === 'getWebhookInfo' ? { url: '', pending_update_count: 0 } : true;
        return res.end(JSON.stringify({ ok: true, result }));
      }
      if (url.startsWith('/whatsapp/')) {
        calls.push({ service: 'whatsapp', method: body.status === 'read' ? 'read' : 'message', body });
        return res.end(JSON.stringify({ messages: [{ id: 'wamid.qa' }] }));
      }
      res.statusCode = 404;
      res.end('{}');
    });
  });
  return {
    calls,
    listen: () => new Promise<void>((ok) => server.listen(port, '127.0.0.1', () => ok())),
    close: () => new Promise<void>((ok) => server.close(() => ok())),
    /** Waits until a recorded call matches, or fails after the timeout. */
    async waitFor(match: (c: Call) => boolean, timeoutMs = 20_000): Promise<Call> {
      const end = Date.now() + timeoutMs;
      for (;;) {
        const hit = calls.find(match);
        if (hit) return hit;
        if (Date.now() > end) throw new Error(`No matching chat-app call. Seen: ${JSON.stringify(calls.map((c) => [c.service, c.method]))}`);
        await new Promise((r) => setTimeout(r, 200));
      }
    },
  };
}
