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
