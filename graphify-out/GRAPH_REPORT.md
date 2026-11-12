# Graph Report - MeetNaraBot  (2026-11-12)

## Corpus Check
- 125 files · ~122,882 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 7, .css 2, .example 1)

## Summary
- 1049 nodes · 2085 edges · 58 communities (49 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 72 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `853f8c4f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- llm.ts
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
- Accessibility Code Patterns
- Nara
- seed-document.mjs
- auth.ts
- start-worker.mjs
- compilerOptions
- graph.yml
- 0004_accounts.sql
- chunks
- Nara: catatan untuk Claude
- build-tsbot.mjs
- guard.ts
- TSbot
- renderer.ts
- serve-tsbot.mjs
- scheduler.ts
- kind.ts
- Nara platform (chatbot dokumen)
- kinds.ts
- webgpu-device.ts
- rag.ts
- gradient-engine/index.ts
- settings.ts
- webgpu.ts
- WebGPULease
- grounding.ts
- probeCopyPath
- playwright.config.ts
- WgpuDevice
- compilerOptions
- scripts
- .renderFrame
- deploy
- reseed
- steps
- 0002_rag_upgrade.sql
- WgpuEncoder
- shaders/mesh.ts
- shaders/radial-glow.ts
- WgpuPass
- shaders/dither-field.ts
- shaders/horizon.ts
- shaders/rise.ts
- shaders/silk.ts
- shaders/smear.ts

## God Nodes (most connected - your core abstractions)
1. `answer()` - 29 edges
2. `GradientKindDefinition` - 27 edges
3. `mountGradient()` - 24 edges
4. `env` - 23 edges
5. `TanyaSayaChat` - 21 edges
6. `GradientParams` - 19 edges
7. `pick()` - 17 edges
8. `normalizeParams()` - 17 edges
9. `WebGPULease` - 17 edges
10. `createWebGLRenderer()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Isolasi data per bot` --implements--> `tenantEnv()`  [EXTRACTED]
  README.md → src/settings.ts
- `Batas yang diperiksa` --references--> `storeAnswer()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/cache.ts
- `Kunci login per IP/email` --implements--> `verifyLogin()`  [INFERRED]
  SECURITY.md → src/auth.ts
- `Batas yang diperiksa` --references--> `checkCitations()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/grounding.ts
- `Nara platform (chatbot dokumen)` --references--> `answer()`  [INFERRED]
  README.md → src/rag.ts

## Import Cycles
- None detected.

## Communities (58 total, 9 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.08
Nodes (24): settings, Dashboard pemilik bot, Audit keamanan 1–3, Kunci login per IP/email, app, dailyQuota(), Env, FileRow (+16 more)

### Community 1 - "llm.ts"
Cohesion: 0.21
Nodes (19): Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom(), embed() (+11 more)

### Community 2 - "channels.ts"
Cohesion: 0.08
Nodes (46): channel_history, channel_seen, idx_channel_history_updated, channelCommand(), citedSources(), clip(), clipHtml(), escapeHtml() (+38 more)

### Community 3 - "purgeBot"
Cohesion: 0.14
Nodes (15): Audit keamanan run 4 (2026-11), Batas yang diperiksa, Hasil, vector_tombstones, Akun 7 hari + cron pembersihan, purgeExpiredCache(), deleteVectors(), purgeBot() (+7 more)

### Community 4 - "TanyaSayaChat"
Cohesion: 0.13
Nodes (10): Audit keamanan TSbot (2026-11), Batas yang diperiksa, Hasil, Landing page + widget demo, esc(), inkFor(), inline(), markdown() (+2 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, esbuild@0.28.2, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0 (+12 more)

### Community 6 - "deploy.yml"
Cohesion: 0.22
Nodes (8): concurrency, cancel-in-progress, group, name, permissions, contents, Deploy otomatis GitHub Actions, DEPLOY_TOKEN satu kali pakai

### Community 7 - "steps"
Cohesion: 0.08
Nodes (25): CI, jobs, qa, name, on, pull_request, push, workflow_call (+17 more)

### Community 8 - "env"
Cohesion: 0.06
Nodes (31): concurrency, cancel-in-progress, group, env, needs, runs-on, steps, CLOUDFLARE_ACCOUNT_ID (+23 more)

### Community 9 - "env"
Cohesion: 0.09
Nodes (23): ADMIN_PASSWORD, CF_WORKERS_AI_KEY, COHERE_API_KEY, DEEPSEEK_API_KEY, DEPLOY_TOKEN, FIREWORKS_API_KEY, GEMINI_API_KEY, HF_TOKEN (+15 more)

### Community 10 - "cache.ts"
Cohesion: 0.14
Nodes (23): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent, Cache jawaban semantik (pola GPTCache), CACHE_TTL_DAYS, CacheHit, cacheScope(), cacheStats() (+15 more)

### Community 11 - "dev-server.mjs"
Cohesion: 0.11
Nodes (17): agg(), bots, buildSystem(), DEFAULTS, docsLabel(), info(), LAYERS, PORT (+9 more)

### Community 12 - "Accessibility Code Patterns"
Cohesion: 0.18
Nodes (7): FAKE_API_PORT, Call, startFakeChatApi(), fake, TG_SECRET, admin, fake

### Community 13 - "Nara"
Cohesion: 0.20
Nodes (9): Colors, Components, Do's and Don'ts, Elevation & Depth, Layout, Nara · Mercury, Overview, Shapes (+1 more)

### Community 14 - "seed-document.mjs"
Cohesion: 0.14
Nodes (12): Pemotong dokumen di browser, [base, file, ...flags], chunks, chunkSection(), force, headers, md, name (+4 more)

### Community 15 - "auth.ts"
Cohesion: 0.12
Nodes (27): Isolasi data per bot, ACCOUNT_DAYS, BotRow, botStatus(), changePassword(), constantTimeEqualHex(), createSession(), createUser() (+19 more)

### Community 16 - "start-worker.mjs"
Cohesion: 0.15
Nodes (11): args, child, chunks, doc(), future, past, [port, fakePort, password], q() (+3 more)

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 19 - "0004_accounts.sql"
Cohesion: 0.36
Nodes (8): bots, idx_bots_owner, idx_sessions_user, idx_users_expires, sessions, users, createBot(), listBots()

### Community 20 - "chunks"
Cohesion: 0.14
Nodes (12): Tambahan: banyak dokumen per bot dan penyedia OpenAI, bot_config, chunks, file, idx_chunks_idx, idx_chunks_bot_idx, idx_file_bot, idx_chunks_file_idx (+4 more)

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.25
Nodes (6): Gradien Mercury (gradients.sh), Kerja UI dan teks: DESIGN.md + antislop, Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "build-tsbot.mjs"
Cohesion: 0.24
Nodes (8): bot, fail(), frames, LOOPBACK, OUT, ROOT, SRC, toOrigin()

### Community 24 - "guard.ts"
Cohesion: 0.12
Nodes (25): Peringatan PII saat unggah, Guardrail prompt injection, Guardrail data pribadi (PII), Riwayat bertanda tangan HMAC, b64url(), detectInjection(), digits(), enc (+17 more)

### Community 25 - "TSbot"
Cohesion: 0.40
Nodes (4): Build dan uji lokal, Pasang di IMTS (https://imtsbot.pages.dev), Pengaturan sekali, TSbot

### Community 26 - "renderer.ts"
Cohesion: 0.05
Nodes (68): FALLBACK_RGB, getProbe(), hasCssVariable(), linearToSrgb(), literalCache, oklabToSrgb(), parseChannel(), parseColorLiteral() (+60 more)

### Community 27 - "serve-tsbot.mjs"
Cohesion: 0.18
Nodes (6): OUT, ROOT, DIST, headers, [tsPort, apiPort, imtsPort, otherPort], TYPES

### Community 28 - "scheduler.ts"
Cohesion: 0.07
Nodes (44): GradientBackend, mountGradient(), onLost(), MountOptions, liveContextCount(), assignQuality(), ContextSlot, contextStats() (+36 more)

### Community 29 - "kind.ts"
Cohesion: 0.08
Nodes (18): GradientKindDefinition, stops(), ditherBurst, fluted, linearFlow, pixelGlass, ribbon, spectrum (+10 more)

### Community 30 - "Nara platform (chatbot dokumen)"
Cohesion: 0.33
Nodes (6): Dokumen referensi bot demo Nara, Prompt 7 layer untuk membangun ulang proyek, Paket gratis Cloudflare Workers/D1/Vectorize, Nara platform (chatbot dokumen), Prompt 7 layer (strict grounding), DEFAULT_LAYERS

### Community 31 - "kinds.ts"
Cohesion: 0.08
Nodes (18): pick(), registry, aurora, beam, chrome, grain, halo, limb (+10 more)

### Community 32 - "webgpu-device.ts"
Cohesion: 0.10
Nodes (24): adapterRefusal(), describe(), deviceLost(), fail(), isWgpuGpu(), loseWebGPUDevice(), navigatorGpu(), pipelines (+16 more)

### Community 33 - "rag.ts"
Cohesion: 0.10
Nodes (29): chunks_fts, paint(), Hybrid search (vektor + BM25 + RRF), Gerbang skor sebelum AI, benv(), answer(), AnswerInput, buildSystemPrompt() (+21 more)

### Community 34 - "gradient-engine/index.ts"
Cohesion: 0.14
Nodes (22): grainLayer(), staticFallbackCss(), getKind(), kindDefaults(), listKinds(), registerKind(), grainFrame(), LIVE_FPS (+14 more)

### Community 35 - "settings.ts"
Cohesion: 0.08
Nodes (23): User, ChainEntry, DEFAULT_SETTINGS, deleteSetting(), EMBEDDING_MODEL, GEMINI_EMBEDDING_MODEL, KEYED_PROVIDERS, keyStatus() (+15 more)

### Community 36 - "webgpu.ts"
Cohesion: 0.11
Nodes (21): backendFor(), BackendName, webglBackend, webgpuBackend, webglUnsupported(), acquireSurface(), BackendPreference, changeListeners (+13 more)

### Community 37 - "WebGPULease"
Cohesion: 0.19
Nodes (7): BackendLease, Oklab, PooledContext, AnyCanvas, ColorResolver, removeSurface(), WebGPULease

### Community 38 - "grounding.ts"
Cohesion: 0.19
Nodes (9): Uji coba + panel X-ray, Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, checkCitations(), CitationCheck, detectDocLang(), EN_WORDS, ID_WORDS (+1 more)

### Community 39 - "probeCopyPath"
Cohesion: 0.19
Nodes (6): acquireSurface(), isWgpuContext(), probeCopyPath(), webgpuContext(), WgpuBuffer, WgpuCanvasContext

### Community 40 - "playwright.config.ts"
Cohesion: 0.29
Nodes (5): IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test

### Community 41 - "WgpuDevice"
Cohesion: 0.18
Nodes (4): wgslPostlude, wgslPrelude, compile(), WgpuDevice

### Community 42 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 43 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build:gradient, db:migrate, deploy, dev, dev:mock, qa, test:e2e (+2 more)

### Community 44 - ".renderFrame"
Cohesion: 0.22
Nodes (6): FrameInput, RenderTarget, leasedBytes(), packUniforms(), webgpuStats(), WgpuPipeline

### Community 45 - "deploy"
Cohesion: 0.22
Nodes (9): env, needs, runs-on, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, jobs, deploy, qa (+1 more)

### Community 46 - "reseed"
Cohesion: 0.22
Nodes (9): reseed, on, push, workflow_dispatch, branches, default, description, type (+1 more)

### Community 47 - "steps"
Cohesion: 0.25
Nodes (8): steps, id, name, run, uses, with, cache, node-version

### Community 48 - "0002_rag_upgrade.sql"
Cohesion: 0.29
Nodes (7): chat_log, chunks_fts, idx_chat_log_created, usage, idx_chat_log_bot, logChat(), spendPlatform()

### Community 50 - "shaders/mesh.ts"
Cohesion: 0.40
Nodes (3): BLOBS, mesh, wgsl

## Knowledge Gaps
- **11 isolated node(s):** `Device`, `Dashboard pemilik bot`, `Gerbang skor sebelum AI`, `Uji coba + panel X-ray`, `Peringatan PII saat unggah` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 370 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `answer()` connect `rag.ts` to `index.ts`, `llm.ts`, `channels.ts`, `grounding.ts`, `cache.ts`, `dev-server.mjs`, `guard.ts`, `Nara platform (chatbot dokumen)`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `answer()` (e.g. with `paint()` and `Nara platform (chatbot dokumen)`) actually correct?**
  _`answer()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Device`, `Dashboard pemilik bot`, `Gerbang skor sebelum AI` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07899159663865546 - nodes in this community are weakly interconnected._
- **Why does `Deploy otomatis GitHub Actions` connect `deploy.yml` to `seed-document.mjs`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `mountGradient()` (e.g. with `.isLost()` and `.renderFrame()`) actually correct?**
  _`mountGradient()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `channels.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08408163265306122 - nodes in this community are weakly interconnected._