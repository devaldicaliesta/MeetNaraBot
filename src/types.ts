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
  /** Telegram bot token from @BotFather. Enables the /api/channels/telegram webhook. */
  TELEGRAM_BOT_TOKEN?: string;
  /** WhatsApp Cloud API (Meta): permanent access token, phone number ID, webhook verify token and app secret. */
  WHATSAPP_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  WHATSAPP_VERIFY_TOKEN?: string;
  WHATSAPP_APP_SECRET?: string;
  /** Test-only overrides for the chat-app API hosts (point them at a local fake server in QA). */
  TELEGRAM_API_BASE?: string;
  WHATSAPP_API_BASE?: string;
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
