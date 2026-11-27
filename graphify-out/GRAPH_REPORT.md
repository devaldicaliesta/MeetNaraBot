# Graph Report - MeetNaraBot  (2026-11-27)

## Corpus Check
- 136 files · ~137,659 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 8, .css 3, .example 1)

## Summary
- 1105 nodes · 2213 edges · 77 communities (56 shown, 21 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 81 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0a1d283e`
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
- with
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
- WebGPULease
- deploy
- Nara: catatan untuk Claude
- scheduler.ts
- guard.ts
- TSbot
- kind.ts
- GradientKindDefinition
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
- backend.ts
- channels.spec.ts
- 0004_accounts.sql
- Nara platform (chatbot dokumen)
- probeCopyPath
- kinds.ts
- createUser
- stripInvisible
- start-worker.mjs
- WgpuEncoder
- uniforms.ts
- shaders/radial-glow.ts
- WgpuPass
- src/types.ts
- build-tsbot.mjs
- retrieve
- playwright.config.ts
- serve-tsbot.mjs
- pick
- shaders/grain.ts
- scripts
- shaders/limb.ts
- loginKeys
- shaders/mist.ts
- shaders/ribbon.ts
- shaders/halo.ts
- Audit keamanan run 5 (2026-11): TSbot, IMTS, dan akun permanen
- shaders/rise.ts
- shaders/linear-flow.ts
- shaders/silk.ts
- shaders/void.ts
- shaders/dither-field.ts
- GradientBackend
- shaders/waves.ts
- shaders/smear.ts
- WgpuGpu
- shaders/chrome.ts

## God Nodes (most connected - your core abstractions)
1. `answer()` - 31 edges
2. `GradientKindDefinition` - 27 edges
3. `env` - 25 edges
4. `TanyaSayaChat` - 24 edges
5. `mountGradient()` - 24 edges
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
- `Penguatan tahap 2` --references--> `sameIntent()`  [INFERRED]
  docs/security/audit-2026-11-run5.md → src/cache.ts
- `Temuan` --references--> `sameIntent()`  [INFERRED]
  docs/security/tsbot-audit-2026-11-run2.md → src/cache.ts
- `Batas yang diperiksa` --references--> `storeAnswer()`  [INFERRED]
  docs/security/audit-2026-11-run4.md → src/cache.ts

## Import Cycles
- None detected.

## Communities (77 total, 21 thin omitted)

### Community 0 - "src/index.ts"
Cohesion: 0.09
Nodes (19): Tambahan: banyak dokumen per bot dan penyedia OpenAI, Dashboard pemilik bot, activeFile(), app, documentsLabel(), Env, FileRow, hits (+11 more)

### Community 1 - "settings.ts"
Cohesion: 0.08
Nodes (46): settings, Rantai penyedia LLM + failover, AllProvidersFailed, assertWorkersAiModel(), bodyFor(), buildChain(), completeChat(), deltaFrom() (+38 more)

### Community 2 - "channels.ts"
Cohesion: 0.09
Nodes (42): channel_history, channel_seen, idx_channel_history_updated, bodyTooLarge(), channelCommand(), citedSources(), clip(), clipHtml() (+34 more)

### Community 3 - "rag.ts"
Cohesion: 0.12
Nodes (25): paint(), cacheScope(), sha256(), hasPii(), injectionReply(), benv(), answer(), AnswerInput (+17 more)

### Community 4 - "TanyaSayaChat"
Cohesion: 0.13
Nodes (11): Audit keamanan TSbot (2026-11), Batas yang diperiksa, Hasil, Landing page + widget demo, esc(), inkFor(), inline(), markdown() (+3 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, hono@^4.7.2, devDependencies, @cloudflare/workers-types@^5.20261101.0, esbuild@0.28.2, @playwright/test@1.63.0, typescript@^5.7.3, wrangler@^4.40.0 (+12 more)

### Community 6 - "gradient-engine/index.ts"
Cohesion: 0.14
Nodes (24): backendFor(), grainLayer(), staticFallbackCss(), getKind(), kindDefaults(), fullTarget(), LIVE_FPS, LOOP_RADIUS (+16 more)

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
Cohesion: 0.17
Nodes (21): answer_cache, idx_answer_cache_exact, idx_answer_cache_recent, Cache jawaban semantik (pola GPTCache), CACHE_TTL_DAYS, CacheHit, cacheStats(), clearCache() (+13 more)

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

### Community 16 - "ref_node_fs"
Cohesion: 0.28
Nodes (4): OUT, ROOT, OUT, SRC

### Community 17 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 18 - "graph.yml"
Cohesion: 0.10
Nodes (19): concurrency, cancel-in-progress, group, runs-on, steps, jobs, graph, name (+11 more)

### Community 19 - "WebGPULease"
Cohesion: 0.17
Nodes (6): Oklab, packUniforms(), removeSurface(), WebGPULease, WgpuBuffer, WgpuPipeline

### Community 20 - "deploy"
Cohesion: 0.22
Nodes (9): env, needs, runs-on, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, jobs, deploy, qa (+1 more)

### Community 22 - "Nara: catatan untuk Claude"
Cohesion: 0.25
Nodes (6): Gradien Mercury (gradients.sh), Kerja UI dan teks: DESIGN.md + antislop, Mulai dari graph kode (hemat token), Nara: catatan untuk Claude, Pemeriksaan sebelum push, Wajib: perbarui graph di setiap perubahan

### Community 23 - "scheduler.ts"
Cohesion: 0.08
Nodes (39): BackendName, liveContextCount(), assignQuality(), ContextSlot, contextStats(), distanceToViewport(), EngineStats, FrameQuality (+31 more)

### Community 24 - "guard.ts"
Cohesion: 0.14
Nodes (21): Peringatan PII saat unggah, Guardrail data pribadi (PII), Riwayat bertanda tangan HMAC, b64url(), digits(), enc, findPii(), hmacKey() (+13 more)

### Community 25 - "TSbot"
Cohesion: 0.33
Nodes (5): Build dan uji lokal, Halaman IMTS (https://imtsbot.pages.dev), Pengaturan sekali, Tampilan dan menu kategori, TSbot

### Community 26 - "kind.ts"
Cohesion: 0.16
Nodes (7): stops(), ditherBurst, fluted, spectrum, wgsl, wgsl, wgsl

### Community 27 - "GradientKindDefinition"
Cohesion: 0.22
Nodes (5): GradientKindDefinition, horizon, BLOBS, wgsl, wgsl

### Community 28 - "0002_rag_upgrade.sql"
Cohesion: 0.29
Nodes (7): chat_log, chunks_fts, idx_chat_log_created, usage, idx_chat_log_bot, logChat(), spendPlatform()

### Community 29 - "webgpu-device.ts"
Cohesion: 0.09
Nodes (26): acquireSurface(), adapterRefusal(), describe(), deviceLost(), fail(), isWgpuContext(), isWgpuGpu(), leasedBytes() (+18 more)

### Community 30 - "export.ts"
Cohesion: 0.14
Nodes (27): FALLBACK_RGB, getProbe(), hasCssVariable(), linearToSrgb(), literalCache, oklabToSrgb(), parseChannel(), parseColorLiteral() (+19 more)

### Community 31 - "webgpu.ts"
Cohesion: 0.11
Nodes (18): acquireSurface(), BackendPreference, changeListeners, setWebGPUMemoryCap(), hasWebGPU(), isPreference(), load(), MAX_WEBGPU_SURFACES (+10 more)

### Community 32 - "purgeBot"
Cohesion: 0.18
Nodes (12): Audit keamanan run 4 (2026-11), Batas yang diperiksa, Hasil, vector_tombstones, Akun 7 hari + cron pembersihan, listBots(), deleteVectors(), purgeAccount() (+4 more)

### Community 33 - "renderer.ts"
Cohesion: 0.14
Nodes (14): ExportRenderer, mergeParams(), compile(), ContextOptions, createWebGLRenderer(), ProgramInfo, ShaderError, UniformName (+6 more)

### Community 34 - "reseed"
Cohesion: 0.22
Nodes (9): reseed, on, push, workflow_dispatch, branches, default, description, type (+1 more)

### Community 35 - "params.ts"
Cohesion: 0.34
Nodes (14): boolean(), clamp(), fullParams(), integer(), normalizeParams(), number(), parseParams(), partialDither() (+6 more)

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

### Community 40 - "backend.ts"
Cohesion: 0.13
Nodes (20): BackendLease, webglBackend, webgpuBackend, defaultParams, acquireContext(), changeListeners, contexts, create() (+12 more)

### Community 41 - "channels.spec.ts"
Cohesion: 0.16
Nodes (7): FAKE_API_PORT, Call, startFakeChatApi(), fake, TG_SECRET, admin, fake

### Community 42 - "0004_accounts.sql"
Cohesion: 0.15
Nodes (15): bot_config, chunks, file, idx_chunks_idx, bots, idx_bots_owner, idx_chunks_bot_idx, idx_file_bot (+7 more)

### Community 43 - "Nara platform (chatbot dokumen)"
Cohesion: 0.33
Nodes (6): Dokumen referensi bot demo Nara, Prompt 7 layer untuk membangun ulang proyek, Paket gratis Cloudflare Workers/D1/Vectorize, Nara platform (chatbot dokumen), Prompt 7 layer (strict grounding), DEFAULT_LAYERS

### Community 45 - "kinds.ts"
Cohesion: 0.20
Nodes (7): listKinds(), registerKind(), registry, pixelGlass, swirl, wgsl, wgsl

### Community 46 - "createUser"
Cohesion: 0.39
Nodes (9): changePassword(), createSession(), createUser(), endSession(), hex(), newId(), pbkdf2(), random() (+1 more)

### Community 47 - "stripInvisible"
Cohesion: 0.24
Nodes (9): Audit keamanan TSbot, run 2 (2026-11), Bukti, Catatan alat, Pengerasan dan bug lain yang ikut diperbaiki, Temuan, Guardrail prompt injection, detectInjection(), stripInvisible() (+1 more)

### Community 48 - "start-worker.mjs"
Cohesion: 0.15
Nodes (11): args, child, chunks, doc(), future, past, [port, fakePort, password], q() (+3 more)

### Community 50 - "uniforms.ts"
Cohesion: 0.62
Nodes (6): grainFrame(), loopVector(), loopVectorAtPhase(), FrameUniforms, frameUniforms(), seedOffset()

### Community 53 - "src/types.ts"
Cohesion: 0.29
Nodes (6): User, AppEnv, ChatEvent, ChatMessage, Principal, Source

### Community 54 - "build-tsbot.mjs"
Cohesion: 0.22
Nodes (11): bot, checkMenu(), frames, menu, menuJson, OUT, ROOT, SRC (+3 more)

### Community 55 - "retrieve"
Cohesion: 0.50
Nodes (5): chunks_fts, Hybrid search (vektor + BM25 + RRF), Gerbang skor sebelum AI, ftsQuery(), retrieve()

### Community 56 - "playwright.config.ts"
Cohesion: 0.23
Nodes (6): IMTS_PORT, OTHER_PORT, QA_PASSWORD, TSBOT_PORT, @playwright/test, MENU

### Community 58 - "pick"
Cohesion: 0.22
Nodes (5): pick(), aurora, beam, wgsl, wgsl

### Community 60 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build:gradient, db:migrate, deploy, dev, dev:mock, qa, test:e2e (+2 more)

### Community 62 - "loginKeys"
Cohesion: 0.16
Nodes (13): Audit keamanan 1–3, Kunci login per IP/email, dailyQuota(), ip(), loginKeys(), loginLocked(), loginWindow(), platformDailyTotal() (+5 more)

### Community 66 - "Audit keamanan run 5 (2026-11): TSbot, IMTS, dan akun permanen"
Cohesion: 0.25
Nodes (7): Audit keamanan run 5 (2026-11): TSbot, IMTS, dan akun permanen, Catatan yang tetap berlaku, Hasil, Penguatan tahap 2, Penguatan yang diterapkan (bukan temuan), Pengujian, getPlatform()

## Knowledge Gaps
- **11 isolated node(s):** `Device`, `Dashboard pemilik bot`, `DEPLOY_TOKEN satu kali pakai`, `Peringatan PII saat unggah`, `Akun 7 hari + cron pembersihan` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 394 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Batas yang diperiksa` connect `TanyaSayaChat` to `scheduler.ts`?**
  _High betweenness centrality (0.375) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `answer()` (e.g. with `Temuan` and `paint()`) actually correct?**
  _`answer()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Device`, `Dashboard pemilik bot`, `DEPLOY_TOKEN satu kali pakai` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09113300492610837 - nodes in this community are weakly interconnected._
- **Why does `run()` connect `scheduler.ts` to `backend.ts`, `TanyaSayaChat`?**
  _High betweenness centrality (0.373) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `mountGradient()` (e.g. with `.isLost()` and `.renderFrame()`) actually correct?**
  _`mountGradient()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._