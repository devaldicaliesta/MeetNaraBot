# Graph Report - MeetNaraBot  (2026-11-12)

## Corpus Check
- 57 files · ~68,700 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 6, .css 2, .example 1)

## Summary
- 642 nodes · 1137 edges · 28 communities (26 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2e51e9a4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- llm.ts
- channels.ts
- tenantEnv
- TanyaSayaChat
- package.json
- settings.ts
- steps
- env
- env
- cache.ts
- dev-server.mjs
- playwright.config.ts
- Nara
- seed-document.mjs
- auth.ts
- start-worker.mjs
- compilerOptions
- graph.yml
- types.ts
- purgeBot
- Nara: catatan untuk Claude
- app
- rag.ts
- TSbot
- activeFile
- loginKeys

## God Nodes (most connected - your core abstractions)
1. `answer()` - 29 edges
2. `env` - 23 edges
3. `TanyaSayaChat` - 21 edges
4. `converse()` - 12 edges
5. `completeChat()` - 12 edges
6. `getSettings()` - 12 edges
7. `lookupSemantic()` - 11 edges
8. `redactPii()` - 10 edges
9. `purgeBot()` - 10 edges
10. `scripts` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Kunci login per IP/email` --implements--> `verifyLogin()`  [INFERRED]
  SECURITY.md → src/auth.ts
- `Batas yang diperiksa` --references--> `storeAnswer()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/cache.ts
- `Batas yang diperiksa` --references--> `checkCitations()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/grounding.ts
- `Nara platform (chatbot dokumen)` --references--> `answer()`  [INFERRED]
  README.md → src/rag.ts
- `Typography` --references--> `clamp()`  [INFERRED]
  DESIGN.md → src/settings.ts

## Import Cycles
- None detected.

## Communities (28 total, 2 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.10
Nodes (16): vector_tombstones, Akun 7 hari + cron pembersihan, listBots(), purgeExpiredCache(), deleteVectors(), Env, FileRow, hits (+8 more)

### Community 1 - "llm.ts"
Cohesion: 0.18
Nodes (21): Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom(), embed() (+13 more)

### Community 2 - "channels.ts"
Cohesion: 0.10
Nodes (39): channel_history, channel_seen, idx_channel_history_updated, channelCommand(), citedSources(), clip(), clipHtml(), escapeHtml() (+31 more)

### Community 3 - "tenantEnv"
Cohesion: 0.22
Nodes (9): Isolasi data per bot, ownedBot(), benv(), visitorSuggestions(), generateSuggestions(), getKeys(), getSuggestions(), settingKey() (+1 more)

### Community 4 - "TanyaSayaChat"
Cohesion: 0.13
Nodes (10): Audit keamanan TSbot (2026-11), Batas yang diperiksa, Hasil, Landing page + widget demo, esc(), inkFor(), inline(), markdown() (+2 more)

### Community 5 - "package.json"
Cohesion: 0.08
Nodes (27): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0, engines (+19 more)

### Community 6 - "settings.ts"
Cohesion: 0.14
Nodes (18): asLang(), ChainEntry, clamp(), DEFAULT_SETTINGS, deleteSetting(), envDefaults(), fromLegacy(), GEMINI_EMBEDDING_MODEL (+10 more)

### Community 7 - "steps"
Cohesion: 0.08
Nodes (25): CI, jobs, qa, name, on, pull_request, push, workflow_call (+17 more)

### Community 8 - "env"
Cohesion: 0.06
Nodes (31): concurrency, cancel-in-progress, group, env, needs, runs-on, steps, CLOUDFLARE_ACCOUNT_ID (+23 more)

### Community 9 - "env"
Cohesion: 0.05
Nodes (40): env, needs, runs-on, steps, ADMIN_PASSWORD, CF_WORKERS_AI_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN (+32 more)

### Community 10 - "cache.ts"
Cohesion: 0.12
Nodes (26): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent, Peringatan PII saat unggah, Cache jawaban semantik (pola GPTCache), Guardrail data pribadi (PII), CACHE_TTL_DAYS, CacheHit (+18 more)

### Community 11 - "dev-server.mjs"
Cohesion: 0.09
Nodes (22): agg(), bots, buildSystem(), DEFAULTS, docsLabel(), info(), LAYERS, PORT (+14 more)

### Community 12 - "playwright.config.ts"
Cohesion: 0.13
Nodes (12): FAKE_API_PORT, IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test, Call, startFakeChatApi() (+4 more)

### Community 13 - "Nara"
Cohesion: 0.20
Nodes (9): Colors, Components, Do's and Don'ts, Elevation & Depth, Layout, Nara, Overview, Shapes (+1 more)

### Community 14 - "seed-document.mjs"
Cohesion: 0.05
Nodes (35): concurrency, cancel-in-progress, group, reseed, name, on, push, workflow_dispatch (+27 more)

### Community 15 - "auth.ts"
Cohesion: 0.10
Nodes (33): bots, idx_bots_owner, idx_sessions_user, idx_users_expires, sessions, users, ACCOUNT_DAYS, BotRow (+25 more)

### Community 16 - "start-worker.mjs"
Cohesion: 0.07
Nodes (23): bot, fail(), frames, LOOPBACK, OUT, ROOT, SRC, toOrigin() (+15 more)

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 19 - "types.ts"
Cohesion: 0.40
Nodes (4): KEYED_PROVIDERS, PROVIDERS, Bindings, Principal

### Community 20 - "purgeBot"
Cohesion: 0.12
Nodes (16): Audit keamanan run 4 (2026-11), Batas yang diperiksa, Hasil, bot_config, chunks, file, chat_log, chunks_fts (+8 more)

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.33
Nodes (5): Kerja UI dan teks: DESIGN.md + antislop, Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 24 - "rag.ts"
Cohesion: 0.06
Nodes (56): chunks_fts, Uji coba + panel X-ray, paint(), Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, Hybrid search (vektor + BM25 + RRF), Gerbang skor sebelum AI, Guardrail prompt injection (+48 more)

### Community 25 - "TSbot"
Cohesion: 0.40
Nodes (4): Build dan uji lokal, Pasang di IMTS (https://imtsbot.pages.dev), Pengaturan sekali, TSbot

### Community 26 - "activeFile"
Cohesion: 0.40
Nodes (5): Tambahan: banyak dokumen per bot dan penyedia OpenAI, activeFile(), documentsLabel(), listFiles(), processingFile()

### Community 28 - "loginKeys"
Cohesion: 0.12
Nodes (17): settings, usage, Audit keamanan 1–3, Kunci login per IP/email, chatKey(), dailyQuota(), ip(), loginKeys() (+9 more)

## Knowledge Gaps
- **10 isolated node(s):** `Dashboard pemilik bot`, `Paket gratis Cloudflare Workers/D1/Vectorize`, `Gerbang skor sebelum AI`, `Uji coba + panel X-ray`, `Peringatan PII saat unggah` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 268 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `answer()` connect `rag.ts` to `index.ts`, `llm.ts`, `channels.ts`, `tenantEnv`, `cache.ts`, `dev-server.mjs`, `seed-document.mjs`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `answer()` (e.g. with `paint()` and `Nara platform (chatbot dokumen)`) actually correct?**
  _`answer()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Dashboard pemilik bot`, `Paket gratis Cloudflare Workers/D1/Vectorize`, `Gerbang skor sebelum AI` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09686609686609686 - nodes in this community are weakly interconnected._
- **Why does `Nara platform (chatbot dokumen)` connect `seed-document.mjs` to `rag.ts`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Should `channels.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09634551495016612 - nodes in this community are weakly interconnected._
- **Should `TanyaSayaChat` be split into smaller, more focused modules?**
  _Cohesion score 0.12878787878787878 - nodes in this community are weakly interconnected._