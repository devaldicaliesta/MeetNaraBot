/**
 * Per-provider tweaks to an OpenAI-style chat completion body. Pure, no imports, so unit tests can load it.
 */

/** OpenAI reasoning models (gpt-5 family, o-series) reject a custom temperature. */
export const isOpenAiReasoning = (model: string) => /^(?:gpt-5|o\d)/i.test(model);

export function adaptBody(provider: string, model: string, body: Record<string, unknown>, reasoningEffort: string): Record<string, unknown> {
  const effort = reasoningEffortFor(provider, model, reasoningEffort);
  if (effort) body.reasoning_effort = effort;
  if (provider === 'openai') {
    // OpenAI replaced max_tokens with max_completion_tokens; reasoning models refuse the old name.
    body.max_completion_tokens = body.max_tokens;
    delete body.max_tokens;
    // Reasoning models only accept the default temperature.
    if (isOpenAiReasoning(model)) delete body.temperature;
  }
  return body;
}

/**
 * Chat-completions URL and bearer token for a provider. A base URL with `{account}` (Workers AI over
 * REST) takes a key of the form "<32-hex account id>:<API token>"; the account id is validated
 * strictly before it goes into the URL. Returns null when such a key is malformed.
 */
export function endpointFor(baseUrl: string, key: string): { url: string; token: string } | null {
  if (!baseUrl.includes('{account}')) return { url: `${baseUrl}/chat/completions`, token: key };
  const acc = parseAccountKey(key);
  return acc ? { url: `${baseUrl.replace('{account}', acc.account)}/chat/completions`, token: acc.token } : null;
}

/** "<32-hex account id>:<API token>" → its parts, or null. */
export function parseAccountKey(key: string): { account: string; token: string } | null {
  const i = key.indexOf(':');
  const account = key.slice(0, i).trim().toLowerCase();
  const token = key.slice(i + 1).trim();
  return i < 0 || !/^[0-9a-f]{32}$/.test(account) || !token ? null : { account, token };
}

/** Providers and models that accept `reasoning_effort` ('none' only where it is documented). */
export function reasoningEffortFor(provider: string, model: string, effort: string): string | undefined {
  if (!effort) return undefined;
  if (provider === 'gemini') return effort;
  if (effort === 'none') return undefined;
  if (provider === 'openai' && isOpenAiReasoning(model)) return effort;
  if (/gpt-oss/i.test(model)) return effort; // Groq, Cerebras, OpenRouter, HF, Together, Fireworks, NVIDIA, Workers AI
  if (provider === 'xai' && /grok-3-mini/i.test(model)) return effort === 'medium' ? 'low' : effort; // low | high
  return undefined;
}
