export type Bindings = {
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  AI: Ai;
  ASSETS: Fetcher;
  ADMIN_PASSWORD?: string;
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  CEREBRAS_API_KEY?: string;
  SAMBANOVA_API_KEY?: string;
  HF_TOKEN?: string;
  LLM_CHAIN?: unknown;
  SYSTEM_PROMPT?: string;
  ALLOWED_ORIGINS?: unknown;
  MIN_SCORE?: number | string;
};

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type Source = {
  number: number;
  label: string;
  document: string;
  snippet: string;
  score: number;
};

/** NDJSON events streamed to the widget and the admin playground. */
export type ChatEvent =
  | { type: 'sources'; items: Source[] }
  | { type: 'delta'; text: string }
  | { type: 'done'; refused: boolean; provider?: string; model?: string; ms: number }
  | { type: 'error'; message: string }
  | { type: 'debug'; data: unknown };
