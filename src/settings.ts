import type { Bindings } from './types';

/* ------------------------------------------------------------------ */
/*  Provider registry                                                  */
/* ------------------------------------------------------------------ */

export const PROVIDERS = {
  'workers-ai': { name: 'Workers AI (Cloudflare)', baseUrl: '', secret: '' },
  gemini: { name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', secret: 'GEMINI_API_KEY' },
  groq: { name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', secret: 'GROQ_API_KEY' },
  openrouter: { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', secret: 'OPENROUTER_API_KEY' },
  cerebras: { name: 'Cerebras', baseUrl: 'https://api.cerebras.ai/v1', secret: 'CEREBRAS_API_KEY' },
  sambanova: { name: 'SambaNova', baseUrl: 'https://api.sambanova.ai/v1', secret: 'SAMBANOVA_API_KEY' },
  huggingface: { name: 'Hugging Face Router', baseUrl: 'https://router.huggingface.co/v1', secret: 'HF_TOKEN' },
  // VERIFY: base URLs and model ids of the providers below against each provider's current docs.
  deepseek: { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', secret: 'DEEPSEEK_API_KEY' },
  moonshot: { name: 'Kimi (Moonshot AI)', baseUrl: 'https://api.moonshot.ai/v1', secret: 'MOONSHOT_API_KEY' },
  zai: { name: 'GLM (Z.ai / Zhipu)', baseUrl: 'https://api.z.ai/api/paas/v4', secret: 'ZAI_API_KEY' },
} as const;

export type ProviderId = keyof typeof PROVIDERS;
export const KEYED_PROVIDERS = (Object.keys(PROVIDERS) as ProviderId[]).filter((p) => p !== 'workers-ai');

/** Workers AI models that are still active after the May 2026 catalog refresh. */
export const WORKERS_AI_PRIMARY = '@cf/zai-org/glm-4.7-flash';
export const WORKERS_AI_BACKUP = '@cf/meta/llama-3.1-8b-instruct-fast';
export const EMBEDDING_MODEL = '@cf/baai/bge-m3'; // 1024 dimensi, multibahasa
// VERIFY: gemini-embedding-2 accepts outputDimensionality 1024 (Matryoshka truncation). Every embedder in this
// app writes 1024-dim vectors so one Vectorize index serves Gemini and Workers AI bge-m3 alike.
export const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-2';
export const VECTOR_DIM = 1024;
export type Embedder = 'gemini' | 'workers-ai';
export type Lang = 'id' | 'en';
export const asLang = (v: unknown, fallback: Lang = 'id'): Lang => (v === 'en' || v === 'id' ? v : fallback);
export const RERANK_MODEL = '@cf/baai/bge-reranker-base';

export type ChainEntry = { provider: ProviderId; model: string };

/* ------------------------------------------------------------------ */
/*  7-layer prompt                                                     */
/* ------------------------------------------------------------------ */

export type PromptLayers = {
  role: string; // Layer 1 · Peran
  context: string; // Layer 2 · Konteks
  task: string; // Layer 3 · Tugas
  // Layer 4 · Sumber pengetahuan → diisi otomatis dari hasil retrieval
  rules: string; // Layer 5 · Aturan & batasan (tambahan pemilik)
  format: string; // Layer 6 · Format jawaban
  examples: string; // Layer 7 · Contoh & cek mutu
};

export const DEFAULT_LAYERS: PromptLayers = {
  role: 'You are {name}, a friendly, patient and meticulous document assistant.',
  context:
    'You are embedded on the owner\'s website to help visitors understand the document "{document}". Most visitors are non-experts who want a quick, clear answer they can act on.',
  task: 'Answer the visitor\'s question using only the document excerpts provided in <knowledge>. If the question is ambiguous, pick the most reasonable reading and state that assumption in one short clause.',
  rules: '',
  format:
    'Reply in the same language the visitor used (default: Indonesian). Keep it to at most 3 short paragraphs. Use a numbered list for steps and bullet points for itemised details. Bold key numbers, dates or terms with **double asterisks** sparingly. No headings, no tables, no preamble such as "Based on the document".',
  examples:
    '<example>\nVisitor: Berapa lama proses pendaftaran?\nAssistant: Proses pendaftaran memakan waktu **3 hari kerja** setelah berkas dinyatakan lengkap [1].\n</example>\n<example>\nVisitor: Siapa presiden Indonesia sekarang?\nAssistant: Maaf, informasi itu tidak ada di dokumen yang saya miliki. Saya bisa membantu soal pendaftaran, biaya, atau jadwal yang dibahas di dokumen.\n</example>',
};

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

export type RagSettings = {
  chunkSize: number; // karakter target per potongan (dipakai saat unggah)
  chunkOverlap: number; // karakter tumpang-tindih
  candidateK: number; // kandidat dari tiap pencarian (vektor & kata kunci)
  topK: number; // potongan final yang dikirim ke LLM
  minScore: number; // ambang skor kemiripan vektor (0-1)
  hybrid: boolean; // gabungkan pencarian kata kunci (FTS5)
  rerank: boolean; // urutkan ulang dengan cross-encoder
  rerankAuto: boolean; // nyalakan reranker otomatis bila dokumen berbahasa Inggris
  neighborWindow: number; // ambil potongan tetangga ±N
  maxContextChars: number; // batas total konteks
  queryRewrite: boolean; // tulis ulang pertanyaan lanjutan jadi mandiri
  cache: boolean; // cache jawaban semantik (pola GPTCache): pertanyaan yang sama/mirip tidak memanggil AI lagi
  cacheThreshold: number; // kemiripan minimum (cosine) agar jawaban cache dipakai ulang
};

export type BotSettings = {
  name: string;
  language: Lang; // default language for visitors whose browser language is unknown
  greeting: string;
  greetingEn: string;
  suggestions: string[];
  suggestionsEn: string[];
  refusalMessage: string;
  refusalMessageEn: string;
  launcherLabel: string;
  launcherLabelEn: string;
  themeColor: string;
  prompt: PromptLayers;
  chain: ChainEntry[];
  workersAiFallback: boolean;
  embeddingProvider: 'auto' | Embedder;
  temperature: number;
  maxTokens: number;
  reasoningEffort: '' | 'none' | 'low' | 'medium' | 'high';
  rag: RagSettings;
  limits: { maxQuestionLength: number; maxHistory: number; requestsPerMinute: number; dailyPerIp: number; dailyTotal: number };
  allowedOrigins: string[];
  logQuestions: boolean;
};

export const DEFAULT_SETTINGS: BotSettings = {
  name: 'Nara',
  language: 'id',
  greeting: '',
  greetingEn: '',
  suggestions: [],
  suggestionsEn: [],
  refusalMessage: 'Maaf, informasi itu tidak ada di dokumen yang saya miliki.',
  refusalMessageEn: "Sorry, that information isn't in the document I have.",
  launcherLabel: '',
  launcherLabelEn: '',
  themeColor: '#5B3FE0',
  prompt: { ...DEFAULT_LAYERS },
  chain: [
    { provider: 'gemini', model: 'gemini-3.5-flash' },
    { provider: 'gemini', model: 'gemini-3.5-flash-lite' },
    { provider: 'huggingface', model: 'openai/gpt-oss-120b' },
  ],
  workersAiFallback: true,
  embeddingProvider: 'auto',
  temperature: 0.2,
  maxTokens: 1024,
  reasoningEffort: 'low',
  rag: {
    chunkSize: 1000,
    chunkOverlap: 150,
    candidateK: 20,
    topK: 5,
    minScore: 0.4,
    hybrid: true,
    rerank: false,
    rerankAuto: true,
    neighborWindow: 1,
    maxContextChars: 9000,
    queryRewrite: true,
    cache: true,
    cacheThreshold: 0.93,
  },
  limits: { maxQuestionLength: 500, maxHistory: 6, requestsPerMinute: 10, dailyPerIp: 100, dailyTotal: 3000 },
  allowedOrigins: [],
  logQuestions: true,
};

const clamp = (v: unknown, min: number, max: number, def: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
};
const str = (v: unknown, def: string, max = 4000) => (typeof v === 'string' ? v.slice(0, max) : def);
const bool = (v: unknown, def: boolean) => (typeof v === 'boolean' ? v : def);
const strList = (v: unknown) =>
  Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).map((x: string) => x.trim().slice(0, 140)).slice(0, 6) : [];

export function normalizeSettings(input: any): BotSettings {
  const d = DEFAULT_SETTINGS;
  const s = input && typeof input === 'object' ? input : {};
  const p = s.prompt && typeof s.prompt === 'object' ? s.prompt : {};
  const r = s.rag && typeof s.rag === 'object' ? s.rag : {};
  const l = s.limits && typeof s.limits === 'object' ? s.limits : {};

  const chain: ChainEntry[] = Array.isArray(s.chain)
    ? s.chain
        .filter((e: any) => e && typeof e.provider === 'string' && e.provider in PROVIDERS && typeof e.model === 'string' && e.model.trim())
        .slice(0, 8)
        .map((e: any) => ({ provider: e.provider as ProviderId, model: e.model.trim().slice(0, 200) }))
    : d.chain;

  const color = typeof s.themeColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(s.themeColor) ? s.themeColor : d.themeColor;
  const effort = ['', 'none', 'low', 'medium', 'high'].includes(s.reasoningEffort) ? s.reasoningEffort : d.reasoningEffort;

  return {
    name: str(s.name, d.name, 60).trim() || d.name,
    language: asLang(s.language, d.language),
    greeting: str(s.greeting, '', 1000),
    greetingEn: str(s.greetingEn, '', 1000),
    suggestions: strList(s.suggestions),
    suggestionsEn: strList(s.suggestionsEn),
    refusalMessage: str(s.refusalMessage, d.refusalMessage, 300).trim() || d.refusalMessage,
    refusalMessageEn: str(s.refusalMessageEn, d.refusalMessageEn, 300).trim() || d.refusalMessageEn,
    launcherLabel: str(s.launcherLabel, '', 40),
    launcherLabelEn: str(s.launcherLabelEn, '', 40),
    themeColor: color,
    prompt: {
      role: str(p.role, d.prompt.role),
      context: str(p.context, d.prompt.context),
      task: str(p.task, d.prompt.task),
      rules: str(p.rules, d.prompt.rules),
      format: str(p.format, d.prompt.format),
      examples: str(p.examples, d.prompt.examples),
    },
    chain: chain.length ? chain : d.chain,
    workersAiFallback: bool(s.workersAiFallback, d.workersAiFallback),
    embeddingProvider: ['auto', 'gemini', 'workers-ai'].includes(s.embeddingProvider) ? s.embeddingProvider : d.embeddingProvider,
    temperature: clamp(s.temperature, 0, 1.5, d.temperature),
    maxTokens: Math.round(clamp(s.maxTokens, 128, 4096, d.maxTokens)),
    reasoningEffort: effort,
    rag: {
      chunkSize: Math.round(clamp(r.chunkSize, 300, 3000, d.rag.chunkSize)),
      chunkOverlap: Math.round(clamp(r.chunkOverlap, 0, 500, d.rag.chunkOverlap)),
      candidateK: Math.round(clamp(r.candidateK, 5, 50, d.rag.candidateK)),
      topK: Math.round(clamp(r.topK, 1, 12, d.rag.topK)),
      minScore: clamp(r.minScore, 0, 0.95, d.rag.minScore),
      hybrid: bool(r.hybrid, d.rag.hybrid),
      rerank: bool(r.rerank, d.rag.rerank),
      rerankAuto: bool(r.rerankAuto, d.rag.rerankAuto),
      neighborWindow: Math.round(clamp(r.neighborWindow, 0, 2, d.rag.neighborWindow)),
      maxContextChars: Math.round(clamp(r.maxContextChars, 2000, 24000, d.rag.maxContextChars)),
      queryRewrite: bool(r.queryRewrite, d.rag.queryRewrite),
      cache: bool(r.cache, d.rag.cache),
      cacheThreshold: clamp(r.cacheThreshold, 0.85, 0.99, d.rag.cacheThreshold),
    },
    limits: {
      maxQuestionLength: Math.round(clamp(l.maxQuestionLength, 50, 2000, d.limits.maxQuestionLength)),
      maxHistory: Math.round(clamp(l.maxHistory, 0, 20, d.limits.maxHistory)),
      requestsPerMinute: Math.round(clamp(l.requestsPerMinute, 1, 120, d.limits.requestsPerMinute)),
      dailyPerIp: Math.round(clamp(l.dailyPerIp, 5, 5000, d.limits.dailyPerIp)),
      dailyTotal: Math.round(clamp(l.dailyTotal, 50, 100000, d.limits.dailyTotal)),
    },
    allowedOrigins: Array.isArray(s.allowedOrigins)
      ? s.allowedOrigins
          .filter((o: any) => typeof o === 'string' && /^https?:\/\/[^\s/]+$/.test(o.trim()))
          .map((o: string) => o.trim().toLowerCase())
          .slice(0, 30)
      : [],
    logQuestions: bool(s.logQuestions, d.logQuestions),
  };
}

/* ------------------------------------------------------------------ */
/*  Storage (D1 table `settings`)                                       */
/* ------------------------------------------------------------------ */

export type KeyStore = Partial<Record<ProviderId, string>>;

async function readSetting<T>(db: D1Database, key: string): Promise<T | null> {
  try {
    const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first<{ value: string }>();
    return row ? (JSON.parse(row.value) as T) : null;
  } catch {
    return null;
  }
}

/** Random per-install salt for hashing visitor IPs; created once, never derived from a secret. */
export async function getSalt(db: D1Database): Promise<string> {
  const saved = await readSetting<string>(db, 'salt');
  if (typeof saved === 'string' && saved.length >= 32) return saved;
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const salt = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  await db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').bind('salt', JSON.stringify(salt)).run();
  return (await readSetting<string>(db, 'salt')) || salt;
}

export async function writeSetting(db: D1Database, key: string, value: unknown) {
  await db
    .prepare(
      'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
    )
    .bind(key, JSON.stringify(value))
    .run();
}

/** Settings rows are namespaced per bot; the platform bot keeps the original un-suffixed keys. */
export function settingKey(name: 'bot' | 'keys' | 'auto_suggestions', bot: string): string {
  return bot === 'default' ? name : `${name}:${bot}`;
}

const PROVIDER_SECRETS = ['GEMINI_API_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY', 'CEREBRAS_API_KEY', 'SAMBANOVA_API_KEY', 'HF_TOKEN', 'DEEPSEEK_API_KEY', 'MOONSHOT_API_KEY', 'ZAI_API_KEY', 'LLM_CHAIN', 'SYSTEM_PROMPT', 'MIN_SCORE'] as const;

/**
 * The environment a bot may use. The platform's own provider secrets (and env-level defaults)
 * are only for the platform bot 'default'; user bots see them stripped, so they can only spend
 * keys their owner saved in the dashboard (or the free Workers AI fallback).
 */
export function tenantEnv(env: Bindings, bot: string): Bindings {
  if (bot === 'default') return env;
  const copy = { ...env } as Record<string, unknown>;
  for (const k of PROVIDER_SECRETS) delete copy[k];
  copy.TENANT_BOT = bot;
  return copy as Bindings;
}

export async function deleteSetting(db: D1Database, key: string) {
  await db.prepare('DELETE FROM settings WHERE key = ?').bind(key).run();
}

/** Defaults that come from wrangler vars (only used before the owner saves anything). */
function envDefaults(env: Bindings): BotSettings {
  const base = structuredClone(DEFAULT_SETTINGS);
  if (env.SYSTEM_PROMPT && typeof env.SYSTEM_PROMPT === 'string') base.prompt.role = env.SYSTEM_PROMPT;
  if (env.MIN_SCORE !== undefined) base.rag.minScore = clamp(env.MIN_SCORE, 0, 0.95, base.rag.minScore);
  let chain: any = env.LLM_CHAIN;
  if (typeof chain === 'string') {
    try {
      chain = JSON.parse(chain);
    } catch {
      chain = null;
    }
  }
  if (Array.isArray(chain) && chain.length) base.chain = chain as ChainEntry[];
  return normalizeSettings(base);
}

/** Converts the v1 config shape (ChatProvider / Gemini.ApiKey / HuggingFace.ApiKey …). */
function fromLegacy(name: string, cfg: any): { settings: BotSettings; keys: KeyStore } {
  const keys: KeyStore = {};
  const chain: ChainEntry[] = [];
  if (cfg?.Gemini?.ApiKey) {
    keys.gemini = String(cfg.Gemini.ApiKey);
    chain.push({ provider: 'gemini', model: cfg.Gemini.ChatModel || 'gemini-3.5-flash' });
    if (cfg.Gemini.ChatFallbackModel) chain.push({ provider: 'gemini', model: cfg.Gemini.ChatFallbackModel });
  }
  if (cfg?.HuggingFace?.ApiKey) {
    keys.huggingface = String(cfg.HuggingFace.ApiKey);
    if (cfg.CrossProviderFallback !== false) chain.push({ provider: 'huggingface', model: cfg.HuggingFace.ChatModel || 'openai/gpt-oss-120b' });
  }
  const settings = normalizeSettings({
    name,
    chain: chain.length ? chain : undefined,
    maxTokens: cfg?.HuggingFace?.MaxTokens,
    reasoningEffort: cfg?.Gemini?.ThinkingLevel,
    rag: { topK: cfg?.TopK, minScore: cfg?.MinScore },
    limits: { maxQuestionLength: cfg?.MaxQuestionLength, maxHistory: cfg?.MaxHistory, requestsPerMinute: cfg?.RequestsPerMinute },
  });
  return { settings, keys };
}

export async function getSettings(env: Bindings, bot = 'default'): Promise<BotSettings> {
  const saved = await readSetting<BotSettings>(env.DB, settingKey('bot', bot));
  if (saved) return normalizeSettings(saved);
  if (bot !== 'default') return normalizeSettings(structuredClone(DEFAULT_SETTINGS));

  // Migrasi sekali jalan dari tabel lama `bot_config`
  try {
    const row = await env.DB.prepare('SELECT name, config_json FROM bot_config LIMIT 1').first<{ name: string; config_json: string }>();
    if (row?.config_json) {
      const { settings, keys } = fromLegacy(row.name, JSON.parse(row.config_json));
      await writeSetting(env.DB, 'bot', settings);
      if (Object.keys(keys).length) await writeSetting(env.DB, 'keys', keys);
      await env.DB.prepare('DELETE FROM bot_config').run();
      return settings;
    }
  } catch {
    /* tabel lama mungkin tidak ada */
  }
  return envDefaults(env);
}

export async function getKeys(env: Bindings, bot = 'default'): Promise<KeyStore> {
  return (await readSetting<KeyStore>(env.DB, settingKey('keys', bot))) || {};
}

export function resolveKey(env: Bindings, keys: KeyStore, provider: ProviderId): string {
  if (provider === 'workers-ai') return '';
  const fromDashboard = keys[provider];
  if (fromDashboard) return fromDashboard;
  const secretName = PROVIDERS[provider].secret as keyof Bindings;
  const v = env[secretName];
  return typeof v === 'string' ? v : '';
}

/** Never returns key material: only where it comes from. */
export function keyStatus(env: Bindings, keys: KeyStore) {
  return KEYED_PROVIDERS.map((id) => {
    const secretName = PROVIDERS[id].secret as keyof Bindings;
    const source = keys[id] ? 'dashboard' : env[secretName] ? 'secret' : null;
    return { id, name: PROVIDERS[id].name, secret: PROVIDERS[id].secret, configured: !!source, source };
  });
}

export type Suggestions = { id: string[]; en: string[] };
export async function getSuggestions(env: Bindings, bot = 'default'): Promise<Suggestions> {
  const v = await readSetting<Suggestions | string[]>(env.DB, settingKey('auto_suggestions', bot));
  if (Array.isArray(v)) return { id: v, en: [] }; // v2.0 stored a single list
  return { id: v?.id || [], en: v?.en || [] };
}

/** Pick the owner's manual text for a language, falling back to the other language. */
export function refusalFor(s: BotSettings, lang: Lang) {
  return lang === 'en' ? s.refusalMessageEn : s.refusalMessage;
}
