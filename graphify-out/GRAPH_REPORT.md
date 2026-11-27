# Graph Report - MeetNaraBot  (2026-11-27)

## Corpus Check
- 140 files · ~139,603 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 8, .css 3, .example 1)

## Summary
- 1144 nodes · 2267 edges · 78 communities (59 shown, 19 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 81 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d80fd17f`
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
- ref_node_fs
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
- chunks
- gradient-engine/index.ts
- probeCopyPath
- kinds.ts
- warm
- Audit keamanan TSbot, run 2 (2026-11)
- start-worker.mjs
- WgpuEncoder
- uniforms.ts
- shaders/radial-glow.ts
- WgpuPass
- 0004_accounts.sql
- build-tsbot.mjs
- retrieve
- playwright.config.ts
- build-imts.mjs
- GradientKindDefinition
- shaders/grain.ts
- scripts
- shaders/limb.ts
- clientKey
- shaders/mist.ts
- shaders/ribbon.ts
- shaders/halo.ts
- ref_node_fs
- shaders/void.ts
- shaders/linear-flow.ts
- shaders/silk.ts
- shaders/waves.ts
- shaders/dither-field.ts
- backend.ts
- WgpuGpu
- shaders/smear.ts
- WgpuGpu
- shaders/mesh.ts
- answer_cache

## God Nodes (most connected - your core abstractions)
1. `answer()` - 31 edges
2. `GradientKindDefinition` - 27 edges
3. `env` - 25 edges
4. `TanyaSayaChat` - 24 edges
5. `mountGradient()` - 24 edges
6. `GradientParams` - 19 edges
7. `WebGPULease` - 17 edges
8. `normalizeParams()` - 17 edges
9. `pick()` - 17 edges
10. `createWebGLRenderer()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Hasil` --references--> `clientKey()`  [INFERRED]
  docs/security/audit-2026-11-run5.md → src/net.ts
- `Penguatan tahap 2` --references--> `sameIntent()`  [INFERRED]
  docs/security/audit-2026-11-run5.md → src/cache.ts
- `Temuan` --references--> `sameIntent()`  [INFERRED]
  docs/security/tsbot-audit-2026-11-run2.md → src/cache.ts
- `Batas yang diperiksa` --references--> `storeAnswer()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/cache.ts
- `Kunci login per IP/email` --implements--> `verifyLogin()`  [INFERRED]
  SECURITY.md → src/auth.ts

## Import Cycles
- None detected.

## Communities (78 total, 19 thin omitted)

### Community 0 - "src/index.ts"
Cohesion: 0.07
Nodes (30): Dashboard pemilik bot, Isolasi data per bot, Audit keamanan 1–3, Kunci login per IP/email, ownedBot(), app, benv(), dailyQuota() (+22 more)

### Community 1 - "settings.ts"
Cohesion: 0.06
Nodes (50): Audit keamanan run 5 (2026-11): TSbot, IMTS, dan akun permanen, Catatan yang tetap berlaku, Hasil, Penguatan tahap 2, Penguatan yang diterapkan (bukan temuan), Pengujian, Rantai penyedia LLM + failover, AllProvidersFailed (+42 more)

### Community 2 - "channels.ts"
Cohesion: 0.08
Nodes (46): settings, channel_history, channel_seen, idx_channel_history_updated, hono, bodyTooLarge(), channelCommand(), citedSources() (+38 more)

### Community 3 - "rag.ts"
Cohesion: 0.14
Nodes (23): Temuan, paint(), Guardrail prompt injection, detectInjection(), hasPii(), injectionReply(), stripInvisible(), answer() (+15 more)

### Community 4 - "TanyaSayaChat"
Cohesion: 0.13
Nodes (11): Audit keamanan TSbot (2026-11), Batas yang diperiksa, Hasil, Landing page + widget demo, esc(), inkFor(), inline(), markdown() (+3 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (19): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, esbuild@0.28.2, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0 (+11 more)

### Community 6 - "gradient-engine/index.ts"
Cohesion: 0.14
Nodes (23): backendFor(), ExportLimits, grainLayer(), staticFallbackCss(), getKind(), kindDefaults(), fullTarget(), LIVE_FPS (+15 more)

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
Cohesion: 0.14
Nodes (21): Cache jawaban semantik (pola GPTCache), CACHE_TTL_DAYS, CacheHit, cacheScope(), cacheStats(), clearCache(), cosineInt8(), lookupExact() (+13 more)

### Community 11 - "dev-server.mjs"
Cohesion: 0.09
Nodes (23): agg(), bots, buildSystem(), DEFAULTS, docsLabel(), info(), LAYERS, platform (+15 more)

### Community 12 - "deploy.yml"
Cohesion: 0.22
Nodes (8): concurrency, cancel-in-progress, group, name, permissions, contents, Deploy otomatis GitHub Actions, DEPLOY_TOKEN satu kali pakai

### Community 13 - "Nara · Mercury"
Cohesion: 0.20
Nodes (9): Colors, Components, Do's and Don'ts, Elevation & Depth, Layout, Nara · Mercury, Overview, Shapes (+1 more)

### Community 14 - "seed-document.mjs"
Cohesion: 0.14
Nodes (12): Pemotong dokumen di browser, [base, file, ...flags], chunks, chunkSection(), force, headers, md, name (+4 more)

### Community 15 - "auth.ts"
Cohesion: 0.11
Nodes (32): ACCOUNT_DAYS, BotRow, botStatus(), changePassword(), constantTimeEqualHex(), createSession(), createUser(), daysFromNow() (+24 more)

### Community 16 - "ref_node_fs"
Cohesion: 0.29
Nodes (4): OUT, ROOT, OUT, SRC

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
Cohesion: 0.08
Nodes (36): liveContextCount(), assignQuality(), ContextSlot, contextStats(), distanceToViewport(), EngineStats, FrameQuality, GRAIN_CRISP (+28 more)

### Community 24 - "guard.ts"
Cohesion: 0.11
Nodes (27): Peringatan PII saat unggah, Guardrail data pribadi (PII), Riwayat bertanda tangan HMAC, User, b64url(), digits(), enc, findPii() (+19 more)

### Community 25 - "TSbot"
Cohesion: 0.29
Nodes (6): Build dan uji lokal, Halaman IMTS (https://imtsbot.pages.dev), Kecepatan jawaban menu, Pengaturan sekali, Tampilan dan menu kategori, TSbot

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
Nodes (16): BackendPreference, changeListeners, setWebGPUMemoryCap(), hasWebGPU(), isPreference(), load(), MAX_WEBGPU_SURFACES, notifyWebGPUChange() (+8 more)

### Community 32 - "0004_accounts.sql"
Cohesion: 0.16
Nodes (13): Audit keamanan run 4 (2026-11), Batas yang diperiksa, Hasil, vector_tombstones, Akun 7 hari + cron pembersihan, listBots(), purgeExpiredCache(), deleteVectors() (+5 more)

### Community 33 - "probeCopyPath"
Cohesion: 0.13
Nodes (15): ExportRenderer, mergeParams(), compile(), ContextOptions, createWebGLRenderer(), isOffscreen(), ProgramInfo, ShaderError (+7 more)

### Community 34 - "reseed"
Cohesion: 0.22
Nodes (9): reseed, on, push, workflow_dispatch, branches, default, description, type (+1 more)

### Community 35 - "pick"
Cohesion: 0.38
Nodes (13): boolean(), clamp(), fullParams(), integer(), normalizeParams(), number(), parseParams(), partialDither() (+5 more)

### Community 36 - "steps"
Cohesion: 0.22
Nodes (9): steps, id, name, run, uses, with, cache, node-version (+1 more)

### Community 37 - "grounding.ts"
Cohesion: 0.22
Nodes (9): Uji coba + panel X-ray, Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, checkCitations(), CitationCheck, detectDocLang(), EN_WORDS, ID_WORDS (+1 more)

### Community 38 - "WgpuDevice"
Cohesion: 0.17
Nodes (4): wgslPostlude, wgslPrelude, compile(), WgpuDevice

### Community 39 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 40 - "backend.ts"
Cohesion: 0.22
Nodes (11): defaultParams, acquireContext(), changeListeners, contexts, create(), createCanvas(), destroy(), MAX_LIVE_CONTEXTS (+3 more)

### Community 41 - "channels.spec.ts"
Cohesion: 0.16
Nodes (7): FAKE_API_PORT, Call, startFakeChatApi(), fake, TG_SECRET, admin, fake

### Community 42 - "chunks"
Cohesion: 0.14
Nodes (12): Tambahan: banyak dokumen per bot dan penyedia OpenAI, bot_config, chunks, file, idx_chunks_idx, idx_chunks_bot_idx, idx_file_bot, idx_chunks_file_idx (+4 more)

### Community 43 - "gradient-engine/index.ts"
Cohesion: 0.33
Nodes (6): Dokumen referensi bot demo Nara, Prompt 7 layer untuk membangun ulang proyek, Paket gratis Cloudflare Workers/D1/Vectorize, Nara platform (chatbot dokumen), Prompt 7 layer (strict grounding), DEFAULT_LAYERS

### Community 44 - "probeCopyPath"
Cohesion: 0.24
Nodes (8): acquireSurface(), fail(), isWgpuContext(), leasedBytes(), probeCopyPath(), webgpuContext(), webgpuStats(), WgpuCanvasContext

### Community 45 - "kinds.ts"
Cohesion: 0.20
Nodes (7): listKinds(), registerKind(), registry, beam, swirl, wgsl, wgsl

### Community 46 - "warm"
Cohesion: 0.07
Nodes (28): concurrency, cancel-in-progress, group, NARA_API_URL, NARA_BOT_ID, jobs, warm, name (+20 more)

### Community 47 - "Audit keamanan TSbot, run 2 (2026-11)"
Cohesion: 0.40
Nodes (4): Audit keamanan TSbot, run 2 (2026-11), Bukti, Catatan alat, Pengerasan dan bug lain yang ikut diperbaiki

### Community 48 - "start-worker.mjs"
Cohesion: 0.15
Nodes (11): args, child, chunks, doc(), future, past, [port, fakePort, password], q() (+3 more)

### Community 50 - "uniforms.ts"
Cohesion: 0.62
Nodes (6): grainFrame(), loopVector(), loopVectorAtPhase(), FrameUniforms, frameUniforms(), seedOffset()

### Community 53 - "0004_accounts.sql"
Cohesion: 0.36
Nodes (8): bots, idx_bots_owner, idx_sessions_user, idx_users_expires, sessions, users, createBot(), sessionUser()

### Community 54 - "build-tsbot.mjs"
Cohesion: 0.23
Nodes (11): bot, frames, menu, menuJson, OUT, ROOT, SRC, checkMenu() (+3 more)

### Community 55 - "retrieve"
Cohesion: 0.50
Nodes (5): chunks_fts, Hybrid search (vektor + BM25 + RRF), Gerbang skor sebelum AI, ftsQuery(), retrieve()

### Community 56 - "playwright.config.ts"
Cohesion: 0.23
Nodes (6): IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test, MENU

### Community 58 - "GradientKindDefinition"
Cohesion: 0.22
Nodes (5): pick(), aurora, chrome, wgsl, wgsl

### Community 60 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build:gradient, db:migrate, deploy, dev, dev:mock, qa, test:e2e (+2 more)

### Community 66 - "ref_node_fs"
Cohesion: 0.29
Nodes (4): menuQuestions(), readAnswer(), warm(), Call

### Community 72 - "backend.ts"
Cohesion: 0.12
Nodes (16): BackendLease, BackendName, GradientBackend, webglBackend, webgpuBackend, PooledContext, releaseContext(), webglUnsupported() (+8 more)

### Community 76 - "shaders/mesh.ts"
Cohesion: 0.40
Nodes (3): BLOBS, mesh, wgsl

### Community 77 - "answer_cache"
Cohesion: 0.83
Nodes (3): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent

## Knowledge Gaps
- **11 isolated node(s):** `Device`, `Dashboard pemilik bot`, `Audit keamanan 1–3`, `DEPLOY_TOKEN satu kali pakai`, `Peringatan PII saat unggah` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 416 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Batas yang diperiksa` connect `TanyaSayaChat` to `scheduler.ts`?**
  _High betweenness centrality (0.383) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `answer()` (e.g. with `Temuan` and `paint()`) actually correct?**
  _`answer()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Device`, `Dashboard pemilik bot`, `Audit keamanan 1–3` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07307692307692308 - nodes in this community are weakly interconnected._
- **Why does `run()` connect `scheduler.ts` to `backend.ts`, `TanyaSayaChat`?**
  _High betweenness centrality (0.382) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `mountGradient()` (e.g. with `.isLost()` and `.renderFrame()`) actually correct?**
  _`mountGradient()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0647307924984876 - nodes in this community are weakly interconnected._