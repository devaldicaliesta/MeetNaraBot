# Graph Report - MeetNaraBot  (2026-11-19)

## Corpus Check
- 128 files · ~128,613 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 8, .css 3, .example 1)

## Summary
- 1070 nodes · 2137 edges · 67 communities (49 shown, 18 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e28ba6be`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- src/index.ts
- llm.ts
- channels.ts
- rag.ts
- TanyaSayaChat
- package.json
- uniforms.ts
- steps
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
- stops
- kinds.ts
- 0002_rag_upgrade.sql
- webgpu-device.ts
- renderer.ts
- webgpu.ts
- purgeBot
- probeCopyPath
- reseed
- shaders/dither-field.ts
- steps
- grounding.ts
- WgpuDevice
- compilerOptions
- shaders/smear.ts
- channels.spec.ts
- settings.ts
- kind.ts
- shaders/horizon.ts
- GradientKindDefinition
- 0004_accounts.sql
- start-worker.mjs
- WgpuEncoder
- shaders/mesh.ts
- shaders/radial-glow.ts
- WgpuPass
- GradientBackend
- build-tsbot.mjs
- playwright.config.ts
- serve-tsbot.mjs
- pick
- shaders/grain.ts
- scripts
- shaders/limb.ts
- shaders/mist.ts
- shaders/ribbon.ts
- shaders/halo.ts
- shaders/linear-flow.ts
- shaders/silk.ts
- shaders/spectrum.ts
- activeFile

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
- `Kunci login per IP/email` --implements--> `verifyLogin()`  [INFERRED]
  SECURITY.md → src/auth.ts
- `Batas yang diperiksa` --references--> `storeAnswer()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/cache.ts
- `Batas yang diperiksa` --references--> `checkCitations()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/grounding.ts
- `Nara platform (chatbot dokumen)` --references--> `answer()`  [INFERRED]
  README.md → src/rag.ts
- `Batas yang diperiksa` --references--> `run()`  [INFERRED]
  docs/security/tsbot-audit-2026-11.md → web/gradients/gradient-engine/scheduler.ts

## Import Cycles
- None detected.

## Communities (67 total, 18 thin omitted)

### Community 0 - "src/index.ts"
Cohesion: 0.08
Nodes (24): Dashboard pemilik bot, Audit keamanan 1–3, Kunci login per IP/email, app, dailyQuota(), Env, FileRow, hits (+16 more)

### Community 1 - "llm.ts"
Cohesion: 0.18
Nodes (22): Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom(), embed() (+14 more)

### Community 2 - "channels.ts"
Cohesion: 0.09
Nodes (41): channel_history, channel_seen, idx_channel_history_updated, bodyTooLarge(), channelCommand(), citedSources(), clip(), clipHtml() (+33 more)

### Community 3 - "rag.ts"
Cohesion: 0.10
Nodes (29): chunks_fts, paint(), Hybrid search (vektor + BM25 + RRF), Isolasi data per bot, Gerbang skor sebelum AI, ownedBot(), injectionReply(), benv() (+21 more)

### Community 4 - "TanyaSayaChat"
Cohesion: 0.13
Nodes (10): Audit keamanan TSbot (2026-11), Batas yang diperiksa, Hasil, Landing page + widget demo, esc(), inkFor(), inline(), markdown() (+2 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, esbuild@0.28.2, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0 (+12 more)

### Community 6 - "uniforms.ts"
Cohesion: 0.23
Nodes (10): grainFrame(), loopVector(), loopVectorAtPhase(), FrameInput, RenderTarget, FrameUniforms, frameUniforms(), seedOffset() (+2 more)

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
Cohesion: 0.13
Nodes (25): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent, Peringatan PII saat unggah, Cache jawaban semantik (pola GPTCache), Guardrail data pribadi (PII), CACHE_TTL_DAYS, CacheHit (+17 more)

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
Nodes (31): ACCOUNT_DAYS, BotRow, botStatus(), changePassword(), constantTimeEqualHex(), createSession(), createUser(), daysFromNow() (+23 more)

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
Cohesion: 0.21
Nodes (4): Oklab, removeSurface(), WebGPULease, WgpuBuffer

### Community 20 - "deploy"
Cohesion: 0.22
Nodes (9): env, needs, runs-on, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, jobs, deploy, qa (+1 more)

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.25
Nodes (6): Gradien Mercury (gradients.sh), Kerja UI dan teks: DESIGN.md + antislop, Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "scheduler.ts"
Cohesion: 0.05
Nodes (72): grainLayer(), staticFallbackCss(), getKind(), kindDefaults(), listKinds(), registerKind(), LIVE_FPS, LOOP_RADIUS (+64 more)

### Community 24 - "guard.ts"
Cohesion: 0.10
Nodes (29): Guardrail prompt injection, Riwayat bertanda tangan HMAC, User, b64url(), detectInjection(), digits(), enc, findPii() (+21 more)

### Community 25 - "TSbot"
Cohesion: 0.40
Nodes (4): Build dan uji lokal, Halaman IMTS (https://imtsbot.pages.dev), Pengaturan sekali, TSbot

### Community 26 - "stops"
Cohesion: 0.15
Nodes (7): stops(), ditherBurst, rise, waves, wgsl, wgsl, wgsl

### Community 27 - "kinds.ts"
Cohesion: 0.18
Nodes (7): registry, pixelGlass, swirl, voidKind, wgsl, wgsl, wgsl

### Community 28 - "0002_rag_upgrade.sql"
Cohesion: 0.29
Nodes (7): chat_log, chunks_fts, idx_chat_log_created, idx_chunks_idx, usage, idx_chat_log_bot, spendPlatform()

### Community 29 - "webgpu-device.ts"
Cohesion: 0.08
Nodes (30): acquireSurface(), adapterRefusal(), describe(), deviceLost(), fail(), isWgpuContext(), isWgpuGpu(), leasedBytes() (+22 more)

### Community 30 - "renderer.ts"
Cohesion: 0.06
Nodes (56): BackendLease, FALLBACK_RGB, getProbe(), hasCssVariable(), linearToSrgb(), literalCache, oklabToSrgb(), parseChannel() (+48 more)

### Community 31 - "webgpu.ts"
Cohesion: 0.10
Nodes (22): backendFor(), BackendName, webglBackend, webgpuBackend, releaseContext(), webglUnsupported(), acquireSurface(), BackendPreference (+14 more)

### Community 32 - "purgeBot"
Cohesion: 0.15
Nodes (14): Audit keamanan run 4 (2026-11), Batas yang diperiksa, Hasil, vector_tombstones, Akun 7 hari + cron pembersihan, listBots(), purgeExpiredCache(), deleteVectors() (+6 more)

### Community 34 - "reseed"
Cohesion: 0.22
Nodes (9): reseed, on, push, workflow_dispatch, branches, default, description, type (+1 more)

### Community 36 - "steps"
Cohesion: 0.25
Nodes (8): steps, id, name, run, uses, with, cache, node-version

### Community 37 - "grounding.ts"
Cohesion: 0.19
Nodes (9): Uji coba + panel X-ray, Reranker otomatis dokumen Inggris, Cek sitasi pasca-generasi, checkCitations(), CitationCheck, detectDocLang(), EN_WORDS, ID_WORDS (+1 more)

### Community 38 - "WgpuDevice"
Cohesion: 0.18
Nodes (4): wgslPostlude, wgslPrelude, compile(), WgpuDevice

### Community 39 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 41 - "channels.spec.ts"
Cohesion: 0.16
Nodes (7): FAKE_API_PORT, Call, startFakeChatApi(), fake, TG_SECRET, admin, fake

### Community 42 - "settings.ts"
Cohesion: 0.10
Nodes (25): settings, asLang(), ChainEntry, clamp(), DEFAULT_SETTINGS, deleteSetting(), EMBEDDING_MODEL, envDefaults() (+17 more)

### Community 45 - "GradientKindDefinition"
Cohesion: 0.22
Nodes (5): GradientKindDefinition, beam, fluted, wgsl, wgsl

### Community 46 - "0004_accounts.sql"
Cohesion: 0.16
Nodes (14): bot_config, chunks, file, bots, idx_bots_owner, idx_chunks_bot_idx, idx_file_bot, idx_sessions_user (+6 more)

### Community 48 - "start-worker.mjs"
Cohesion: 0.15
Nodes (11): args, child, chunks, doc(), future, past, [port, fakePort, password], q() (+3 more)

### Community 50 - "shaders/mesh.ts"
Cohesion: 0.40
Nodes (3): BLOBS, mesh, wgsl

### Community 54 - "build-tsbot.mjs"
Cohesion: 0.22
Nodes (10): OUT, SRC, bot, frames, OUT, ROOT, SRC, fail() (+2 more)

### Community 56 - "playwright.config.ts"
Cohesion: 0.29
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

### Community 72 - "activeFile"
Cohesion: 0.40
Nodes (5): Tambahan: banyak dokumen per bot dan penyedia OpenAI, activeFile(), documentsLabel(), listFiles(), processingFile()

## Knowledge Gaps
- **11 isolated node(s):** `Device`, `Dashboard pemilik bot`, `Audit keamanan 1–3`, `Peringatan PII saat unggah`, `DEPLOY_TOKEN satu kali pakai` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 376 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run()` connect `scheduler.ts` to `TanyaSayaChat`, `renderer.ts`?**
  _High betweenness centrality (0.376) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `answer()` (e.g. with `paint()` and `Nara platform (chatbot dokumen)`) actually correct?**
  _`answer()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Device`, `Dashboard pemilik bot`, `Audit keamanan 1–3` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08199643493761141 - nodes in this community are weakly interconnected._
- **Why does `Batas yang diperiksa` connect `TanyaSayaChat` to `scheduler.ts`?**
  _High betweenness centrality (0.376) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `mountGradient()` (e.g. with `.isLost()` and `.renderFrame()`) actually correct?**
  _`mountGradient()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `channels.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0927536231884058 - nodes in this community are weakly interconnected._