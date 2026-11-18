# Graph Report - MeetNaraBot  (2026-11-18)

## Corpus Check
- 128 files · ~124,993 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 8, .css 3, .example 1)

## Summary
- 1061 nodes · 2118 edges · 64 communities (47 shown, 17 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `04612375`
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
- steps
- env
- cache.ts
- dev-server.mjs
- channels.spec.ts
- Nara · Mercury
- seed-document.mjs
- auth.ts
- grounding.ts
- compilerOptions
- graph.yml
- GradientParams
- file
- Nara: catatan untuk Claude
- scheduler.ts
- guard.ts
- TSbot
- kind.ts
- kinds.ts
- chunks
- webgpu-device.ts
- renderer.ts
- webgpu.ts
- purgeBot
- .renderFrame
- scripts
- src/types.ts
- playwright.config.ts
- deploy.yml
- WgpuDevice
- compilerOptions
- Nara platform (chatbot dokumen)
- deploy
- reseed
- steps
- shaders/horizon.ts
- pick
- 0004_accounts.sql
- shaders/spectrum.ts
- WgpuEncoder
- shaders/mesh.ts
- shaders/radial-glow.ts
- WgpuPass
- shaders/rise.ts
- shaders/silk.ts
- GradientKindDefinition
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
3. `env` - 24 edges
4. `mountGradient()` - 24 edges
5. `TanyaSayaChat` - 21 edges
6. `GradientParams` - 19 edges
7. `pick()` - 17 edges
8. `normalizeParams()` - 17 edges
9. `WebGPULease` - 17 edges
10. `createWebGLRenderer()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Pemotong dokumen di browser` --conceptually_related_to--> `chunkSection()`  [INFERRED]
  public/admin.html → scripts/seed-document.mjs
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

## Communities (64 total, 17 thin omitted)

### Community 0 - "src/index.ts"
Cohesion: 0.07
Nodes (31): Dashboard pemilik bot, Isolasi data per bot, Audit keamanan 1–3, Kunci login per IP/email, ownedBot(), app, benv(), dailyQuota() (+23 more)

### Community 1 - "llm.ts"
Cohesion: 0.15
Nodes (25): Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom(), embed() (+17 more)

### Community 2 - "channels.ts"
Cohesion: 0.09
Nodes (40): channel_history, channel_seen, idx_channel_history_updated, bodyTooLarge(), channelCommand(), citedSources(), clip(), clipHtml() (+32 more)

### Community 3 - "rag.ts"
Cohesion: 0.12
Nodes (24): chunks_fts, Pemotong dokumen di browser, paint(), Hybrid search (vektor + BM25 + RRF), Gerbang skor sebelum AI, hasPii(), injectionReply(), answer() (+16 more)

### Community 4 - "TanyaSayaChat"
Cohesion: 0.13
Nodes (10): Audit keamanan TSbot (2026-11), Batas yang diperiksa, Hasil, Landing page + widget demo, esc(), inkFor(), inline(), markdown() (+2 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, esbuild@0.28.2, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0 (+12 more)

### Community 6 - "settings.ts"
Cohesion: 0.14
Nodes (19): settings, asLang(), ChainEntry, clamp(), DEFAULT_SETTINGS, envDefaults(), fromLegacy(), getSettings() (+11 more)

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
Cohesion: 0.16
Nodes (22): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent, Cache jawaban semantik (pola GPTCache), CACHE_TTL_DAYS, CacheHit, cacheScope(), cacheStats() (+14 more)

### Community 11 - "dev-server.mjs"
Cohesion: 0.09
Nodes (22): agg(), bots, buildSystem(), DEFAULTS, docsLabel(), info(), LAYERS, PORT (+14 more)

### Community 12 - "channels.spec.ts"
Cohesion: 0.16
Nodes (7): FAKE_API_PORT, Call, startFakeChatApi(), fake, TG_SECRET, admin, fake

### Community 13 - "Nara · Mercury"
Cohesion: 0.20
Nodes (9): Colors, Components, Do's and Don'ts, Elevation & Depth, Layout, Nara · Mercury, Overview, Shapes (+1 more)

### Community 14 - "seed-document.mjs"
Cohesion: 0.05
Nodes (36): OUT, ROOT, OUT, SRC, bot, frames, OUT, ROOT (+28 more)

### Community 15 - "auth.ts"
Cohesion: 0.13
Nodes (27): ACCOUNT_DAYS, BotRow, botStatus(), changePassword(), constantTimeEqualHex(), createSession(), createUser(), DEFAULT_BOT (+19 more)

### Community 16 - "grounding.ts"
Cohesion: 0.19
Nodes (9): Uji coba + panel X-ray, Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, checkCitations(), CitationCheck, detectDocLang(), EN_WORDS, ID_WORDS (+1 more)

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 19 - "GradientParams"
Cohesion: 0.16
Nodes (8): BackendLease, PooledContext, AnyCanvas, ColorResolver, GradientParams, removeSurface(), WebGPULease, WgpuBuffer

### Community 20 - "file"
Cohesion: 0.22
Nodes (8): Tambahan: banyak dokumen per bot dan penyedia OpenAI, bot_config, file, idx_file_bot, activeFile(), documentsLabel(), listFiles(), processingFile()

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.25
Nodes (6): Gradien Mercury (gradients.sh), Kerja UI dan teks: DESIGN.md + antislop, Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "scheduler.ts"
Cohesion: 0.06
Nodes (66): ExportLimits, grainLayer(), staticFallbackCss(), getKind(), kindDefaults(), listKinds(), registerKind(), grainFrame() (+58 more)

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
Nodes (7): registry, chrome, pixelGlass, smear, wgsl, wgsl, wgsl

### Community 28 - "chunks"
Cohesion: 0.17
Nodes (11): chunks, chat_log, chunks_fts, idx_chat_log_created, idx_chunks_idx, usage, idx_chat_log_bot, idx_chunks_bot_idx (+3 more)

### Community 29 - "webgpu-device.ts"
Cohesion: 0.10
Nodes (24): adapterRefusal(), describe(), deviceLost(), fail(), isWgpuGpu(), loseWebGPUDevice(), navigatorGpu(), pipelines (+16 more)

### Community 30 - "renderer.ts"
Cohesion: 0.05
Nodes (68): FALLBACK_RGB, getProbe(), hasCssVariable(), linearToSrgb(), literalCache, Oklab, oklabToSrgb(), parseChannel() (+60 more)

### Community 31 - "webgpu.ts"
Cohesion: 0.09
Nodes (23): backendFor(), BackendName, GradientBackend, webglBackend, webgpuBackend, releaseContext(), GradientKind, acquireSurface() (+15 more)

### Community 32 - "purgeBot"
Cohesion: 0.18
Nodes (12): Audit keamanan run 4 (2026-11), Batas yang diperiksa, Hasil, vector_tombstones, Akun 7 hari + cron pembersihan, listBots(), deleteVectors(), purgeBot() (+4 more)

### Community 33 - ".renderFrame"
Cohesion: 0.15
Nodes (9): acquireSurface(), isWgpuContext(), leasedBytes(), packUniforms(), probeCopyPath(), webgpuContext(), webgpuStats(), WgpuCanvasContext (+1 more)

### Community 34 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build:gradient, db:migrate, deploy, dev, dev:mock, qa, test:e2e (+2 more)

### Community 35 - "src/types.ts"
Cohesion: 0.20
Nodes (9): User, KEYED_PROVIDERS, PROVIDERS, AppEnv, Bindings, ChatEvent, ChatMessage, Principal (+1 more)

### Community 36 - "playwright.config.ts"
Cohesion: 0.29
Nodes (5): IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test

### Community 37 - "deploy.yml"
Cohesion: 0.22
Nodes (8): concurrency, cancel-in-progress, group, name, permissions, contents, Deploy otomatis GitHub Actions, DEPLOY_TOKEN satu kali pakai

### Community 38 - "WgpuDevice"
Cohesion: 0.20
Nodes (4): wgslPostlude, wgslPrelude, compile(), WgpuDevice

### Community 39 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 40 - "Nara platform (chatbot dokumen)"
Cohesion: 0.33
Nodes (6): Dokumen referensi bot demo Nara, Prompt 7 layer untuk membangun ulang proyek, Paket gratis Cloudflare Workers/D1/Vectorize, Nara platform (chatbot dokumen), Prompt 7 layer (strict grounding), DEFAULT_LAYERS

### Community 41 - "deploy"
Cohesion: 0.22
Nodes (9): env, needs, runs-on, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, jobs, deploy, qa (+1 more)

### Community 42 - "reseed"
Cohesion: 0.22
Nodes (9): reseed, on, push, workflow_dispatch, branches, default, description, type (+1 more)

### Community 43 - "steps"
Cohesion: 0.25
Nodes (8): steps, id, name, run, uses, with, cache, node-version

### Community 45 - "pick"
Cohesion: 0.22
Nodes (5): pick(), beam, ditherField, wgsl, wgsl

### Community 46 - "0004_accounts.sql"
Cohesion: 0.36
Nodes (8): bots, idx_bots_owner, idx_sessions_user, idx_users_expires, sessions, users, createBot(), sessionUser()

### Community 50 - "shaders/mesh.ts"
Cohesion: 0.40
Nodes (3): BLOBS, mesh, wgsl

### Community 58 - "GradientKindDefinition"
Cohesion: 0.40
Nodes (3): GradientKindDefinition, aurora, wgsl

## Knowledge Gaps
- **11 isolated node(s):** `Device`, `Dashboard pemilik bot`, `Audit keamanan 1–3`, `Uji coba + panel X-ray`, `Peringatan PII saat unggah` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 374 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Batas yang diperiksa` connect `TanyaSayaChat` to `scheduler.ts`?**
  _High betweenness centrality (0.386) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `answer()` (e.g. with `paint()` and `Nara platform (chatbot dokumen)`) actually correct?**
  _`answer()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Device`, `Dashboard pemilik bot`, `Audit keamanan 1–3` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07195121951219512 - nodes in this community are weakly interconnected._
- **Why does `run()` connect `scheduler.ts` to `TanyaSayaChat`, `renderer.ts`?**
  _High betweenness centrality (0.380) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `mountGradient()` (e.g. with `.isLost()` and `.renderFrame()`) actually correct?**
  _`mountGradient()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `llm.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1455026455026455 - nodes in this community are weakly interconnected._