# Graph Report - MeetNaraBot  (2026-11-06)

## Corpus Check
- 56 files · ~67,239 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 5, .css 2, .example 1)

## Summary
- 623 nodes · 1114 edges · 33 communities (32 shown, 1 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `085f3b1b`
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
- grounding.ts
- serve-tsbot.mjs
- 0002_rag_upgrade.sql
- Nara platform (chatbot dokumen)
- guard.test.ts
- types.ts
- retrieve

## God Nodes (most connected - your core abstractions)
1. `answer()` - 29 edges
2. `TanyaSayaChat` - 21 edges
3. `env` - 16 edges
4. `getSettings()` - 12 edges
5. `converse()` - 12 edges
6. `completeChat()` - 11 edges
7. `lookupSemantic()` - 11 edges
8. `purgeBot()` - 10 edges
9. `redactPii()` - 10 edges
10. `streamChat()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Nara platform (chatbot dokumen)` --references--> `answer()`  [INFERRED]
  README.md → src/rag.ts
- `Batas yang diperiksa` --references--> `storeAnswer()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/cache.ts
- `Kunci login per IP/email` --implements--> `verifyLogin()`  [INFERRED]
  SECURITY.md → src/auth.ts
- `Isolasi data per bot` --implements--> `tenantEnv()`  [EXTRACTED]
  README.md → src/settings.ts
- `Batas yang diperiksa` --references--> `checkCitations()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/grounding.ts

## Import Cycles
- None detected.

## Communities (33 total, 1 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.08
Nodes (24): settings, Dashboard pemilik bot, Audit keamanan 1–3, Kunci login per IP/email, app, dailyQuota(), Env, FileRow (+16 more)

### Community 1 - "settings.ts"
Cohesion: 0.08
Nodes (40): Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom(), embed() (+32 more)

### Community 2 - "channels.ts"
Cohesion: 0.09
Nodes (42): channel_history, channel_seen, idx_channel_history_updated, channelCommand(), citedSources(), clip(), clipHtml(), escapeHtml() (+34 more)

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
Cohesion: 0.08
Nodes (24): steps, ADMIN_PASSWORD, DEEPSEEK_API_KEY, DEPLOY_TOKEN, GEMINI_API_KEY, HF_TOKEN, MOONSHOT_API_KEY, OPENAI_API_KEY (+16 more)

### Community 10 - "cache.ts"
Cohesion: 0.16
Nodes (21): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent, Cache jawaban semantik (pola GPTCache), CACHE_TTL_DAYS, CacheHit, cacheScope(), cacheStats() (+13 more)

### Community 11 - "dev-server.mjs"
Cohesion: 0.09
Nodes (22): agg(), bots, buildSystem(), DEFAULTS, docsLabel(), info(), LAYERS, PORT (+14 more)

### Community 12 - "playwright.config.ts"
Cohesion: 0.13
Nodes (12): FAKE_API_PORT, IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test, Call, startFakeChatApi() (+4 more)

### Community 13 - "rag.ts"
Cohesion: 0.15
Nodes (17): Guardrail prompt injection, Riwayat bertanda tangan HMAC, b64url(), detectInjection(), digits(), enc, hmacKey(), INJECTION (+9 more)

### Community 14 - "seed-document.mjs"
Cohesion: 0.14
Nodes (12): Pemotong dokumen di browser, [base, file, ...flags], chunks, chunkSection(), force, headers, md, name (+4 more)

### Community 15 - "auth.ts"
Cohesion: 0.12
Nodes (27): Isolasi data per bot, ACCOUNT_DAYS, BotRow, botStatus(), changePassword(), constantTimeEqualHex(), createSession(), createUser() (+19 more)

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
Cohesion: 0.36
Nodes (8): bots, idx_bots_owner, idx_sessions_user, idx_users_expires, sessions, users, createBot(), listBots()

### Community 20 - "chunks"
Cohesion: 0.14
Nodes (12): Tambahan: banyak dokumen per bot dan penyedia OpenAI, bot_config, chunks, file, idx_chunks_idx, idx_chunks_bot_idx, idx_file_bot, idx_chunks_file_idx (+4 more)

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.40
Nodes (4): Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "file"
Cohesion: 0.22
Nodes (8): bot, fail(), frames, LOOPBACK, OUT, ROOT, SRC, toOrigin()

### Community 24 - "rag.ts"
Cohesion: 0.13
Nodes (22): paint(), injectionReply(), benv(), answer(), AnswerInput, buildSystemPrompt(), buildUserTurn(), Candidate (+14 more)

### Community 25 - "TSbot"
Cohesion: 0.40
Nodes (4): Build dan uji lokal, Pasang di IMTS (https://imtsbot.pages.dev), Pengaturan sekali, TSbot

### Community 26 - "grounding.ts"
Cohesion: 0.22
Nodes (9): Uji coba + panel X-ray, Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, checkCitations(), CitationCheck, detectDocLang(), EN_WORDS, ID_WORDS (+1 more)

### Community 27 - "serve-tsbot.mjs"
Cohesion: 0.25
Nodes (4): DIST, headers, [tsPort, apiPort, imtsPort, otherPort], TYPES

### Community 28 - "0002_rag_upgrade.sql"
Cohesion: 0.29
Nodes (7): chat_log, chunks_fts, idx_chat_log_created, usage, idx_chat_log_bot, logChat(), spendPlatform()

### Community 29 - "Nara platform (chatbot dokumen)"
Cohesion: 0.33
Nodes (6): Dokumen referensi bot demo Nara, Prompt 7 layer untuk membangun ulang proyek, Paket gratis Cloudflare Workers/D1/Vectorize, Nara platform (chatbot dokumen), Prompt 7 layer (strict grounding), DEFAULT_LAYERS

### Community 30 - "guard.test.ts"
Cohesion: 0.29
Nodes (6): Peringatan PII saat unggah, Guardrail data pribadi (PII), findPii(), hasPii(), piiKeys(), redactPii()

### Community 32 - "types.ts"
Cohesion: 0.29
Nodes (6): User, AppEnv, ChatEvent, ChatMessage, Principal, Source

### Community 34 - "retrieve"
Cohesion: 0.50
Nodes (5): chunks_fts, Hybrid search (vektor + BM25 + RRF), Gerbang skor sebelum AI, ftsQuery(), retrieve()

## Knowledge Gaps
- **10 isolated node(s):** `Dashboard pemilik bot`, `Guardrail prompt injection`, `Paket gratis Cloudflare Workers/D1/Vectorize`, `Uji coba + panel X-ray`, `Audit keamanan 1–3` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 252 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `answer()` connect `rag.ts` to `index.ts`, `settings.ts`, `channels.ts`, `retrieve`, `cache.ts`, `dev-server.mjs`, `rag.ts`, `grounding.ts`, `Nara platform (chatbot dokumen)`, `guard.test.ts`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `answer()` (e.g. with `paint()` and `Nara platform (chatbot dokumen)`) actually correct?**
  _`answer()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Dashboard pemilik bot`, `Guardrail prompt injection`, `Paket gratis Cloudflare Workers/D1/Vectorize` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07899159663865546 - nodes in this community are weakly interconnected._
- **Why does `Deploy otomatis GitHub Actions` connect `deploy.yml` to `seed-document.mjs`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0841813135985199 - nodes in this community are weakly interconnected._
- **Why does `Nara platform (chatbot dokumen)` connect `Nara platform (chatbot dokumen)` to `rag.ts`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._