# Graph Report - MeetNaraBot  (2026-11-26)

## Corpus Check
- 135 files · ~136,040 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 8, .css 3, .example 1)

## Summary
- 1099 nodes · 2182 edges · 76 communities (59 shown, 17 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 80 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `750a63b3`
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
- run
- compilerOptions
- graph.yml
- GradientParams
- deploy
- Nara: catatan untuk Claude
- scheduler.ts
- guard.ts
- TSbot
- kind.ts
- GradientKindDefinition
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
- backend.ts
- channels.spec.ts
- keepPermanentAccounts
- gradient-engine/index.ts
- probeCopyPath
- kinds.ts
- smalltalk.ts
- Audit keamanan TSbot, run 2 (2026-11)
- start-worker.mjs
- WgpuEncoder
- shaders/mesh.ts
- shaders/radial-glow.ts
- WgpuPass
- src/types.ts
- build-tsbot.mjs
- answer_cache
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
- Audit keamanan run 5 (2026-11): TSbot, IMTS, dan akun permanen
- shaders/void.ts
- shaders/linear-flow.ts
- shaders/silk.ts
- shaders/waves.ts
- shaders/dither-field.ts
- file
- WgpuGpu
- shaders/smear.ts
- WgpuGpu

## God Nodes (most connected - your core abstractions)
1. `answer()` - 30 edges
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
- `Penguatan tahap 2` --references--> `sameIntent()`  [INFERRED]
  docs/security/audit-2026-11-run5.md → src/cache.ts
- `Temuan` --references--> `sameIntent()`  [INFERRED]
  docs/security/tsbot-audit-2026-11-run2.md → src/cache.ts
- `Batas yang diperiksa` --references--> `storeAnswer()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/cache.ts
- `Hasil` --references--> `clientKey()`  [INFERRED]
  docs/security/audit-2026-11-run5.md → src/net.ts
- `Isolasi data per bot` --implements--> `tenantEnv()`  [EXTRACTED]
  README.md → src/settings.ts

## Import Cycles
- None detected.

## Communities (76 total, 17 thin omitted)

### Community 0 - "src/index.ts"
Cohesion: 0.08
Nodes (22): Dashboard pemilik bot, app, benv(), dailyQuota(), Env, FileRow, hits, ip() (+14 more)

### Community 1 - "settings.ts"
Cohesion: 0.07
Nodes (49): settings, Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom() (+41 more)

### Community 2 - "channels.ts"
Cohesion: 0.09
Nodes (41): channel_history, channel_seen, idx_channel_history_updated, bodyTooLarge(), channelCommand(), citedSources(), clip(), clipHtml() (+33 more)

### Community 3 - "rag.ts"
Cohesion: 0.14
Nodes (23): injectionReply(), answer(), AnswerInput, buildSystemPrompt(), buildUserTurn(), Candidate, ChunkRow, excerptFallback() (+15 more)

### Community 4 - "TanyaSayaChat"
Cohesion: 0.12
Nodes (11): Audit keamanan TSbot (2026-11), Batas yang diperiksa, Hasil, Landing page + widget demo, esc(), inkFor(), inline(), markdown() (+3 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, esbuild@0.28.2, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0 (+12 more)

### Community 6 - "gradient-engine/index.ts"
Cohesion: 0.24
Nodes (13): grainFrame(), LIVE_FPS, LOOP_RADIUS, loopPhase(), loopVector(), loopVectorAtPhase(), splitTiles(), videoFrameTimes() (+5 more)

### Community 7 - "steps"
Cohesion: 0.07
Nodes (26): CI, jobs, qa, name, on, pull_request, push, workflow_call (+18 more)

### Community 8 - "steps"
Cohesion: 0.06
Nodes (35): concurrency, cancel-in-progress, group, env, needs, runs-on, steps, CLOUDFLARE_ACCOUNT_ID (+27 more)

### Community 9 - "env"
Cohesion: 0.08
Nodes (25): ADMIN_PASSWORD, CF_WORKERS_AI_KEY, COHERE_API_KEY, DEEPSEEK_API_KEY, DEPLOY_TOKEN, FIREWORKS_API_KEY, GEMINI_API_KEY, HF_TOKEN (+17 more)

### Community 10 - "cache.ts"
Cohesion: 0.17
Nodes (21): Cache jawaban semantik (pola GPTCache), CACHE_TTL_DAYS, CacheHit, cacheScope(), cacheStats(), clearCache(), cosineInt8(), lookupExact() (+13 more)

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
Cohesion: 0.10
Nodes (18): Dokumen referensi bot demo Nara, Prompt 7 layer untuk membangun ulang proyek, Pemotong dokumen di browser, Paket gratis Cloudflare Workers/D1/Vectorize, Nara platform (chatbot dokumen), Prompt 7 layer (strict grounding), [base, file, ...flags], chunks (+10 more)

### Community 15 - "auth.ts"
Cohesion: 0.12
Nodes (27): Isolasi data per bot, ACCOUNT_DAYS, BotRow, changePassword(), createSession(), createUser(), daysFromNow(), DEFAULT_BOT (+19 more)

### Community 16 - "run"
Cohesion: 0.18
Nodes (11): BackendName, liveContextCount(), assignQuality(), ContextSlot, contextStats(), distanceToViewport(), groupScales(), noteScroll() (+3 more)

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 19 - "GradientParams"
Cohesion: 0.18
Nodes (5): packUniforms(), removeSurface(), WebGPULease, WgpuBuffer, WgpuPipeline

### Community 20 - "deploy"
Cohesion: 0.22
Nodes (9): env, needs, runs-on, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, jobs, deploy, qa (+1 more)

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.25
Nodes (6): Gradien Mercury (gradients.sh), Kerja UI dan teks: DESIGN.md + antislop, Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "scheduler.ts"
Cohesion: 0.14
Nodes (28): mountGradient(), onLost(), MountOptions, EngineStats, FrameQuality, GRAIN_CRISP, judgePace(), listen() (+20 more)

### Community 24 - "guard.ts"
Cohesion: 0.13
Nodes (24): Peringatan PII saat unggah, Guardrail prompt injection, Guardrail data pribadi (PII), Riwayat bertanda tangan HMAC, b64url(), detectInjection(), digits(), enc (+16 more)

### Community 25 - "TSbot"
Cohesion: 0.40
Nodes (4): Build dan uji lokal, Halaman IMTS (https://imtsbot.pages.dev), Pengaturan sekali, TSbot

### Community 26 - "kind.ts"
Cohesion: 0.16
Nodes (7): stops(), ditherBurst, fluted, spectrum, wgsl, wgsl, wgsl

### Community 27 - "GradientKindDefinition"
Cohesion: 0.22
Nodes (5): GradientKindDefinition, horizon, pixelGlass, wgsl, wgsl

### Community 28 - "renderer.ts"
Cohesion: 0.29
Nodes (7): chat_log, chunks_fts, idx_chat_log_created, usage, idx_chat_log_bot, logChat(), spendPlatform()

### Community 29 - "webgpu-device.ts"
Cohesion: 0.10
Nodes (20): adapterRefusal(), describe(), deviceLost(), isWgpuGpu(), loseWebGPUDevice(), navigatorGpu(), pipelines, probe() (+12 more)

### Community 30 - "export.ts"
Cohesion: 0.14
Nodes (27): FALLBACK_RGB, getProbe(), hasCssVariable(), linearToSrgb(), literalCache, Oklab, oklabToSrgb(), parseChannel() (+19 more)

### Community 31 - "webgpu.ts"
Cohesion: 0.13
Nodes (17): BackendPreference, changeListeners, setWebGPUMemoryCap(), hasWebGPU(), isPreference(), load(), MAX_WEBGPU_SURFACES, notifyWebGPUChange() (+9 more)

### Community 32 - "0004_accounts.sql"
Cohesion: 0.16
Nodes (13): Audit keamanan run 4 (2026-11), Batas yang diperiksa, Hasil, vector_tombstones, Akun 7 hari + cron pembersihan, listBots(), purgeExpiredCache(), deleteVectors() (+5 more)

### Community 33 - "probeCopyPath"
Cohesion: 0.13
Nodes (15): ExportRenderer, fullTarget(), compile(), ContextOptions, createWebGLRenderer(), isOffscreen(), ProgramInfo, ShaderError (+7 more)

### Community 34 - "reseed"
Cohesion: 0.22
Nodes (9): reseed, on, push, workflow_dispatch, branches, default, description, type (+1 more)

### Community 35 - "pick"
Cohesion: 0.44
Nodes (11): boolean(), clamp(), fullParams(), integer(), number(), parseParams(), partialDither(), partialInteraction() (+3 more)

### Community 36 - "steps"
Cohesion: 0.22
Nodes (9): steps, id, name, run, uses, with, cache, node-version (+1 more)

### Community 37 - "grounding.ts"
Cohesion: 0.19
Nodes (9): Uji coba + panel X-ray, Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, checkCitations(), CitationCheck, detectDocLang(), EN_WORDS, ID_WORDS (+1 more)

### Community 38 - "WgpuDevice"
Cohesion: 0.17
Nodes (4): wgslPostlude, wgslPrelude, compile(), WgpuDevice

### Community 39 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 40 - "backend.ts"
Cohesion: 0.09
Nodes (25): backendFor(), BackendLease, GradientBackend, webglBackend, webgpuBackend, defaultParams, acquireContext(), changeListeners (+17 more)

### Community 41 - "channels.spec.ts"
Cohesion: 0.16
Nodes (7): FAKE_API_PORT, Call, startFakeChatApi(), fake, TG_SECRET, admin, fake

### Community 42 - "keepPermanentAccounts"
Cohesion: 0.22
Nodes (11): Audit keamanan 1–3, Kunci login per IP/email, botStatus(), constantTimeEqualHex(), fromHex(), keepPermanentAccounts(), ownsPermanentBot(), permanentBots() (+3 more)

### Community 43 - "gradient-engine/index.ts"
Cohesion: 0.16
Nodes (16): ExportLimits, grainLayer(), staticFallbackCss(), getKind(), kindDefaults(), MountedGradient, mergeParams(), normalizeParams() (+8 more)

### Community 44 - "probeCopyPath"
Cohesion: 0.24
Nodes (8): acquireSurface(), fail(), isWgpuContext(), leasedBytes(), probeCopyPath(), webgpuContext(), webgpuStats(), WgpuCanvasContext

### Community 45 - "kinds.ts"
Cohesion: 0.20
Nodes (7): listKinds(), registerKind(), registry, beam, swirl, wgsl, wgsl

### Community 46 - "smalltalk.ts"
Cohesion: 0.16
Nodes (14): bot_config, chunks, file, idx_chunks_idx, bots, idx_bots_owner, idx_chunks_bot_idx, idx_file_bot (+6 more)

### Community 47 - "Audit keamanan TSbot, run 2 (2026-11)"
Cohesion: 0.29
Nodes (6): Audit keamanan TSbot, run 2 (2026-11), Bukti, Catatan alat, Pengerasan dan bug lain yang ikut diperbaiki, Temuan, normalizeHistory()

### Community 48 - "start-worker.mjs"
Cohesion: 0.15
Nodes (11): args, child, chunks, doc(), future, past, [port, fakePort, password], q() (+3 more)

### Community 50 - "shaders/mesh.ts"
Cohesion: 0.40
Nodes (3): BLOBS, mesh, wgsl

### Community 53 - "src/types.ts"
Cohesion: 0.29
Nodes (6): User, AppEnv, ChatEvent, ChatMessage, Principal, Source

### Community 54 - "build-tsbot.mjs"
Cohesion: 0.23
Nodes (10): OUT, SRC, bot, frames, OUT, ROOT, SRC, fail() (+2 more)

### Community 55 - "answer_cache"
Cohesion: 0.83
Nodes (3): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent

### Community 56 - "playwright.config.ts"
Cohesion: 0.19
Nodes (6): IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test, MANUAL

### Community 57 - "build-imts.mjs"
Cohesion: 0.18
Nodes (4): OUT, ROOT, [tsPort, apiPort, imtsPort, otherPort], TYPES

### Community 58 - "GradientKindDefinition"
Cohesion: 0.22
Nodes (5): pick(), aurora, chrome, wgsl, wgsl

### Community 60 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build:gradient, db:migrate, deploy, dev, dev:mock, qa, test:e2e (+2 more)

### Community 62 - "answer_cache"
Cohesion: 0.50
Nodes (5): chunks_fts, Hybrid search (vektor + BM25 + RRF), Gerbang skor sebelum AI, ftsQuery(), retrieve()

### Community 66 - "Audit keamanan run 5 (2026-11): TSbot, IMTS, dan akun permanen"
Cohesion: 0.20
Nodes (9): Audit keamanan run 5 (2026-11): TSbot, IMTS, dan akun permanen, Catatan yang tetap berlaku, Hasil, Penguatan tahap 2, Penguatan yang diterapkan (bukan temuan), Pengujian, clientKey(), expandIpv6() (+1 more)

### Community 72 - "file"
Cohesion: 0.40
Nodes (5): Tambahan: banyak dokumen per bot dan penyedia OpenAI, activeFile(), documentsLabel(), listFiles(), processingFile()

## Knowledge Gaps
- **11 isolated node(s):** `Device`, `Dashboard pemilik bot`, `Audit keamanan 1–3`, `DEPLOY_TOKEN satu kali pakai`, `Paket gratis Cloudflare Workers/D1/Vectorize` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 394 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Batas yang diperiksa` connect `TanyaSayaChat` to `run`?**
  _High betweenness centrality (0.363) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `answer()` (e.g. with `Temuan` and `paint()`) actually correct?**
  _`answer()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Device`, `Dashboard pemilik bot`, `Audit keamanan 1–3` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Why does `run()` connect `run` to `backend.ts`, `TanyaSayaChat`, `webgpu.ts`, `scheduler.ts`?**
  _High betweenness centrality (0.361) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `mountGradient()` (e.g. with `.isLost()` and `.renderFrame()`) actually correct?**
  _`mountGradient()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._