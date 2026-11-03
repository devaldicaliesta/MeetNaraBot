// Indexes a Markdown reference document into a deployed MeetNaraBot through the admin API,
// using the same heading-based chunking as the dashboard. Used by the deploy workflow; can also
// be run by hand:
//
//   ADMIN_PASSWORD=... node scripts/seed-document.mjs https://<worker>.workers.dev docs/knowledge/meetnarabot.md [--replace]
//
// Without --replace it does nothing when a document is already active, so redeploys never wipe
// a document the owner uploaded through the dashboard.
import fs from 'node:fs';
import path from 'node:path';

const [base, file, ...flags] = process.argv.slice(2);
const replace = flags.includes('--replace');
const password = process.env.ADMIN_PASSWORD;
if (!base || !file) { console.error('Usage: node scripts/seed-document.mjs <worker-url> <file.md> [--replace]'); process.exit(2); }
if (!password) { console.error('ADMIN_PASSWORD is not set.'); process.exit(2); }

const CHUNK_SIZE = 1000;
const OVERLAP = 150;
const MAX_CHARS = 3900;
const headers = { Authorization: `Bearer ${password}`, 'Content-Type': 'application/json', 'X-Lang': 'en' };

async function api(method, route, body) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(base.replace(/\/$/, '') + route, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return data;
    if (attempt < 1 && res.status >= 500) { await new Promise((r) => setTimeout(r, 1500)); continue; }
    throw new Error(`${method} ${route} -> ${res.status} ${data.error || ''}`.trim());
  }
}

/** Splits Markdown into sections by ATX headings; label = last three heading levels. */
function sections(md) {
  const out = [];
  const stack = [];
  let fence = false;
  let buf = [];
  const flush = () => {
    const text = buf.join('\n').trim();
    if (text) out.push({ label: stack.filter(Boolean).slice(-3).join(' › ') || `Bagian ${out.length + 1}`, text });
    buf = [];
  };
  for (const line of md.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) fence = !fence;
    const h = !fence && /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (h) {
      flush();
      const level = h[1].length;
      stack.length = level - 1;
      stack[level - 1] = h[2].trim();
      continue;
    }
    buf.push(line);
  }
  flush();
  return out;
}

const sentences = (t) => t.match(/[^.!?\n]+(?:[.!?]+|\n|$)/g)?.map((s) => s.trim()).filter(Boolean) || [t];

/** Packs paragraphs of one section into chunks up to CHUNK_SIZE, splitting long paragraphs by sentence. */
function chunkSection({ label, text }) {
  const blocks = [];
  for (const para of text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)) {
    if (para.length <= CHUNK_SIZE) blocks.push(para);
    else {
      let cur = '';
      for (const s of sentences(para)) {
        if (cur && cur.length + s.length + 1 > CHUNK_SIZE) { blocks.push(cur); cur = ''; }
        cur = cur ? `${cur} ${s}` : s;
      }
      if (cur) blocks.push(cur);
    }
  }
  const chunks = [];
  let cur = '';
  for (const b of blocks) {
    if (cur && cur.length + b.length + 2 > CHUNK_SIZE) { chunks.push(cur); cur = ''; }
    cur = cur ? `${cur}\n\n${b}` : b;
  }
  if (cur) chunks.push(cur);
  return chunks.map((t, i) => {
    let overlap = '';
    if (i > 0) {
      for (const s of sentences(chunks[i - 1]).reverse()) {
        if (overlap.length + s.length + 1 > OVERLAP) break;
        overlap = overlap ? `${s} ${overlap}` : s;
      }
    }
    return { label: chunks.length > 1 ? `${label} (${i + 1})` : label, text: t.slice(0, MAX_CHARS), ...(overlap ? { overlap } : {}) };
  });
}

const md = fs.readFileSync(file, 'utf8');
const chunks = sections(md).flatMap(chunkSection);
const name = path.basename(file);
console.log(`${name}: ${chunks.length} chunks`);

const status = await api('GET', '/api/admin/status');
if (status.file) {
  if (!replace) { console.log(`A document is already active (${status.file.name}); nothing to do. Use --replace to overwrite it.`); process.exit(0); }
  await api('DELETE', '/api/admin/file');
  console.log(`Removed ${status.file.name}`);
}

const created = await api('POST', '/api/admin/file', { name });
console.log(`Embedder: ${created.embedder}`);
try {
  for (let i = 0; i < chunks.length; i += 20) {
    await api('POST', '/api/admin/file/chunks', { startIdx: i, chunks: chunks.slice(i, i + 20) });
    console.log(`Indexed ${Math.min(i + 20, chunks.length)}/${chunks.length}`);
  }
  const done = await api('POST', '/api/admin/file/done');
  console.log(`Done: ${done.chunkCount} chunks. Starter questions: ${(done.suggestions?.id || []).join(' | ')}`);
} catch (err) {
  await api('DELETE', '/api/admin/file').catch(() => {});
  console.error(`Indexing failed and was rolled back: ${err.message}`);
  process.exit(1);
}
