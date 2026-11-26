# Graph Report - MeetNaraBot  (2026-11-26)

## Corpus Check
- 131 files · ~132,338 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 8, .css 3, .example 1)

## Summary
- 1081 nodes · 2163 edges · 74 communities (57 shown, 17 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 77 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c429cf3e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- src/index.ts
- settings.ts
- channels.ts
- rag.ts
- TanyaSayaChat
- package.json
- gradient-engine/index.ts
- steps
- steps
- env
- cache.ts
- dev-server.mjs
- deploy.yml
- Nara · Mercury
- seed-document.mjs
- auth.ts
- Prompt 7 layer (strict grounding)
- compilerOptions
- graph.yml
- GradientParams
- deploy
- Nara: catatan untuk Claude
- scheduler.ts
- guard.ts
- TSbot
- kind.ts
- kinds.ts
- renderer.ts
- webgpu-device.ts
- export.ts
- webgpu.ts
- 0004_accounts.sql
- probeCopyPath
- reseed
- pick
- steps
- grounding.ts
- WgpuDevice
- compilerOptions
- run
- channels.spec.ts
- getSettings
- params.ts
- shaders/horizon.ts
- src/types.ts
- smalltalk.ts
- Audit keamanan TSbot, run 2 (2026-11)
- start-worker.mjs
- WgpuEncoder
- shaders/mesh.ts
- shaders/radial-glow.ts
- WgpuPass
- backend.ts
- build-tsbot.mjs
- retrieve
- playwright.config.ts
- build-imts.mjs
- GradientKindDefinition
- shaders/grain.ts
- scripts
- shaders/limb.ts
- answer_cache
- shaders/mist.ts
- shaders/ribbon.ts
- shaders/halo.ts
- shaders/rise.ts
- shaders/void.ts
- shaders/linear-flow.ts
- shaders/silk.ts
- shaders/waves.ts
- shaders/spectrum.ts
- file
- WgpuGpu

## God Nodes (most connected - your core abstractions)
1. `answer()` - 31 edges
2. `GradientKindDefinition` - 27 edges
3. `env` - 24 edges
4. `mountGradient()` - 24 edges
5. `TanyaSayaChat` - 22 edges
6. `GradientParams` - 19 edges
7. `pick()` - 17 edges
8. `normalizeParams()` - 17 edges
9. `WebGPULease` - 17 edges
10. `createWebGLRenderer()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Batas yang diperiksa` --references--> `storeAnswer()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/cache.ts
- `Batas yang diperiksa` --references--> `checkCitations()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/grounding.ts
- `Batas yang diperiksa` --references--> `normalizeHistory()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/rag.ts
- `Nara platform (chatbot dokumen)` --references--> `answer()`  [INFERRED]
  README.md → src/rag.ts
- `Batas yang diperiksa` --references--> `run()`  [INFERRED]
  docs/security/tsbot-audit-2026-11.md → web/gradients/gradient-engine/scheduler.ts

## Import Cycles
- None detected.

## Communities (74 total, 17 thin omitted)

### Community 0 - "src/index.ts"
Cohesion: 0.07
Nodes (30): usage, Dashboard pemilik bot, Isolasi data per bot, ownedBot(), app, benv(), dailyQuota(), Env (+22 more)

### Community 1 - "settings.ts"
Cohesion: 0.09
Nodes (37): Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom(), embed() (+29 more)

### Community 2 - "channels.ts"
Cohesion: 0.09
Nodes (42): channel_history, channel_seen, idx_channel_history_updated, bodyTooLarge(), channelCommand(), citedSources(), clip(), clipHtml() (+34 more)

### Community 3 - "rag.ts"
Cohesion: 0.13
Nodes (23): Temuan, paint(), Guardrail prompt injection, detectInjection(), hasPii(), injectionReply(), stripInvisible(), answer() (+15 more)

### Community 4 - "TanyaSayaChat"
Cohesion: 0.13
Nodes (10): Audit keamanan TSbot (2026-11), Batas yang diperiksa, Hasil, Landing page + widget demo, esc(), inkFor(), inline(), markdown() (+2 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, esbuild@0.28.2, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0 (+12 more)

### Community 6 - "gradient-engine/index.ts"
Cohesion: 0.16
Nodes (21): ExportLimits, grainLayer(), staticFallbackCss(), getKind(), kindDefaults(), listKinds(), registerKind(), grainFrame() (+13 more)

### Community 7 - "steps"
Cohesion: 0.08
Nodes (25): CI, jobs, qa, name, on, pull_request, push, workflow_call (+17 more)

### Community 8 - "steps"
Cohesion: 0.06
Nodes (33): concurrency, cancel-in-progress, group, env, needs, runs-on, steps, CLOUDFLARE_ACCOUNT_ID (+25 more)

### Community 9 - "env"
Cohesion: 0.08
Nodes (24): ADMIN_PASSWORD, CF_WORKERS_AI_KEY, COHERE_API_KEY, DEEPSEEK_API_KEY, DEPLOY_TOKEN, FIREWORKS_API_KEY, GEMINI_API_KEY, HF_TOKEN (+16 more)

### Community 10 - "cache.ts"
Cohesion: 0.17
Nodes (20): Cache jawaban semantik (pola GPTCache), CACHE_TTL_DAYS, CacheHit, cacheScope(), cacheStats(), clearCache(), cosineInt8(), lookupExact() (+12 more)

### Community 11 - "dev-server.mjs"
Cohesion: 0.11
Nodes (17): agg(), bots, buildSystem(), DEFAULTS, docsLabel(), info(), LAYERS, platform (+9 more)

### Community 12 - "deploy.yml"
Cohesion: 0.22
Nodes (8): concurrency, cancel-in-progress, group, name, permissions, contents, Deploy otomatis GitHub Actions, DEPLOY_TOKEN satu kali pakai

### Community 13 - "Nara · Mercury"
Cohesion: 0.20
Nodes (9): Colors, Components, Do's and Don'ts, Elevation & Depth, Layout, Nara · Mercury, Overview, Shapes (+1 more)

### Community 14 - "seed-document.mjs"
Cohesion: 0.12
Nodes (15): Dokumen referensi bot demo Nara, Pemotong dokumen di browser, Paket gratis Cloudflare Workers/D1/Vectorize, Nara platform (chatbot dokumen), [base, file, ...flags], chunks, chunkSection(), force (+7 more)

### Community 15 - "auth.ts"
Cohesion: 0.10
Nodes (34): Audit keamanan 1–3, Kunci login per IP/email, ACCOUNT_DAYS, BotRow, botStatus(), changePassword(), constantTimeEqualHex(), createSession() (+26 more)

### Community 16 - "Prompt 7 layer (strict grounding)"
Cohesion: 0.67
Nodes (3): Prompt 7 layer untuk membangun ulang proyek, Prompt 7 layer (strict grounding), DEFAULT_LAYERS

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 19 - "GradientParams"
Cohesion: 0.15
Nodes (7): Oklab, GradientParams, packUniforms(), removeSurface(), WebGPULease, WgpuBuffer, WgpuPipeline

### Community 20 - "deploy"
Cohesion: 0.22
Nodes (9): env, needs, runs-on, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, jobs, deploy, qa (+1 more)

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.18
Nodes (7): Gradien Mercury (gradients.sh), Kerja UI dan teks: DESIGN.md + antislop, Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan, MountedGradient

### Community 23 - "scheduler.ts"
Cohesion: 0.11
Nodes (33): LIVE_FPS, mountGradient(), onLost(), MountOptions, EngineStats, FrameQuality, GRAIN_CRISP, judgePace() (+25 more)

### Community 24 - "guard.ts"
Cohesion: 0.14
Nodes (21): Peringatan PII saat unggah, Guardrail data pribadi (PII), Riwayat bertanda tangan HMAC, b64url(), digits(), enc, findPii(), hmacKey() (+13 more)

### Community 25 - "TSbot"
Cohesion: 0.40
Nodes (4): Build dan uji lokal, Halaman IMTS (https://imtsbot.pages.dev), Pengaturan sekali, TSbot

### Community 26 - "kind.ts"
Cohesion: 0.16
Nodes (7): stops(), ditherBurst, fluted, swirl, wgsl, wgsl, wgsl

### Community 27 - "kinds.ts"
Cohesion: 0.18
Nodes (7): registry, chrome, pixelGlass, smear, wgsl, wgsl, wgsl

### Community 28 - "renderer.ts"
Cohesion: 0.13
Nodes (15): ExportRenderer, fullTarget(), compile(), ContextOptions, createWebGLRenderer(), isOffscreen(), ProgramInfo, ShaderError (+7 more)

### Community 29 - "webgpu-device.ts"
Cohesion: 0.10
Nodes (20): adapterRefusal(), describe(), deviceLost(), isWgpuGpu(), loseWebGPUDevice(), navigatorGpu(), pipelines, probe() (+12 more)

### Community 30 - "export.ts"
Cohesion: 0.15
Nodes (25): FALLBACK_RGB, getProbe(), hasCssVariable(), linearToSrgb(), literalCache, oklabToSrgb(), parseChannel(), parseColorLiteral() (+17 more)

### Community 31 - "webgpu.ts"
Cohesion: 0.13
Nodes (17): backendFor(), BackendPreference, changeListeners, setWebGPUMemoryCap(), hasWebGPU(), isPreference(), load(), MAX_WEBGPU_SURFACES (+9 more)

### Community 32 - "0004_accounts.sql"
Cohesion: 0.09
Nodes (29): Audit keamanan run 4 (2026-11), Batas yang diperiksa, Hasil, chunks, chat_log, chunks_fts, idx_chat_log_created, idx_chunks_idx (+21 more)

### Community 33 - "probeCopyPath"
Cohesion: 0.24
Nodes (8): acquireSurface(), fail(), isWgpuContext(), leasedBytes(), probeCopyPath(), webgpuContext(), webgpuStats(), WgpuCanvasContext

### Community 34 - "reseed"
Cohesion: 0.22
Nodes (9): reseed, on, push, workflow_dispatch, branches, default, description, type (+1 more)

### Community 35 - "pick"
Cohesion: 0.22
Nodes (5): pick(), beam, ditherField, wgsl, wgsl

### Community 36 - "steps"
Cohesion: 0.25
Nodes (8): steps, id, name, run, uses, with, cache, node-version

### Community 37 - "grounding.ts"
Cohesion: 0.19
Nodes (9): Uji coba + panel X-ray, Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, checkCitations(), CitationCheck, detectDocLang(), EN_WORDS, ID_WORDS (+1 more)

### Community 38 - "WgpuDevice"
Cohesion: 0.17
Nodes (4): wgslPostlude, wgslPrelude, compile(), WgpuDevice

### Community 39 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 40 - "run"
Cohesion: 0.17
Nodes (12): BackendName, liveContextCount(), assignQuality(), ContextSlot, contextStats(), distanceToViewport(), groupScales(), noteScroll() (+4 more)

### Community 41 - "channels.spec.ts"
Cohesion: 0.16
Nodes (7): FAKE_API_PORT, Call, startFakeChatApi(), fake, TG_SECRET, admin, fake

### Community 42 - "getSettings"
Cohesion: 0.27
Nodes (10): settings, asLang(), clamp(), envDefaults(), fromLegacy(), getSettings(), normalizeSettings(), readSetting() (+2 more)

### Community 43 - "params.ts"
Cohesion: 0.35
Nodes (14): boolean(), clamp(), fullParams(), integer(), mergeParams(), normalizeParams(), number(), parseParams() (+6 more)

### Community 45 - "src/types.ts"
Cohesion: 0.29
Nodes (6): User, AppEnv, ChatEvent, ChatMessage, Principal, Source

### Community 46 - "smalltalk.ts"
Cohesion: 0.33
Nodes (6): Lang, detectSmallTalk(), normalise(), PATTERNS, SmallTalkKind, smallTalkReply()

### Community 47 - "Audit keamanan TSbot, run 2 (2026-11)"
Cohesion: 0.40
Nodes (4): Audit keamanan TSbot, run 2 (2026-11), Bukti, Catatan alat, Pengerasan dan bug lain yang ikut diperbaiki

### Community 48 - "start-worker.mjs"
Cohesion: 0.15
Nodes (11): args, child, chunks, doc(), future, past, [port, fakePort, password], q() (+3 more)

### Community 50 - "shaders/mesh.ts"
Cohesion: 0.40
Nodes (3): BLOBS, mesh, wgsl

### Community 53 - "backend.ts"
Cohesion: 0.09
Nodes (25): BackendLease, GradientBackend, webglBackend, webgpuBackend, defaultParams, acquireContext(), changeListeners, contexts (+17 more)

### Community 54 - "build-tsbot.mjs"
Cohesion: 0.29
Nodes (8): bot, frames, OUT, ROOT, SRC, fail(), LOOPBACK, toOrigin()

### Community 55 - "retrieve"
Cohesion: 0.50
Nodes (5): chunks_fts, Hybrid search (vektor + BM25 + RRF), Gerbang skor sebelum AI, ftsQuery(), retrieve()

### Community 56 - "playwright.config.ts"
Cohesion: 0.21
Nodes (6): IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test, MANUAL

### Community 57 - "build-imts.mjs"
Cohesion: 0.16
Nodes (6): OUT, ROOT, OUT, SRC, [tsPort, apiPort, imtsPort, otherPort], TYPES

### Community 58 - "GradientKindDefinition"
Cohesion: 0.40
Nodes (3): GradientKindDefinition, aurora, wgsl

### Community 60 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build:gradient, db:migrate, deploy, dev, dev:mock, qa, test:e2e (+2 more)

### Community 62 - "answer_cache"
Cohesion: 0.83
Nodes (3): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent

### Community 72 - "file"
Cohesion: 0.22
Nodes (8): Tambahan: banyak dokumen per bot dan penyedia OpenAI, bot_config, file, idx_file_bot, activeFile(), documentsLabel(), listFiles(), processingFile()

## Knowledge Gaps
- **11 isolated node(s):** `Device`, `Dashboard pemilik bot`, `Audit keamanan 1–3`, `Peringatan PII saat unggah`, `DEPLOY_TOKEN satu kali pakai` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 383 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Batas yang diperiksa` connect `TanyaSayaChat` to `run`?**
  _High betweenness centrality (0.370) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `answer()` (e.g. with `Temuan` and `paint()`) actually correct?**
  _`answer()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Device`, `Dashboard pemilik bot`, `Audit keamanan 1–3` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07435897435897436 - nodes in this community are weakly interconnected._
- **Why does `run()` connect `run` to `TanyaSayaChat`, `backend.ts`, `scheduler.ts`?**
  _High betweenness centrality (0.369) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `mountGradient()` (e.g. with `.isLost()` and `.renderFrame()`) actually correct?**
  _`mountGradient()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._