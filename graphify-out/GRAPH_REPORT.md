# Graph Report - MeetNaraBot  (2026-11-06)

## Corpus Check
- 53 files · ~64,487 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 5, .css 2, .example 1)

## Summary
- 606 nodes · 1071 edges · 30 communities (28 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2fbcd96c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- settings.ts
- channels.ts
- purgeBot
- TanyaSayaChat
- package.json
- deploy.yml
- steps
- env
- env
- cache.ts
- dev-server.mjs
- playwright.config.ts
- rag.ts
- seed-document.mjs
- auth.ts
- start-worker.mjs
- compilerOptions
- graph.yml
- 0004_accounts.sql
- chunks
- Nara: catatan untuk Claude
- file
- rag.ts
- TSbot
- 0002_rag_upgrade.sql
- serve-tsbot.mjs
- Kunci login per IP/email
- ownedBot

## God Nodes (most connected - your core abstractions)
1. `answer()` - 29 edges
2. `TanyaSayaChat` - 21 edges
3. `env` - 15 edges
4. `converse()` - 12 edges
5. `getSettings()` - 12 edges
6. `lookupSemantic()` - 11 edges
7. `completeChat()` - 11 edges
8. `redactPii()` - 10 edges
9. `purgeBot()` - 10 edges
10. `streamChat()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Batas yang diperiksa` --references--> `storeAnswer()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/cache.ts
- `Batas yang diperiksa` --references--> `checkCitations()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/grounding.ts
- `Nara platform (chatbot dokumen)` --references--> `answer()`  [INFERRED]
  README.md → src/rag.ts
- `Kunci login per IP/email` --implements--> `verifyLogin()`  [INFERRED]
  SECURITY.md → src/auth.ts
- `Isolasi data per bot` --implements--> `tenantEnv()`  [EXTRACTED]
  README.md → src/settings.ts

## Import Cycles
- None detected.

## Communities (30 total, 2 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.08
Nodes (23): Dashboard pemilik bot, app, benv(), dailyQuota(), Env, FileRow, hits, ip() (+15 more)

### Community 1 - "settings.ts"
Cohesion: 0.09
Nodes (37): Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom(), FailAttempt (+29 more)

### Community 2 - "channels.ts"
Cohesion: 0.09
Nodes (43): settings, channel_history, channel_seen, idx_channel_history_updated, channelCommand(), citedSources(), clip(), clipHtml() (+35 more)

### Community 3 - "purgeBot"
Cohesion: 0.14
Nodes (15): Audit keamanan run 4 (2026-11), Batas yang diperiksa, Hasil, vector_tombstones, Akun 7 hari + cron pembersihan, purgeExpiredCache(), deleteVectors(), purgeBot() (+7 more)

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
Cohesion: 0.09
Nodes (23): steps, ADMIN_PASSWORD, DEEPSEEK_API_KEY, DEPLOY_TOKEN, GEMINI_API_KEY, HF_TOKEN, MOONSHOT_API_KEY, RESEED (+15 more)

### Community 10 - "cache.ts"
Cohesion: 0.16
Nodes (21): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent, Cache jawaban semantik (pola GPTCache), CACHE_TTL_DAYS, CacheHit, cacheScope(), cacheStats() (+13 more)

### Community 11 - "dev-server.mjs"
Cohesion: 0.11
Nodes (12): bots, DEFAULTS, LAYERS, PORT, PROVIDERS, retrieve(), ROOT, sessions (+4 more)

### Community 12 - "playwright.config.ts"
Cohesion: 0.13
Nodes (12): FAKE_API_PORT, IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test, Call, startFakeChatApi() (+4 more)

### Community 13 - "rag.ts"
Cohesion: 0.10
Nodes (29): Peringatan PII saat unggah, Guardrail prompt injection, Guardrail data pribadi (PII), Riwayat bertanda tangan HMAC, User, b64url(), detectInjection(), digits() (+21 more)

### Community 14 - "seed-document.mjs"
Cohesion: 0.11
Nodes (17): Dokumen referensi bot demo Nara, Prompt 7 layer untuk membangun ulang proyek, Pemotong dokumen di browser, Paket gratis Cloudflare Workers/D1/Vectorize, Nara platform (chatbot dokumen), Prompt 7 layer (strict grounding), [base, file, ...flags], chunks (+9 more)

### Community 15 - "auth.ts"
Cohesion: 0.14
Nodes (24): ACCOUNT_DAYS, BotRow, botStatus(), changePassword(), constantTimeEqualHex(), createSession(), createUser(), DEFAULT_BOT (+16 more)

### Community 16 - "start-worker.mjs"
Cohesion: 0.15
Nodes (11): args, child, chunks, doc(), future, past, [port, fakePort, password], q() (+3 more)

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 19 - "0004_accounts.sql"
Cohesion: 0.24
Nodes (11): bots, chunks_fts, idx_bots_owner, idx_chat_log_bot, idx_sessions_user, idx_users_expires, sessions, users (+3 more)

### Community 20 - "chunks"
Cohesion: 0.25
Nodes (7): bot_config, chunks, file, idx_chunks_idx, idx_chunks_bot_idx, idx_file_bot, activeFile()

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.40
Nodes (4): Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "file"
Cohesion: 0.22
Nodes (8): bot, fail(), frames, LOOPBACK, OUT, ROOT, SRC, toOrigin()

### Community 24 - "rag.ts"
Cohesion: 0.08
Nodes (37): Uji coba + panel X-ray, Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, Hybrid search (vektor + BM25 + RRF), Gerbang skor sebelum AI, checkCitations(), CitationCheck, detectDocLang() (+29 more)

### Community 25 - "TSbot"
Cohesion: 0.40
Nodes (4): Build dan uji lokal, Pasang di IMTS (https://imtsbot.pages.dev), Pengaturan sekali, TSbot

### Community 26 - "0002_rag_upgrade.sql"
Cohesion: 0.33
Nodes (6): chat_log, chunks_fts, idx_chat_log_created, usage, logChat(), spendPlatform()

### Community 27 - "serve-tsbot.mjs"
Cohesion: 0.25
Nodes (4): DIST, headers, [tsPort, apiPort, imtsPort, otherPort], TYPES

### Community 28 - "Kunci login per IP/email"
Cohesion: 0.67
Nodes (3): Audit keamanan 1–3, Kunci login per IP/email, loginLocked()

## Knowledge Gaps
- **10 isolated node(s):** `Dashboard pemilik bot`, `Uji coba + panel X-ray`, `Peringatan PII saat unggah`, `Guardrail prompt injection`, `Paket gratis Cloudflare Workers/D1/Vectorize` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 250 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `answer()` connect `rag.ts` to `index.ts`, `settings.ts`, `channels.ts`, `TanyaSayaChat`, `cache.ts`, `rag.ts`, `seed-document.mjs`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `answer()` (e.g. with `paint()` and `Nara platform (chatbot dokumen)`) actually correct?**
  _`answer()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Dashboard pemilik bot`, `Uji coba + panel X-ray`, `Peringatan PII saat unggah` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07765151515151515 - nodes in this community are weakly interconnected._
- **Why does `Deploy otomatis GitHub Actions` connect `deploy.yml` to `seed-document.mjs`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09059233449477352 - nodes in this community are weakly interconnected._
- **Why does `Nara platform (chatbot dokumen)` connect `seed-document.mjs` to `rag.ts`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._