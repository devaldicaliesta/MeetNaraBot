# Graph Report - meetnarabot  (2026-11-26)

## Corpus Check
- 132 files · ~132,321 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 8, .css 3, .example 1)

## Summary
- 1089 nodes · 2169 edges · 74 communities (57 shown, 17 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 76 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `853106d4`
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
- with
- steps
- env
- cache.ts
- dev-server.mjs
- deploy.yml
- Nara · Mercury
- seed-document.mjs
- auth.ts
- Nara platform (chatbot dokumen)
- compilerOptions
- graph.yml
- WebGPULease
- deploy
- Nara: catatan untuk Claude
- scheduler.ts
- guard.ts
- TSbot
- kind.ts
- kinds.ts
- 0002_rag_upgrade.sql
- webgpu-device.ts
- export.ts
- webgpu.ts
- purgeBot
- renderer.ts
- reseed
- params.ts
- steps
- grounding.ts
- WgpuDevice
- compilerOptions
- pool.ts
- channels.spec.ts
- settings.ts
- getKind
- shaders/horizon.ts
- GradientKindDefinition
- 0004_accounts.sql
- createUser
- start-worker.mjs
- WgpuEncoder
- shaders/mesh.ts
- shaders/radial-glow.ts
- WgpuPass
- providers.test.ts
- build-tsbot.mjs
- BackendLease
- playwright.config.ts
- serve-tsbot.mjs
- pick
- shaders/grain.ts
- scripts
- shaders/limb.ts
- retrieve
- shaders/mist.ts
- shaders/ribbon.ts
- shaders/halo.ts
- clientKey
- shaders/rise.ts
- shaders/linear-flow.ts
- shaders/silk.ts
- shaders/void.ts
- shaders/spectrum.ts
- activeFile
- shaders/waves.ts

## God Nodes (most connected - your core abstractions)
1. `answer()` - 29 edges
2. `GradientKindDefinition` - 27 edges
3. `env` - 25 edges
4. `mountGradient()` - 24 edges
5. `TanyaSayaChat` - 21 edges
6. `GradientParams` - 19 edges
7. `pick()` - 17 edges
8. `normalizeParams()` - 17 edges
9. `WebGPULease` - 17 edges
10. `createWebGLRenderer()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Hasil` --references--> `clientKey()`  [INFERRED]
  docs/security/audit-2026-11-run5.md → src/net.ts
- `Kunci login per IP/email` --implements--> `verifyLogin()`  [INFERRED]
  SECURITY.md → src/auth.ts
- `Batas yang diperiksa` --references--> `storeAnswer()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/cache.ts
- `Batas yang diperiksa` --references--> `checkCitations()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/grounding.ts
- `Nara platform (chatbot dokumen)` --references--> `answer()`  [INFERRED]
  README.md → src/rag.ts

## Import Cycles
- None detected.

## Communities (74 total, 17 thin omitted)

### Community 0 - "src/index.ts"
Cohesion: 0.09
Nodes (22): Dashboard pemilik bot, Audit keamanan 1–3, Kunci login per IP/email, app, dailyQuota(), Env, FileRow, hits (+14 more)

### Community 1 - "llm.ts"
Cohesion: 0.15
Nodes (24): Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom(), embed() (+16 more)

### Community 2 - "channels.ts"
Cohesion: 0.09
Nodes (43): channel_history, channel_seen, idx_channel_history_updated, bodyTooLarge(), channelCommand(), citedSources(), clip(), clipHtml() (+35 more)

### Community 3 - "rag.ts"
Cohesion: 0.11
Nodes (26): paint(), User, hasPii(), injectionReply(), benv(), answer(), AnswerInput, buildSystemPrompt() (+18 more)

### Community 4 - "TanyaSayaChat"
Cohesion: 0.13
Nodes (10): Audit keamanan TSbot (2026-11), Batas yang diperiksa, Hasil, Landing page + widget demo, esc(), inkFor(), inline(), markdown() (+2 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, esbuild@0.28.2, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0 (+12 more)

### Community 6 - "gradient-engine/index.ts"
Cohesion: 0.15
Nodes (21): ExportLimits, listKinds(), registerKind(), grainFrame(), LIVE_FPS, LOOP_RADIUS, loopPhase(), loopVector() (+13 more)

### Community 7 - "with"
Cohesion: 0.07
Nodes (26): CI, jobs, qa, name, on, pull_request, push, workflow_call (+18 more)

### Community 8 - "steps"
Cohesion: 0.06
Nodes (35): concurrency, cancel-in-progress, group, env, needs, runs-on, steps, CLOUDFLARE_ACCOUNT_ID (+27 more)

### Community 9 - "env"
Cohesion: 0.08
Nodes (25): ADMIN_PASSWORD, CF_WORKERS_AI_KEY, COHERE_API_KEY, DEEPSEEK_API_KEY, DEPLOY_TOKEN, FIREWORKS_API_KEY, GEMINI_API_KEY, HF_TOKEN (+17 more)

### Community 10 - "cache.ts"
Cohesion: 0.11
Nodes (29): Audit keamanan run 5 (2026-11): TSbot, IMTS, dan akun permanen, Catatan yang tetap berlaku, Hasil, Penguatan tahap 2, Penguatan yang diterapkan (bukan temuan), Pengujian, answer_cache, idx_answer_cache_exact (+21 more)

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
Nodes (25): Isolasi data per bot, ACCOUNT_DAYS, BotRow, botStatus(), constantTimeEqualHex(), daysFromNow(), DEFAULT_BOT, DUMMY (+17 more)

### Community 16 - "Nara platform (chatbot dokumen)"
Cohesion: 0.33
Nodes (6): Dokumen referensi bot demo Nara, Prompt 7 layer untuk membangun ulang proyek, Paket gratis Cloudflare Workers/D1/Vectorize, Nara platform (chatbot dokumen), Prompt 7 layer (strict grounding), DEFAULT_LAYERS

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 19 - "WebGPULease"
Cohesion: 0.12
Nodes (11): acquireSurface(), isWgpuContext(), leasedBytes(), probeCopyPath(), removeSurface(), webgpuContext(), WebGPULease, webgpuStats() (+3 more)

### Community 20 - "deploy"
Cohesion: 0.22
Nodes (9): env, needs, runs-on, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, jobs, deploy, qa (+1 more)

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.25
Nodes (6): Gradien Mercury (gradients.sh), Kerja UI dan teks: DESIGN.md + antislop, Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "scheduler.ts"
Cohesion: 0.09
Nodes (39): mountGradient(), onLost(), MountOptions, liveContextCount(), assignQuality(), ContextSlot, contextStats(), distanceToViewport() (+31 more)

### Community 24 - "guard.ts"
Cohesion: 0.13
Nodes (23): Peringatan PII saat unggah, Guardrail prompt injection, Guardrail data pribadi (PII), Riwayat bertanda tangan HMAC, b64url(), detectInjection(), digits(), enc (+15 more)

### Community 25 - "TSbot"
Cohesion: 0.40
Nodes (4): Build dan uji lokal, Halaman IMTS (https://imtsbot.pages.dev), Pengaturan sekali, TSbot

### Community 26 - "kind.ts"
Cohesion: 0.16
Nodes (7): stops(), ditherBurst, fluted, swirl, wgsl, wgsl, wgsl

### Community 27 - "kinds.ts"
Cohesion: 0.18
Nodes (7): registry, ditherField, pixelGlass, smear, wgsl, wgsl, wgsl

### Community 28 - "0002_rag_upgrade.sql"
Cohesion: 0.29
Nodes (7): chat_log, chunks_fts, idx_chat_log_created, usage, idx_chat_log_bot, logChat(), spendPlatform()

### Community 29 - "webgpu-device.ts"
Cohesion: 0.10
Nodes (24): adapterRefusal(), describe(), deviceLost(), fail(), isWgpuGpu(), loseWebGPUDevice(), navigatorGpu(), pipelines (+16 more)

### Community 30 - "export.ts"
Cohesion: 0.15
Nodes (26): FALLBACK_RGB, getProbe(), hasCssVariable(), linearToSrgb(), literalCache, oklabToSrgb(), parseChannel(), parseColorLiteral() (+18 more)

### Community 31 - "webgpu.ts"
Cohesion: 0.09
Nodes (23): backendFor(), BackendName, GradientBackend, webglBackend, webgpuBackend, releaseContext(), GradientKind, acquireSurface() (+15 more)

### Community 32 - "purgeBot"
Cohesion: 0.15
Nodes (14): Audit keamanan run 4 (2026-11), Batas yang diperiksa, Hasil, vector_tombstones, Akun 7 hari + cron pembersihan, listBots(), purgeExpiredCache(), deleteVectors() (+6 more)

### Community 33 - "renderer.ts"
Cohesion: 0.13
Nodes (16): Oklab, ExportRenderer, fullTarget(), compile(), ContextOptions, createWebGLRenderer(), isOffscreen(), ProgramInfo (+8 more)

### Community 34 - "reseed"
Cohesion: 0.22
Nodes (9): reseed, on, push, workflow_dispatch, branches, default, description, type (+1 more)

### Community 35 - "params.ts"
Cohesion: 0.32
Nodes (14): boolean(), clamp(), fullParams(), integer(), mergeParams(), normalizeParams(), number(), parseParams() (+6 more)

### Community 36 - "steps"
Cohesion: 0.22
Nodes (9): steps, id, name, run, uses, with, cache, node-version (+1 more)

### Community 37 - "grounding.ts"
Cohesion: 0.19
Nodes (9): Uji coba + panel X-ray, Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, checkCitations(), CitationCheck, detectDocLang(), EN_WORDS, ID_WORDS (+1 more)

### Community 38 - "WgpuDevice"
Cohesion: 0.18
Nodes (4): wgslPostlude, wgslPrelude, compile(), WgpuDevice

### Community 39 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 40 - "pool.ts"
Cohesion: 0.20
Nodes (12): defaultParams, acquireContext(), changeListeners, contexts, create(), createCanvas(), destroy(), MAX_LIVE_CONTEXTS (+4 more)

### Community 41 - "channels.spec.ts"
Cohesion: 0.16
Nodes (7): FAKE_API_PORT, Call, startFakeChatApi(), fake, TG_SECRET, admin, fake

### Community 42 - "settings.ts"
Cohesion: 0.12
Nodes (23): settings, visitorSuggestions(), asLang(), clamp(), DEFAULT_SETTINGS, deleteSetting(), envDefaults(), fromLegacy() (+15 more)

### Community 43 - "getKind"
Cohesion: 0.24
Nodes (7): grainLayer(), staticFallbackCss(), getKind(), kindDefaults(), MountedGradient, MERCURY, mountMercury()

### Community 45 - "GradientKindDefinition"
Cohesion: 0.33
Nodes (4): GradientKindDefinition, beam, wgsl, GradientParams

### Community 46 - "0004_accounts.sql"
Cohesion: 0.15
Nodes (15): bot_config, chunks, file, idx_chunks_idx, bots, idx_bots_owner, idx_chunks_bot_idx, idx_file_bot (+7 more)

### Community 47 - "createUser"
Cohesion: 0.39
Nodes (9): changePassword(), createSession(), createUser(), endSession(), hex(), newId(), pbkdf2(), random() (+1 more)

### Community 48 - "start-worker.mjs"
Cohesion: 0.15
Nodes (11): args, child, chunks, doc(), future, past, [port, fakePort, password], q() (+3 more)

### Community 50 - "shaders/mesh.ts"
Cohesion: 0.40
Nodes (3): BLOBS, mesh, wgsl

### Community 53 - "providers.test.ts"
Cohesion: 0.47
Nodes (4): adaptBody(), isOpenAiReasoning(), KEYED_PROVIDERS, PROVIDERS

### Community 54 - "build-tsbot.mjs"
Cohesion: 0.22
Nodes (10): OUT, SRC, bot, frames, OUT, ROOT, SRC, fail() (+2 more)

### Community 55 - "BackendLease"
Cohesion: 0.40
Nodes (4): BackendLease, PooledContext, AnyCanvas, ColorResolver

### Community 56 - "playwright.config.ts"
Cohesion: 0.26
Nodes (5): IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test

### Community 57 - "serve-tsbot.mjs"
Cohesion: 0.20
Nodes (4): OUT, ROOT, [tsPort, apiPort, imtsPort, otherPort], TYPES

### Community 58 - "pick"
Cohesion: 0.22
Nodes (5): pick(), aurora, chrome, wgsl, wgsl

### Community 60 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build:gradient, db:migrate, deploy, dev, dev:mock, qa, test:e2e (+2 more)

### Community 62 - "retrieve"
Cohesion: 0.50
Nodes (5): chunks_fts, Hybrid search (vektor + BM25 + RRF), Gerbang skor sebelum AI, ftsQuery(), retrieve()

### Community 72 - "activeFile"
Cohesion: 0.40
Nodes (5): Tambahan: banyak dokumen per bot dan penyedia OpenAI, activeFile(), documentsLabel(), listFiles(), processingFile()

## Knowledge Gaps
- **11 isolated node(s):** `Device`, `Dashboard pemilik bot`, `Audit keamanan 1–3`, `Peringatan PII saat unggah`, `DEPLOY_TOKEN satu kali pakai` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 386 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Batas yang diperiksa` connect `TanyaSayaChat` to `scheduler.ts`?**
  _High betweenness centrality (0.381) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `answer()` (e.g. with `paint()` and `Nara platform (chatbot dokumen)`) actually correct?**
  _`answer()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Device`, `Dashboard pemilik bot`, `Audit keamanan 1–3` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08870967741935484 - nodes in this community are weakly interconnected._
- **Why does `run()` connect `scheduler.ts` to `pool.ts`, `TanyaSayaChat`?**
  _High betweenness centrality (0.378) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `mountGradient()` (e.g. with `.isLost()` and `.renderFrame()`) actually correct?**
  _`mountGradient()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `channels.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08599290780141844 - nodes in this community are weakly interconnected._