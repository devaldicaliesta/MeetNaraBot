/**
 * Per-provider tweaks to an OpenAI-style chat completion body. Pure, no imports, so unit tests can load it.
 */

/** OpenAI reasoning models (gpt-5 family, o-series) reject a custom temperature. */
export const isOpenAiReasoning = (model: string) => /^(?:gpt-5|o\d)/i.test(model);

export function adaptBody(provider: string, model: string, body: Record<string, unknown>, reasoningEffort: string): Record<string, unknown> {
  if (provider === 'gemini' && reasoningEffort) body.reasoning_effort = reasoningEffort;
  if (provider === 'openai') {
    // OpenAI replaced max_tokens with max_completion_tokens; reasoning models refuse the old name.
    body.max_completion_tokens = body.max_tokens;
    delete body.max_tokens;
    if (isOpenAiReasoning(model)) {
      delete body.temperature;
      // 'none' is not accepted by every OpenAI reasoning model, so it is left to the model's default.
      if (reasoningEffort && reasoningEffort !== 'none') body.reasoning_effort = reasoningEffort;
    }
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
  const i = key.indexOf(':');
  const account = key.slice(0, i).trim().toLowerCase();
  const token = key.slice(i + 1).trim();
  if (i < 0 || !/^[0-9a-f]{32}$/.test(account) || !token) return null;
  return { url: `${baseUrl.replace('{account}', account)}/chat/completions`, token };
}
