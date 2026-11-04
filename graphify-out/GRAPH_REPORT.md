# Graph Report - MeetNaraBot  (2026-11-04)

## Corpus Check
- 46 files · ~61,994 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .example 1, .css 1)

## Summary
- 542 nodes · 992 edges · 24 communities (23 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.64)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `49a7581d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- settings.ts
- channels.ts
- 0004_accounts.sql
- TanyaSayaChat
- package.json
- deploy.yml
- steps
- guard.ts
- env
- cache.ts
- dev-server.mjs
- channels.spec.ts
- rag.ts
- start-worker.mjs
- auth.ts
- grounding.ts
- compilerOptions
- graph.yml
- 0002_rag_upgrade.sql
- verifyLogin
- Nara: catatan untuk Claude
- tenantEnv

## God Nodes (most connected - your core abstractions)
1. `answer()` - 29 edges
2. `TanyaSayaChat` - 21 edges
3. `env` - 15 edges
4. `getSettings()` - 12 edges
5. `converse()` - 12 edges
6. `completeChat()` - 11 edges
7. `lookupSemantic()` - 11 edges
8. `redactPii()` - 10 edges
9. `streamChat()` - 9 edges
10. `channelRoutes()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Nara platform (chatbot dokumen)` --references--> `answer()`  [INFERRED]
  README.md → src/rag.ts
- `Kunci login per IP/email` --implements--> `verifyLogin()`  [INFERRED]
  SECURITY.md → src/auth.ts
- `Isolasi data per bot` --implements--> `tenantEnv()`  [EXTRACTED]
  README.md → src/settings.ts
- `Rantai penyedia LLM + failover` --implements--> `buildChain()`  [EXTRACTED]
  README.md → src/llm.ts
- `Rantai penyedia LLM + failover` --implements--> `streamChat()`  [EXTRACTED]
  README.md → src/llm.ts

## Import Cycles
- None detected.

## Communities (24 total, 1 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.10
Nodes (17): Dashboard pemilik bot, app, dailyQuota(), Env, FileRow, hits, ip(), lockedMessage() (+9 more)

### Community 1 - "settings.ts"
Cohesion: 0.09
Nodes (28): settings, visitorSuggestions(), asLang(), ChainEntry, clamp(), DEFAULT_SETTINGS, deleteSetting(), EMBEDDING_MODEL (+20 more)

### Community 2 - "channels.ts"
Cohesion: 0.10
Nodes (39): channel_history, channel_seen, idx_channel_history_updated, channelCommand(), citedSources(), clip(), clipHtml(), escapeHtml() (+31 more)

### Community 3 - "0004_accounts.sql"
Cohesion: 0.16
Nodes (18): chunks, bots, idx_bots_owner, idx_chunks_bot_idx, idx_sessions_user, idx_users_expires, sessions, users (+10 more)

### Community 4 - "TanyaSayaChat"
Cohesion: 0.16
Nodes (6): Landing page + widget demo, esc(), inkFor(), inline(), markdown(), TanyaSayaChat

### Community 5 - "package.json"
Cohesion: 0.08
Nodes (27): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0, engines (+19 more)

### Community 6 - "deploy.yml"
Cohesion: 0.07
Nodes (26): concurrency, cancel-in-progress, group, env, needs, runs-on, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN (+18 more)

### Community 7 - "steps"
Cohesion: 0.08
Nodes (25): CI, jobs, qa, name, on, pull_request, push, workflow_call (+17 more)

### Community 8 - "guard.ts"
Cohesion: 0.12
Nodes (25): Peringatan PII saat unggah, Cache jawaban semantik (pola GPTCache), Guardrail prompt injection, Guardrail data pribadi (PII), Riwayat bertanda tangan HMAC, b64url(), detectInjection(), digits() (+17 more)

### Community 9 - "env"
Cohesion: 0.09
Nodes (23): steps, ADMIN_PASSWORD, DEEPSEEK_API_KEY, DEPLOY_TOKEN, GEMINI_API_KEY, HF_TOKEN, MOONSHOT_API_KEY, RESEED (+15 more)

### Community 10 - "cache.ts"
Cohesion: 0.15
Nodes (22): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent, CACHE_TTL_DAYS, CacheHit, cacheScope(), cacheStats(), clearCache() (+14 more)

### Community 11 - "dev-server.mjs"
Cohesion: 0.09
Nodes (18): bots, DEFAULTS, LAYERS, PORT, PROVIDERS, retrieve(), ROOT, sessions (+10 more)

### Community 12 - "channels.spec.ts"
Cohesion: 0.14
Nodes (9): FAKE_API_PORT, QA_PASSWORD, @playwright/test, Call, startFakeChatApi(), fake, TG_SECRET, admin (+1 more)

### Community 13 - "rag.ts"
Cohesion: 0.08
Nodes (48): chunks_fts, paint(), Hybrid search (vektor + BM25 + RRF), Rantai penyedia LLM + failover, Gerbang skor sebelum AI, User, AllProvidersFailed, assertWorkersAiModel() (+40 more)

### Community 14 - "start-worker.mjs"
Cohesion: 0.06
Nodes (28): Dokumen referensi bot demo Nara, Prompt 7 layer untuk membangun ulang proyek, Pemotong dokumen di browser, Paket gratis Cloudflare Workers/D1/Vectorize, Nara platform (chatbot dokumen), Prompt 7 layer (strict grounding), [base, file, ...flags], chunks (+20 more)

### Community 15 - "auth.ts"
Cohesion: 0.15
Nodes (22): ACCOUNT_DAYS, BotRow, botStatus(), changePassword(), createSession(), createUser(), DEFAULT_BOT, DUMMY (+14 more)

### Community 16 - "grounding.ts"
Cohesion: 0.13
Nodes (13): bot_config, file, idx_file_bot, Uji coba + panel X-ray, Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, checkCitations(), CitationCheck (+5 more)

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 19 - "0002_rag_upgrade.sql"
Cohesion: 0.25
Nodes (8): chat_log, chunks_fts, idx_chat_log_created, idx_chunks_idx, usage, idx_chat_log_bot, logChat(), spendPlatform()

### Community 20 - "verifyLogin"
Cohesion: 0.40
Nodes (6): Audit keamanan 1–3, Kunci login per IP/email, constantTimeEqualHex(), fromHex(), verifyLogin(), loginLocked()

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.40
Nodes (4): Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "tenantEnv"
Cohesion: 0.50
Nodes (4): Isolasi data per bot, ownedBot(), benv(), tenantEnv()

## Knowledge Gaps
- **10 isolated node(s):** `Dashboard pemilik bot`, `Audit keamanan 1–3`, `Uji coba + panel X-ray`, `Paket gratis Cloudflare Workers/D1/Vectorize`, `Akun 7 hari + cron pembersihan` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 212 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `answer()` connect `rag.ts` to `index.ts`, `channels.ts`, `guard.ts`, `cache.ts`, `dev-server.mjs`, `start-worker.mjs`, `grounding.ts`, `tenantEnv`?**
  _High betweenness centrality (0.201) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `answer()` (e.g. with `paint()` and `Nara platform (chatbot dokumen)`) actually correct?**
  _`answer()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Dashboard pemilik bot`, `Audit keamanan 1–3`, `Uji coba + panel X-ray` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09971509971509972 - nodes in this community are weakly interconnected._
- **Why does `Deploy otomatis GitHub Actions` connect `deploy.yml` to `start-worker.mjs`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09247311827956989 - nodes in this community are weakly interconnected._
- **Why does `Nara platform (chatbot dokumen)` connect `start-worker.mjs` to `rag.ts`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._