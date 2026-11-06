# Graph Report - MeetNaraBot  (2026-11-06)

## Corpus Check
- 52 files · ~64,033 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 5, .css 2, .example 1)

## Summary
- 602 nodes · 1063 edges · 27 communities (26 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0f662001`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- settings.ts
- channels.ts
- tenantEnv
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
- completeChat
- getSettings
- Nara: catatan untuk Claude
- build-tsbot.mjs
- smalltalk.ts
- TSbot
- serve-tsbot.mjs

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
- `Batas yang diperiksa` --references--> `inline()`  [INFERRED]
  docs/security/tsbot-audit-2026-11.md → public/widget.js
- `Rantai penyedia LLM + failover` --implements--> `buildChain()`  [EXTRACTED]
  README.md → src/llm.ts
- `Rantai penyedia LLM + failover` --implements--> `streamChat()`  [EXTRACTED]
  README.md → src/llm.ts
- `paint()` --indirect_call--> `answer()`  [INFERRED]
  public/widget.js → src/rag.ts

## Import Cycles
- None detected.

## Communities (27 total, 1 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.09
Nodes (19): usage, Dashboard pemilik bot, app, dailyQuota(), Env, FileRow, hits, ip() (+11 more)

### Community 1 - "settings.ts"
Cohesion: 0.12
Nodes (20): FailAttempt, BotSettings, ChainEntry, DEFAULT_SETTINGS, deleteSetting(), Embedder, EMBEDDING_MODEL, GEMINI_EMBEDDING_MODEL (+12 more)

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
Nodes (9): bots, DEFAULTS, LAYERS, PORT, PROVIDERS, ROOT, sessions, STOP (+1 more)

### Community 12 - "playwright.config.ts"
Cohesion: 0.13
Nodes (12): FAKE_API_PORT, IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test, Call, startFakeChatApi() (+4 more)

### Community 13 - "rag.ts"
Cohesion: 0.06
Nodes (55): Uji coba + panel X-ray, Peringatan PII saat unggah, Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, Guardrail prompt injection, Guardrail data pribadi (PII), Riwayat bertanda tangan HMAC, User (+47 more)

### Community 14 - "seed-document.mjs"
Cohesion: 0.09
Nodes (22): Dokumen referensi bot demo Nara, chunks_fts, Prompt 7 layer untuk membangun ulang proyek, Pemotong dokumen di browser, Paket gratis Cloudflare Workers/D1/Vectorize, Hybrid search (vektor + BM25 + RRF), Nara platform (chatbot dokumen), Prompt 7 layer (strict grounding) (+14 more)

### Community 15 - "auth.ts"
Cohesion: 0.06
Nodes (55): bot_config, chunks, file, chat_log, chunks_fts, idx_chat_log_created, idx_chunks_idx, bots (+47 more)

### Community 16 - "start-worker.mjs"
Cohesion: 0.15
Nodes (11): args, child, chunks, doc(), future, past, [port, fakePort, password], q() (+3 more)

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 19 - "completeChat"
Cohesion: 0.18
Nodes (16): Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom(), embed() (+8 more)

### Community 20 - "getSettings"
Cohesion: 0.27
Nodes (10): settings, asLang(), clamp(), envDefaults(), fromLegacy(), getSettings(), normalizeSettings(), readSetting() (+2 more)

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.40
Nodes (4): Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "build-tsbot.mjs"
Cohesion: 0.22
Nodes (8): bot, fail(), frames, LOOPBACK, OUT, ROOT, SRC, toOrigin()

### Community 24 - "smalltalk.ts"
Cohesion: 0.27
Nodes (9): retrieve(), streamAnswer(), words(), Lang, detectSmallTalk(), normalise(), PATTERNS, SmallTalkKind (+1 more)

### Community 25 - "TSbot"
Cohesion: 0.40
Nodes (4): Build dan uji lokal, Pasang di IMTS, Pengaturan sekali, TSbot

### Community 27 - "serve-tsbot.mjs"
Cohesion: 0.25
Nodes (4): DIST, headers, [tsPort, apiPort, imtsPort, otherPort], TYPES

## Knowledge Gaps
- **10 isolated node(s):** `Dashboard pemilik bot`, `Peringatan PII saat unggah`, `Uji coba + panel X-ray`, `Guardrail prompt injection`, `Paket gratis Cloudflare Workers/D1/Vectorize` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 248 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `answer()` connect `rag.ts` to `index.ts`, `channels.ts`, `tenantEnv`, `TanyaSayaChat`, `cache.ts`, `seed-document.mjs`, `completeChat`, `smalltalk.ts`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `answer()` (e.g. with `paint()` and `Nara platform (chatbot dokumen)`) actually correct?**
  _`answer()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Dashboard pemilik bot`, `Peringatan PII saat unggah`, `Uji coba + panel X-ray` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09359605911330049 - nodes in this community are weakly interconnected._
- **Why does `Deploy otomatis GitHub Actions` connect `deploy.yml` to `seed-document.mjs`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12318840579710146 - nodes in this community are weakly interconnected._
- **Why does `Nara platform (chatbot dokumen)` connect `seed-document.mjs` to `rag.ts`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._