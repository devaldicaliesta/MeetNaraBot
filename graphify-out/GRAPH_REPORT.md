# Graph Report - MeetNaraBot  (2026-11-06)

## Corpus Check
- 50 files · ~63,362 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 5, .css 2, .example 1)

## Summary
- 592 nodes · 1053 edges · 30 communities (29 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.64)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `75e099e1`
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
- retrieve
- verifyLogin
- Nara: catatan untuk Claude
- build-tsbot.mjs
- smalltalk.ts
- deploy
- reseed
- serve-tsbot.mjs
- steps
- 0004_accounts.sql

## God Nodes (most connected - your core abstractions)
1. `answer()` - 29 edges
2. `TanyaSayaChat` - 21 edges
3. `env` - 15 edges
4. `converse()` - 12 edges
5. `getSettings()` - 12 edges
6. `lookupSemantic()` - 11 edges
7. `completeChat()` - 11 edges
8. `redactPii()` - 10 edges
9. `scripts` - 9 edges
10. `handleTelegram()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Nara platform (chatbot dokumen)` --references--> `answer()`  [INFERRED]
  README.md → src/rag.ts
- `Isolasi data per bot` --implements--> `tenantEnv()`  [EXTRACTED]
  README.md → src/settings.ts
- `Pemotong dokumen di browser` --conceptually_related_to--> `chunkSection()`  [INFERRED]
  public/admin.html → scripts/seed-document.mjs
- `Kunci login per IP/email` --implements--> `verifyLogin()`  [INFERRED]
  SECURITY.md → src/auth.ts
- `Cek sitasi pasca-generasi` --implements--> `checkCitations()`  [EXTRACTED]
  README.md → src/grounding.ts

## Import Cycles
- None detected.

## Communities (30 total, 1 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.08
Nodes (24): usage, Dashboard pemilik bot, Isolasi data per bot, ownedBot(), app, dailyQuota(), Env, FileRow (+16 more)

### Community 1 - "settings.ts"
Cohesion: 0.08
Nodes (41): settings, Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom() (+33 more)

### Community 2 - "channels.ts"
Cohesion: 0.10
Nodes (38): channel_history, channel_seen, idx_channel_history_updated, channelCommand(), citedSources(), clip(), clipHtml(), escapeHtml() (+30 more)

### Community 3 - "purgeBot"
Cohesion: 0.22
Nodes (10): vector_tombstones, Akun 7 hari + cron pembersihan, listBots(), purgeExpiredCache(), deleteVectors(), purgeBot(), purgeExpiredAccounts(), retryTombstones() (+2 more)

### Community 4 - "TanyaSayaChat"
Cohesion: 0.16
Nodes (6): Landing page + widget demo, esc(), inkFor(), inline(), markdown(), TanyaSayaChat

### Community 5 - "package.json"
Cohesion: 0.08
Nodes (27): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0, engines (+19 more)

### Community 6 - "deploy.yml"
Cohesion: 0.22
Nodes (8): concurrency, cancel-in-progress, group, name, permissions, contents, Deploy otomatis GitHub Actions, DEPLOY_TOKEN satu kali pakai

### Community 7 - "steps"
Cohesion: 0.08
Nodes (25): CI, jobs, qa, name, on, pull_request, push, workflow_call (+17 more)

### Community 8 - "env"
Cohesion: 0.06
Nodes (30): concurrency, cancel-in-progress, group, env, needs, runs-on, steps, CLOUDFLARE_ACCOUNT_ID (+22 more)

### Community 9 - "env"
Cohesion: 0.13
Nodes (15): ADMIN_PASSWORD, DEEPSEEK_API_KEY, DEPLOY_TOKEN, GEMINI_API_KEY, HF_TOKEN, MOONSHOT_API_KEY, RESEED, TELEGRAM_BOT_TOKEN (+7 more)

### Community 10 - "cache.ts"
Cohesion: 0.13
Nodes (25): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent, Peringatan PII saat unggah, Cache jawaban semantik (pola GPTCache), Guardrail data pribadi (PII), CACHE_TTL_DAYS, CacheHit (+17 more)

### Community 11 - "dev-server.mjs"
Cohesion: 0.11
Nodes (9): bots, DEFAULTS, LAYERS, PORT, PROVIDERS, ROOT, sessions, STOP (+1 more)

### Community 12 - "playwright.config.ts"
Cohesion: 0.13
Nodes (12): FAKE_API_PORT, IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test, Call, startFakeChatApi() (+4 more)

### Community 13 - "rag.ts"
Cohesion: 0.05
Nodes (60): Uji coba + panel X-ray, paint(), Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, Guardrail prompt injection, Riwayat bertanda tangan HMAC, User, checkCitations() (+52 more)

### Community 14 - "seed-document.mjs"
Cohesion: 0.11
Nodes (17): Dokumen referensi bot demo Nara, Prompt 7 layer untuk membangun ulang proyek, Pemotong dokumen di browser, Paket gratis Cloudflare Workers/D1/Vectorize, Nara platform (chatbot dokumen), Prompt 7 layer (strict grounding), [base, file, ...flags], chunks (+9 more)

### Community 15 - "auth.ts"
Cohesion: 0.15
Nodes (22): ACCOUNT_DAYS, BotRow, botStatus(), changePassword(), createSession(), createUser(), DEFAULT_BOT, DUMMY (+14 more)

### Community 16 - "start-worker.mjs"
Cohesion: 0.15
Nodes (11): args, child, chunks, doc(), future, past, [port, fakePort, password], q() (+3 more)

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 19 - "retrieve"
Cohesion: 0.12
Nodes (17): bot_config, chunks, file, chat_log, chunks_fts, idx_chat_log_created, idx_chunks_idx, chunks_fts (+9 more)

### Community 20 - "verifyLogin"
Cohesion: 0.40
Nodes (6): Audit keamanan 1–3, Kunci login per IP/email, constantTimeEqualHex(), fromHex(), verifyLogin(), loginLocked()

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.40
Nodes (4): Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "build-tsbot.mjs"
Cohesion: 0.22
Nodes (8): bot, fail(), frames, LOOPBACK, OUT, ROOT, SRC, toOrigin()

### Community 24 - "smalltalk.ts"
Cohesion: 0.27
Nodes (9): retrieve(), streamAnswer(), words(), Lang, detectSmallTalk(), normalise(), PATTERNS, SmallTalkKind (+1 more)

### Community 25 - "deploy"
Cohesion: 0.22
Nodes (9): env, needs, runs-on, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, jobs, deploy, qa (+1 more)

### Community 26 - "reseed"
Cohesion: 0.22
Nodes (9): reseed, on, push, workflow_dispatch, branches, default, description, type (+1 more)

### Community 27 - "serve-tsbot.mjs"
Cohesion: 0.22
Nodes (4): DIST, headers, [tsPort, apiPort, imtsPort, otherPort], TYPES

### Community 28 - "steps"
Cohesion: 0.25
Nodes (8): steps, id, name, run, uses, with, cache, node-version

### Community 29 - "0004_accounts.sql"
Cohesion: 0.43
Nodes (7): bots, idx_bots_owner, idx_sessions_user, idx_users_expires, sessions, users, createBot()

## Knowledge Gaps
- **10 isolated node(s):** `Dashboard pemilik bot`, `Gerbang skor sebelum AI`, `Paket gratis Cloudflare Workers/D1/Vectorize`, `Uji coba + panel X-ray`, `Audit keamanan 1–3` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 241 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `answer()` connect `rag.ts` to `index.ts`, `settings.ts`, `channels.ts`, `cache.ts`, `seed-document.mjs`, `retrieve`, `smalltalk.ts`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `answer()` (e.g. with `paint()` and `Nara platform (chatbot dokumen)`) actually correct?**
  _`answer()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Dashboard pemilik bot`, `Gerbang skor sebelum AI`, `Paket gratis Cloudflare Workers/D1/Vectorize` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08199643493761141 - nodes in this community are weakly interconnected._
- **Why does `Deploy otomatis GitHub Actions` connect `deploy.yml` to `seed-document.mjs`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08309178743961353 - nodes in this community are weakly interconnected._
- **Why does `Nara platform (chatbot dokumen)` connect `seed-document.mjs` to `rag.ts`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._