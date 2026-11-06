# Graph Report - MeetNaraBot  (2026-11-06)

## Corpus Check
- 56 files · ~68,942 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 5, .css 2, .example 1)

## Summary
- 642 nodes · 1160 edges · 24 communities (23 shown, 1 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e0d6166c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- settings.ts
- channels.ts
- Nara platform (chatbot dokumen)
- TanyaSayaChat
- package.json
- deploy.yml
- steps
- env
- env
- cache.ts
- dev-server.mjs
- playwright.config.ts
- seed-document.mjs
- start-worker.mjs
- compilerOptions
- graph.yml
- retrieve
- Nara: catatan untuk Claude
- file
- rag.ts
- TSbot
- serve-tsbot.mjs

## God Nodes (most connected - your core abstractions)
1. `answer()` - 29 edges
2. `env` - 23 edges
3. `TanyaSayaChat` - 21 edges
4. `completeChat()` - 12 edges
5. `getSettings()` - 12 edges
6. `converse()` - 12 edges
7. `lookupSemantic()` - 11 edges
8. `purgeBot()` - 10 edges
9. `embed()` - 10 edges
10. `redactPii()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Nara platform (chatbot dokumen)` --references--> `answer()`  [INFERRED]
  README.md → src/rag.ts
- `Isolasi data per bot` --implements--> `tenantEnv()`  [EXTRACTED]
  README.md → src/settings.ts
- `Batas yang diperiksa` --references--> `checkCitations()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/grounding.ts
- `Audit keamanan run 4 (2026-11)` --references--> `purgeBot()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/index.ts
- `Batas yang diperiksa` --references--> `purgeBot()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/index.ts

## Import Cycles
- None detected.

## Communities (24 total, 1 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.05
Nodes (59): Tambahan: banyak dokumen per bot dan penyedia OpenAI, usage, Dashboard pemilik bot, Isolasi data per bot, Audit keamanan 1–3, Kunci login per IP/email, ACCOUNT_DAYS, BotRow (+51 more)

### Community 1 - "settings.ts"
Cohesion: 0.07
Nodes (57): settings, Rantai penyedia LLM + failover, AllProvidersFailed, bodyFor(), buildChain(), canEmbed(), completeChat(), deltaFrom() (+49 more)

### Community 2 - "channels.ts"
Cohesion: 0.09
Nodes (41): channel_history, channel_seen, idx_channel_history_updated, channelCommand(), citedSources(), clip(), clipHtml(), escapeHtml() (+33 more)

### Community 3 - "Nara platform (chatbot dokumen)"
Cohesion: 0.33
Nodes (6): Dokumen referensi bot demo Nara, Prompt 7 layer untuk membangun ulang proyek, Paket gratis Cloudflare Workers/D1/Vectorize, Nara platform (chatbot dokumen), Prompt 7 layer (strict grounding), DEFAULT_LAYERS

### Community 4 - "TanyaSayaChat"
Cohesion: 0.13
Nodes (10): Audit keamanan TSbot (2026-11), Batas yang diperiksa, Hasil, Landing page + widget demo, esc(), inkFor(), inline(), markdown() (+2 more)

### Community 5 - "package.json"
Cohesion: 0.08
Nodes (27): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0, engines (+19 more)

### Community 6 - "deploy.yml"
Cohesion: 0.07
Nodes (26): concurrency, cancel-in-progress, group, env, needs, runs-on, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN (+18 more)

### Community 7 - "steps"
Cohesion: 0.08
Nodes (25): CI, jobs, qa, name, on, pull_request, push, workflow_call (+17 more)

### Community 8 - "env"
Cohesion: 0.06
Nodes (31): concurrency, cancel-in-progress, group, env, needs, runs-on, steps, CLOUDFLARE_ACCOUNT_ID (+23 more)

### Community 9 - "env"
Cohesion: 0.06
Nodes (31): steps, ADMIN_PASSWORD, CF_WORKERS_AI_KEY, COHERE_API_KEY, DEEPSEEK_API_KEY, DEPLOY_TOKEN, FIREWORKS_API_KEY, GEMINI_API_KEY (+23 more)

### Community 10 - "cache.ts"
Cohesion: 0.09
Nodes (35): Audit keamanan run 4 (2026-11), Batas yang diperiksa, Hasil, vector_tombstones, answer_cache, idx_answer_cache_exact, idx_answer_cache_recent, Peringatan PII saat unggah (+27 more)

### Community 11 - "dev-server.mjs"
Cohesion: 0.09
Nodes (23): agg(), bots, buildSystem(), DEFAULTS, docsLabel(), docTitle(), info(), LAYERS (+15 more)

### Community 12 - "playwright.config.ts"
Cohesion: 0.13
Nodes (12): FAKE_API_PORT, IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test, Call, startFakeChatApi() (+4 more)

### Community 14 - "seed-document.mjs"
Cohesion: 0.14
Nodes (12): Pemotong dokumen di browser, [base, file, ...flags], chunks, chunkSection(), force, headers, md, name (+4 more)

### Community 16 - "start-worker.mjs"
Cohesion: 0.15
Nodes (11): args, child, chunks, doc(), future, past, [port, fakePort, password], q() (+3 more)

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 20 - "retrieve"
Cohesion: 0.10
Nodes (24): bot_config, chunks, file, chat_log, chunks_fts, idx_chat_log_created, idx_chunks_idx, bots (+16 more)

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.40
Nodes (4): Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "file"
Cohesion: 0.22
Nodes (8): bot, fail(), frames, LOOPBACK, OUT, ROOT, SRC, toOrigin()

### Community 24 - "rag.ts"
Cohesion: 0.05
Nodes (57): Uji coba + panel X-ray, paint(), Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, Guardrail prompt injection, Riwayat bertanda tangan HMAC, User, cacheScope() (+49 more)

### Community 25 - "TSbot"
Cohesion: 0.40
Nodes (4): Build dan uji lokal, Pasang di IMTS (https://imtsbot.pages.dev), Pengaturan sekali, TSbot

### Community 27 - "serve-tsbot.mjs"
Cohesion: 0.25
Nodes (4): DIST, headers, [tsPort, apiPort, imtsPort, otherPort], TYPES

## Knowledge Gaps
- **10 isolated node(s):** `Dashboard pemilik bot`, `Paket gratis Cloudflare Workers/D1/Vectorize`, `Gerbang skor sebelum AI`, `Uji coba + panel X-ray`, `Peringatan PII saat unggah` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 259 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `answer()` connect `rag.ts` to `index.ts`, `settings.ts`, `channels.ts`, `Nara platform (chatbot dokumen)`, `cache.ts`, `dev-server.mjs`, `retrieve`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `answer()` (e.g. with `paint()` and `Nara platform (chatbot dokumen)`) actually correct?**
  _`answer()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Dashboard pemilik bot`, `Paket gratis Cloudflare Workers/D1/Vectorize`, `Gerbang skor sebelum AI` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05010351966873706 - nodes in this community are weakly interconnected._
- **Why does `Deploy otomatis GitHub Actions` connect `deploy.yml` to `seed-document.mjs`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0679563492063492 - nodes in this community are weakly interconnected._
- **Why does `Nara platform (chatbot dokumen)` connect `Nara platform (chatbot dokumen)` to `rag.ts`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._