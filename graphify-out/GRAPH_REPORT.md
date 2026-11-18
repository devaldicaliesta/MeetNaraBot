# Graph Report - MeetNaraBot  (2026-11-18)

## Corpus Check
- 126 files · ~124,173 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 7, .css 2, .example 1)

## Summary
- 1056 nodes · 2106 edges · 65 communities (47 shown, 18 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a4dbe792`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- src/index.ts
- llm.ts
- channels.ts
- rag.ts
- TanyaSayaChat
- package.json
- settings.ts
- steps
- env
- env
- cache.ts
- dev-server.mjs
- channels.spec.ts
- Nara · Mercury
- seed-document.mjs
- auth.ts
- start-worker.mjs
- compilerOptions
- graph.yml
- backend.ts
- file
- Nara: catatan untuk Claude
- scheduler.ts
- guard.ts
- TSbot
- kind.ts
- GradientKindDefinition
- chunks
- webgpu-device.ts
- gradient-engine/index.ts
- webgpu.ts
- purgeBot
- WebGPULease
- verifyLogin
- src/types.ts
- playwright.config.ts
- serve-tsbot.mjs
- WgpuDevice
- compilerOptions
- Nara platform (chatbot dokumen)
- build-tsbot.mjs
- smalltalk.ts
- retrieve
- GradientBackend
- shaders/dither-field.ts
- 0004_accounts.sql
- shaders/smear.ts
- WgpuEncoder
- shaders/mesh.ts
- shaders/radial-glow.ts
- WgpuPass
- kinds.ts
- shaders/rise.ts
- shaders/silk.ts
- pick
- shaders/grain.ts
- shaders/halo.ts
- shaders/limb.ts
- shaders/linear-flow.ts
- shaders/mist.ts
- shaders/ribbon.ts
- shaders/void.ts
- shaders/waves.ts
- WgpuGpu

## God Nodes (most connected - your core abstractions)
1. `answer()` - 29 edges
2. `GradientKindDefinition` - 27 edges
3. `mountGradient()` - 24 edges
4. `env` - 24 edges
5. `TanyaSayaChat` - 21 edges
6. `GradientParams` - 19 edges
7. `WebGPULease` - 17 edges
8. `normalizeParams()` - 17 edges
9. `pick()` - 17 edges
10. `createWebGLRenderer()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Batas yang diperiksa` --references--> `storeAnswer()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/cache.ts
- `Batas yang diperiksa` --references--> `run()`  [INFERRED]
  docs/security/tsbot-audit-2026-11.md → web/gradients/gradient-engine/scheduler.ts
- `Batas yang diperiksa` --references--> `checkCitations()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/grounding.ts
- `Nara platform (chatbot dokumen)` --references--> `answer()`  [INFERRED]
  README.md → src/rag.ts
- `Isolasi data per bot` --implements--> `tenantEnv()`  [EXTRACTED]
  README.md → src/settings.ts

## Import Cycles
- None detected.

## Communities (65 total, 18 thin omitted)

### Community 0 - "src/index.ts"
Cohesion: 0.09
Nodes (20): Dashboard pemilik bot, app, dailyQuota(), Env, FileRow, hits, ip(), lockedMessage() (+12 more)

### Community 1 - "llm.ts"
Cohesion: 0.21
Nodes (19): Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom(), embed() (+11 more)

### Community 2 - "channels.ts"
Cohesion: 0.07
Nodes (51): settings, channel_history, channel_seen, idx_channel_history_updated, bodyTooLarge(), channelCommand(), citedSources(), clip() (+43 more)

### Community 3 - "rag.ts"
Cohesion: 0.10
Nodes (28): Uji coba + panel X-ray, paint(), Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, checkCitations(), CitationCheck, detectDocLang(), EN_WORDS (+20 more)

### Community 4 - "TanyaSayaChat"
Cohesion: 0.13
Nodes (10): Audit keamanan TSbot (2026-11), Batas yang diperiksa, Hasil, Landing page + widget demo, esc(), inkFor(), inline(), markdown() (+2 more)

### Community 5 - "package.json"
Cohesion: 0.08
Nodes (30): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, esbuild@0.28.2, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0 (+22 more)

### Community 6 - "settings.ts"
Cohesion: 0.10
Nodes (18): ChainEntry, DEFAULT_SETTINGS, deleteSetting(), EMBEDDING_MODEL, GEMINI_EMBEDDING_MODEL, KEYED_PROVIDERS, keyStatus(), PromptLayers (+10 more)

### Community 7 - "steps"
Cohesion: 0.08
Nodes (25): CI, jobs, qa, name, on, pull_request, push, workflow_call (+17 more)

### Community 8 - "env"
Cohesion: 0.06
Nodes (31): concurrency, cancel-in-progress, group, env, needs, runs-on, steps, CLOUDFLARE_ACCOUNT_ID (+23 more)

### Community 9 - "env"
Cohesion: 0.05
Nodes (41): env, needs, runs-on, steps, ADMIN_PASSWORD, CF_WORKERS_AI_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN (+33 more)

### Community 10 - "cache.ts"
Cohesion: 0.14
Nodes (23): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent, CACHE_TTL_DAYS, CacheHit, cacheScope(), cacheStats(), clearCache() (+15 more)

### Community 11 - "dev-server.mjs"
Cohesion: 0.11
Nodes (17): agg(), bots, buildSystem(), DEFAULTS, docsLabel(), info(), LAYERS, PORT (+9 more)

### Community 12 - "channels.spec.ts"
Cohesion: 0.22
Nodes (4): Call, startFakeChatApi(), fake, TG_SECRET

### Community 13 - "Nara · Mercury"
Cohesion: 0.20
Nodes (9): Colors, Components, Do's and Don'ts, Elevation & Depth, Layout, Nara · Mercury, Overview, Shapes (+1 more)

### Community 14 - "seed-document.mjs"
Cohesion: 0.06
Nodes (29): concurrency, cancel-in-progress, group, reseed, name, on, push, workflow_dispatch (+21 more)

### Community 15 - "auth.ts"
Cohesion: 0.13
Nodes (23): Isolasi data per bot, ACCOUNT_DAYS, BotRow, changePassword(), createSession(), createUser(), DEFAULT_BOT, DUMMY (+15 more)

### Community 16 - "start-worker.mjs"
Cohesion: 0.15
Nodes (11): args, child, chunks, doc(), future, past, [port, fakePort, password], q() (+3 more)

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 19 - "backend.ts"
Cohesion: 0.19
Nodes (11): BackendLease, BackendName, webglBackend, webgpuBackend, PooledContext, webglUnsupported(), AnyCanvas, ColorResolver (+3 more)

### Community 20 - "file"
Cohesion: 0.22
Nodes (8): Tambahan: banyak dokumen per bot dan penyedia OpenAI, bot_config, file, idx_file_bot, activeFile(), documentsLabel(), listFiles(), processingFile()

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.25
Nodes (6): Gradien Mercury (gradients.sh), Kerja UI dan teks: DESIGN.md + antislop, Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "scheduler.ts"
Cohesion: 0.06
Nodes (48): defaultParams, acquireContext(), changeListeners, contexts, create(), createCanvas(), destroy(), liveContextCount() (+40 more)

### Community 24 - "guard.ts"
Cohesion: 0.10
Nodes (26): Peringatan PII saat unggah, Cache jawaban semantik (pola GPTCache), Guardrail prompt injection, Guardrail data pribadi (PII), Riwayat bertanda tangan HMAC, b64url(), detectInjection(), digits() (+18 more)

### Community 25 - "TSbot"
Cohesion: 0.40
Nodes (4): Build dan uji lokal, Pasang di IMTS (https://imtsbot.pages.dev), Pengaturan sekali, TSbot

### Community 26 - "kind.ts"
Cohesion: 0.16
Nodes (7): stops(), ditherBurst, fluted, spectrum, wgsl, wgsl, wgsl

### Community 27 - "GradientKindDefinition"
Cohesion: 0.22
Nodes (5): GradientKindDefinition, horizon, pixelGlass, wgsl, wgsl

### Community 28 - "chunks"
Cohesion: 0.17
Nodes (11): chunks, chat_log, chunks_fts, idx_chat_log_created, idx_chunks_idx, usage, idx_chat_log_bot, idx_chunks_bot_idx (+3 more)

### Community 29 - "webgpu-device.ts"
Cohesion: 0.10
Nodes (21): adapterRefusal(), describe(), deviceLost(), fail(), isWgpuGpu(), loseWebGPUDevice(), navigatorGpu(), pipelines (+13 more)

### Community 30 - "gradient-engine/index.ts"
Cohesion: 0.05
Nodes (87): backendFor(), FALLBACK_RGB, getProbe(), hasCssVariable(), linearToSrgb(), literalCache, Oklab, oklabToSrgb() (+79 more)

### Community 31 - "webgpu.ts"
Cohesion: 0.13
Nodes (16): BackendPreference, changeListeners, setWebGPUMemoryCap(), hasWebGPU(), isPreference(), load(), MAX_WEBGPU_SURFACES, notifyWebGPUChange() (+8 more)

### Community 32 - "purgeBot"
Cohesion: 0.18
Nodes (12): Audit keamanan run 4 (2026-11), Batas yang diperiksa, Hasil, vector_tombstones, Akun 7 hari + cron pembersihan, listBots(), deleteVectors(), purgeBot() (+4 more)

### Community 33 - "WebGPULease"
Cohesion: 0.11
Nodes (12): acquireSurface(), isWgpuContext(), leasedBytes(), packUniforms(), probeCopyPath(), removeSurface(), webgpuContext(), WebGPULease (+4 more)

### Community 34 - "verifyLogin"
Cohesion: 0.28
Nodes (9): Audit keamanan 1–3, Kunci login per IP/email, botStatus(), constantTimeEqualHex(), fromHex(), keepPermanentAccounts(), permanentBots(), verifyLogin() (+1 more)

### Community 35 - "src/types.ts"
Cohesion: 0.29
Nodes (6): User, AppEnv, ChatEvent, ChatMessage, Principal, Source

### Community 36 - "playwright.config.ts"
Cohesion: 0.20
Nodes (8): FAKE_API_PORT, IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test, admin, fake

### Community 37 - "serve-tsbot.mjs"
Cohesion: 0.29
Nodes (4): DIST, headers, [tsPort, apiPort, imtsPort, otherPort], TYPES

### Community 38 - "WgpuDevice"
Cohesion: 0.18
Nodes (4): wgslPostlude, wgslPrelude, compile(), WgpuDevice

### Community 39 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 40 - "Nara platform (chatbot dokumen)"
Cohesion: 0.33
Nodes (6): Dokumen referensi bot demo Nara, Prompt 7 layer untuk membangun ulang proyek, Paket gratis Cloudflare Workers/D1/Vectorize, Nara platform (chatbot dokumen), Prompt 7 layer (strict grounding), DEFAULT_LAYERS

### Community 41 - "build-tsbot.mjs"
Cohesion: 0.17
Nodes (10): OUT, ROOT, bot, fail(), frames, LOOPBACK, OUT, ROOT (+2 more)

### Community 42 - "smalltalk.ts"
Cohesion: 0.40
Nodes (5): Lang, detectSmallTalk(), normalise(), PATTERNS, SmallTalkKind

### Community 43 - "retrieve"
Cohesion: 0.50
Nodes (5): chunks_fts, Hybrid search (vektor + BM25 + RRF), Gerbang skor sebelum AI, ftsQuery(), retrieve()

### Community 46 - "0004_accounts.sql"
Cohesion: 0.36
Nodes (8): bots, idx_bots_owner, idx_sessions_user, idx_users_expires, sessions, users, createBot(), sessionUser()

### Community 50 - "shaders/mesh.ts"
Cohesion: 0.40
Nodes (3): BLOBS, mesh, wgsl

### Community 53 - "kinds.ts"
Cohesion: 0.20
Nodes (7): listKinds(), registerKind(), registry, beam, swirl, wgsl, wgsl

### Community 58 - "pick"
Cohesion: 0.22
Nodes (5): pick(), aurora, chrome, wgsl, wgsl

## Knowledge Gaps
- **11 isolated node(s):** `Device`, `Dashboard pemilik bot`, `DEPLOY_TOKEN satu kali pakai`, `Peringatan PII saat unggah`, `Guardrail prompt injection` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 372 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Batas yang diperiksa` connect `TanyaSayaChat` to `scheduler.ts`?**
  _High betweenness centrality (0.386) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `answer()` (e.g. with `paint()` and `Nara platform (chatbot dokumen)`) actually correct?**
  _`answer()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Device`, `Dashboard pemilik bot`, `DEPLOY_TOKEN satu kali pakai` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09195402298850575 - nodes in this community are weakly interconnected._
- **Why does `run()` connect `scheduler.ts` to `TanyaSayaChat`?**
  _High betweenness centrality (0.380) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `mountGradient()` (e.g. with `.isLost()` and `.renderFrame()`) actually correct?**
  _`mountGradient()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `channels.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07402597402597402 - nodes in this community are weakly interconnected._