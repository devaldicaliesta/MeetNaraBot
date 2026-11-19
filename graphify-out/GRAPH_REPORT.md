# Graph Report - MeetNaraBot  (2026-11-19)

## Corpus Check
- 128 files · ~126,005 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 8, .css 3, .example 1)

## Summary
- 1068 nodes · 2134 edges · 74 communities (54 shown, 20 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5a7f1638`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- src/index.ts
- llm.ts
- channels.ts
- rag.ts
- TanyaSayaChat
- package.json
- gradient-engine/index.ts
- steps
- env
- env
- cache.ts
- dev-server.mjs
- channels.spec.ts
- Nara · Mercury
- seed-document.mjs
- auth.ts
- run
- compilerOptions
- graph.yml
- GradientParams
- renderer.ts
- Nara: catatan untuk Claude
- scheduler.ts
- guard.ts
- TSbot
- kind.ts
- kinds.ts
- chunks
- webgpu-device.ts
- export.ts
- webgpu.ts
- purgeBot
- probeCopyPath
- scripts
- src/types.ts
- playwright.config.ts
- guard.test.ts
- .renderFrame
- compilerOptions
- GradientParams
- probe
- purgeExpiredAccounts
- redactPii
- shaders/horizon.ts
- pick
- 0004_accounts.sql
- params.ts
- start-worker.mjs
- WgpuEncoder
- shaders/mesh.ts
- shaders/radial-glow.ts
- WgpuPass
- pool.ts
- build-tsbot.mjs
- shaders/rise.ts
- retrieve
- serve-tsbot.mjs
- GradientKindDefinition
- shaders/grain.ts
- GradientBackend
- shaders/limb.ts
- smalltalk.ts
- shaders/mist.ts
- shaders/ribbon.ts
- shaders/halo.ts
- shaders/void.ts
- shaders/waves.ts
- shaders/linear-flow.ts
- shaders/silk.ts
- loginKeys
- shaders/spectrum.ts
- wgsl-common.ts
- WgpuGpu

## God Nodes (most connected - your core abstractions)
1. `answer()` - 29 edges
2. `GradientKindDefinition` - 27 edges
3. `env` - 25 edges
4. `mountGradient()` - 24 edges
5. `TanyaSayaChat` - 21 edges
6. `GradientParams` - 19 edges
7. `WebGPULease` - 17 edges
8. `normalizeParams()` - 17 edges
9. `pick()` - 17 edges
10. `createWebGLRenderer()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Kunci login per IP/email` --implements--> `verifyLogin()`  [INFERRED]
  SECURITY.md → src/auth.ts
- `Batas yang diperiksa` --references--> `storeAnswer()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/cache.ts
- `Pemotong dokumen di browser` --conceptually_related_to--> `chunkSection()`  [INFERRED]
  public/admin.html → scripts/seed-document.mjs
- `Batas yang diperiksa` --references--> `run()`  [INFERRED]
  docs/security/tsbot-audit-2026-11.md → web/gradients/gradient-engine/scheduler.ts
- `Batas yang diperiksa` --references--> `checkCitations()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/grounding.ts

## Import Cycles
- None detected.

## Communities (74 total, 20 thin omitted)

### Community 0 - "src/index.ts"
Cohesion: 0.08
Nodes (25): Tambahan: banyak dokumen per bot dan penyedia OpenAI, Dashboard pemilik bot, Isolasi data per bot, ownedBot(), activeFile(), app, benv(), documentsLabel() (+17 more)

### Community 1 - "llm.ts"
Cohesion: 0.08
Nodes (46): settings, Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom() (+38 more)

### Community 2 - "channels.ts"
Cohesion: 0.09
Nodes (42): channel_history, channel_seen, idx_channel_history_updated, bodyTooLarge(), channelCommand(), citedSources(), clip(), clipHtml() (+34 more)

### Community 3 - "rag.ts"
Cohesion: 0.13
Nodes (20): paint(), cacheScope(), sha256(), injectionReply(), answer(), AnswerInput, buildSystemPrompt(), buildUserTurn() (+12 more)

### Community 4 - "TanyaSayaChat"
Cohesion: 0.13
Nodes (10): Audit keamanan TSbot (2026-11), Batas yang diperiksa, Hasil, Landing page + widget demo, esc(), inkFor(), inline(), markdown() (+2 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, esbuild@0.28.2, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0 (+12 more)

### Community 6 - "gradient-engine/index.ts"
Cohesion: 0.22
Nodes (15): listKinds(), registerKind(), grainFrame(), LOOP_RADIUS, loopPhase(), loopVector(), loopVectorAtPhase(), splitTiles() (+7 more)

### Community 7 - "steps"
Cohesion: 0.08
Nodes (25): CI, jobs, qa, name, on, pull_request, push, workflow_call (+17 more)

### Community 8 - "env"
Cohesion: 0.06
Nodes (33): concurrency, cancel-in-progress, group, env, needs, runs-on, steps, CLOUDFLARE_ACCOUNT_ID (+25 more)

### Community 9 - "env"
Cohesion: 0.05
Nodes (42): env, needs, runs-on, steps, ADMIN_PASSWORD, CF_WORKERS_AI_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN (+34 more)

### Community 10 - "cache.ts"
Cohesion: 0.18
Nodes (19): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent, CACHE_TTL_DAYS, CacheHit, cacheStats(), clearCache(), cosineInt8() (+11 more)

### Community 11 - "dev-server.mjs"
Cohesion: 0.11
Nodes (17): agg(), bots, buildSystem(), DEFAULTS, docsLabel(), info(), LAYERS, PORT (+9 more)

### Community 12 - "channels.spec.ts"
Cohesion: 0.16
Nodes (7): FAKE_API_PORT, Call, startFakeChatApi(), fake, TG_SECRET, admin, fake

### Community 13 - "Nara · Mercury"
Cohesion: 0.20
Nodes (9): Colors, Components, Do's and Don'ts, Elevation & Depth, Layout, Nara · Mercury, Overview, Shapes (+1 more)

### Community 14 - "seed-document.mjs"
Cohesion: 0.05
Nodes (34): concurrency, cancel-in-progress, group, reseed, name, on, push, workflow_dispatch (+26 more)

### Community 15 - "auth.ts"
Cohesion: 0.14
Nodes (24): ACCOUNT_DAYS, BotRow, changePassword(), constantTimeEqualHex(), createSession(), createUser(), DEFAULT_BOT, DUMMY (+16 more)

### Community 16 - "run"
Cohesion: 0.20
Nodes (9): BackendName, assignQuality(), ContextSlot, distanceToViewport(), groupScales(), noteScroll(), primarySurfaceBudget(), run() (+1 more)

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 19 - "GradientParams"
Cohesion: 0.19
Nodes (4): Oklab, removeSurface(), WebGPULease, WgpuBuffer

### Community 20 - "renderer.ts"
Cohesion: 0.14
Nodes (14): ExportRenderer, fullTarget(), compile(), ContextOptions, createWebGLRenderer(), ProgramInfo, ShaderError, UniformName (+6 more)

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.25
Nodes (6): Gradien Mercury (gradients.sh), Kerja UI dan teks: DESIGN.md + antislop, Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "scheduler.ts"
Cohesion: 0.10
Nodes (36): LIVE_FPS, mountGradient(), onLost(), MountOptions, liveContextCount(), contextStats(), EngineStats, FrameQuality (+28 more)

### Community 24 - "guard.ts"
Cohesion: 0.14
Nodes (18): Guardrail prompt injection, Riwayat bertanda tangan HMAC, b64url(), detectInjection(), digits(), enc, hmacKey(), INJECTION (+10 more)

### Community 25 - "TSbot"
Cohesion: 0.40
Nodes (4): Build dan uji lokal, Halaman IMTS (https://imtsbot.pages.dev), Pengaturan sekali, TSbot

### Community 26 - "kind.ts"
Cohesion: 0.16
Nodes (7): stops(), ditherBurst, fluted, swirl, wgsl, wgsl, wgsl

### Community 27 - "kinds.ts"
Cohesion: 0.18
Nodes (7): registry, chrome, pixelGlass, smear, wgsl, wgsl, wgsl

### Community 28 - "chunks"
Cohesion: 0.33
Nodes (6): chat_log, chunks_fts, idx_chat_log_created, usage, idx_chat_log_bot, spendPlatform()

### Community 29 - "webgpu-device.ts"
Cohesion: 0.12
Nodes (12): isWgpuGpu(), leasedBytes(), navigatorGpu(), pipelines, State, state, Surface, surfaces (+4 more)

### Community 30 - "export.ts"
Cohesion: 0.13
Nodes (28): FALLBACK_RGB, getProbe(), hasCssVariable(), linearToSrgb(), literalCache, oklabToSrgb(), parseChannel(), parseColorLiteral() (+20 more)

### Community 31 - "webgpu.ts"
Cohesion: 0.13
Nodes (17): backendFor(), BackendPreference, changeListeners, setWebGPUMemoryCap(), hasWebGPU(), isPreference(), load(), MAX_WEBGPU_SURFACES (+9 more)

### Community 32 - "purgeBot"
Cohesion: 0.20
Nodes (10): Audit keamanan run 4 (2026-11), Batas yang diperiksa, Hasil, vector_tombstones, listBots(), deleteVectors(), purgeAccount(), purgeBot() (+2 more)

### Community 33 - "probeCopyPath"
Cohesion: 0.31
Nodes (6): acquireSurface(), fail(), isWgpuContext(), probeCopyPath(), webgpuContext(), WgpuCanvasContext

### Community 34 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build:gradient, db:migrate, deploy, dev, dev:mock, qa, test:e2e (+2 more)

### Community 35 - "src/types.ts"
Cohesion: 0.29
Nodes (6): User, AppEnv, ChatEvent, ChatMessage, Principal, Source

### Community 36 - "playwright.config.ts"
Cohesion: 0.29
Nodes (5): IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test

### Community 37 - "guard.test.ts"
Cohesion: 0.19
Nodes (9): Uji coba + panel X-ray, Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, checkCitations(), CitationCheck, detectDocLang(), EN_WORDS, ID_WORDS (+1 more)

### Community 38 - ".renderFrame"
Cohesion: 0.20
Nodes (4): compile(), packUniforms(), WgpuDevice, WgpuPipeline

### Community 39 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 40 - "GradientParams"
Cohesion: 0.22
Nodes (8): grainLayer(), staticFallbackCss(), getKind(), kindDefaults(), MountedGradient, GradientParams, MERCURY, mountMercury()

### Community 41 - "probe"
Cohesion: 0.20
Nodes (10): adapterRefusal(), describe(), deviceLost(), loseWebGPUDevice(), probe(), startProbe(), timeout(), webgpuStatus() (+2 more)

### Community 42 - "purgeExpiredAccounts"
Cohesion: 0.24
Nodes (10): Akun 7 hari + cron pembersihan, applyAccountExpiry(), botStatus(), keepPermanentAccounts(), normalizeEmail(), permanentBots(), permanentEmails(), purgeExpiredAccounts() (+2 more)

### Community 43 - "redactPii"
Cohesion: 0.29
Nodes (8): Peringatan PII saat unggah, Cache jawaban semantik (pola GPTCache), Guardrail data pribadi (PII), findPii(), hasPii(), piiKeys(), redactPii(), logChat()

### Community 45 - "pick"
Cohesion: 0.22
Nodes (5): pick(), beam, ditherField, wgsl, wgsl

### Community 46 - "0004_accounts.sql"
Cohesion: 0.16
Nodes (14): bot_config, chunks, file, idx_chunks_idx, bots, idx_bots_owner, idx_chunks_bot_idx, idx_file_bot (+6 more)

### Community 47 - "params.ts"
Cohesion: 0.35
Nodes (14): boolean(), clamp(), fullParams(), integer(), mergeParams(), normalizeParams(), number(), parseParams() (+6 more)

### Community 48 - "start-worker.mjs"
Cohesion: 0.15
Nodes (11): args, child, chunks, doc(), future, past, [port, fakePort, password], q() (+3 more)

### Community 50 - "shaders/mesh.ts"
Cohesion: 0.40
Nodes (3): BLOBS, mesh, wgsl

### Community 53 - "pool.ts"
Cohesion: 0.11
Nodes (22): BackendLease, webglBackend, webgpuBackend, defaultParams, acquireContext(), changeListeners, contexts, create() (+14 more)

### Community 54 - "build-tsbot.mjs"
Cohesion: 0.17
Nodes (12): OUT, ROOT, OUT, SRC, bot, frames, OUT, ROOT (+4 more)

### Community 56 - "retrieve"
Cohesion: 0.40
Nodes (6): chunks_fts, Pemotong dokumen di browser, Hybrid search (vektor + BM25 + RRF), Gerbang skor sebelum AI, ftsQuery(), retrieve()

### Community 58 - "GradientKindDefinition"
Cohesion: 0.40
Nodes (3): GradientKindDefinition, aurora, wgsl

### Community 62 - "smalltalk.ts"
Cohesion: 0.40
Nodes (5): Lang, detectSmallTalk(), normalise(), PATTERNS, SmallTalkKind

### Community 70 - "loginKeys"
Cohesion: 0.20
Nodes (11): Audit keamanan 1–3, Kunci login per IP/email, dailyQuota(), ip(), loginKeys(), loginLocked(), loginWindow(), platformDailyTotal() (+3 more)

## Knowledge Gaps
- **11 isolated node(s):** `Device`, `Dashboard pemilik bot`, `Paket gratis Cloudflare Workers/D1/Vectorize`, `Gerbang skor sebelum AI`, `Peringatan PII saat unggah` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 376 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Batas yang diperiksa` connect `TanyaSayaChat` to `run`?**
  _High betweenness centrality (0.399) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `answer()` (e.g. with `paint()` and `Nara platform (chatbot dokumen)`) actually correct?**
  _`answer()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Device`, `Dashboard pemilik bot`, `Paket gratis Cloudflare Workers/D1/Vectorize` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08067226890756303 - nodes in this community are weakly interconnected._
- **Why does `run()` connect `run` to `TanyaSayaChat`, `pool.ts`, `scheduler.ts`?**
  _High betweenness centrality (0.397) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `mountGradient()` (e.g. with `.isLost()` and `.renderFrame()`) actually correct?**
  _`mountGradient()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `llm.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._