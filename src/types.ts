import type { User } from './auth';

export type Bindings = {
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  AI: Ai;
  ASSETS: Fetcher;
  ADMIN_PASSWORD?: string;
  /** Random token minted by the deploy workflow on every run (never shown to anyone). It can only
   *  index the reference document and connect Telegram, so a fresh install works without ADMIN_PASSWORD. */
  DEPLOY_TOKEN?: string;
  /** Set by tenantEnv() for user bots: limits them to the allow-listed Workers AI models. */
  TENANT_BOT?: string;
  /** Optional caps for the multi-user platform (wrangler vars). */
  PLATFORM_DAILY_TOTAL?: string | number;
  MAX_SIGNUPS_PER_DAY?: string | number;
  PLATFORM_DAILY_EMBEDS?: string | number;
  /** Comma-separated bot ids whose owner accounts never expire (e.g. the bot TSbot shows). */
  PERMANENT_BOTS?: string;
  /** Comma-separated e-mail addresses whose accounts never expire (e.g. the site owner's). */
  PERMANENT_EMAILS?: string;
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  CEREBRAS_API_KEY?: string;
  SAMBANOVA_API_KEY?: string;
  HF_TOKEN?: string;
  DEEPSEEK_API_KEY?: string;
  MOONSHOT_API_KEY?: string;
  ZAI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  CF_WORKERS_AI_KEY?: string;
  COHERE_API_KEY?: string;
  NVIDIA_API_KEY?: string;
  MISTRAL_API_KEY?: string;
  TOGETHER_API_KEY?: string;
  FIREWORKS_API_KEY?: string;
  XAI_API_KEY?: string;
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
  /** `text`, when present, is the final answer after the citation check and replaces the streamed text. */
  | { type: 'done'; refused: boolean; provider?: string; model?: string; ms: number; text?: string; grounded?: boolean; sig?: string }
  | { type: 'error'; message: string }
  | { type: 'debug'; data: unknown };

/** Who is calling the admin API: a signed-in user, the platform admin or the deploy token. */
export type Principal = { kind: 'platform' | 'deploy' } | { kind: 'user'; user: User };
/** Hono environment shared by every route module. */
export type AppEnv = { Bindings: Bindings; Variables: { bot: string; principal: Principal } };
