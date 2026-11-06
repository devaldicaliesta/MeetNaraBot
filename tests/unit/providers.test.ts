import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEYED_PROVIDERS, PROVIDERS, tenantEnv } from '../../src/settings.ts';
import { adaptBody } from '../../src/openai-compat.ts';
import type { Bindings } from '../../src/types.ts';

test('user bots never see any platform provider key, including OpenAI', () => {
  const env = Object.fromEntries(KEYED_PROVIDERS.map((p) => [PROVIDERS[p].secret, 'platform-key'])) as unknown as Bindings;
  const user = tenantEnv(env, 'abc123') as unknown as Record<string, unknown>;
  for (const p of KEYED_PROVIDERS) assert.equal(user[PROVIDERS[p].secret], undefined, PROVIDERS[p].secret);
  assert.equal((tenantEnv(env, 'default') as any).OPENAI_API_KEY, 'platform-key');
});

test('OpenAI requests use max_completion_tokens and drop temperature for reasoning models', () => {
  const base = () => ({ model: 'm', messages: [], temperature: 0.2, max_tokens: 700, stream: true });
  const reasoning = adaptBody('openai', 'gpt-5-mini', base(), 'low');
  assert.equal(reasoning.max_tokens, undefined);
  assert.equal(reasoning.max_completion_tokens, 700);
  assert.equal(reasoning.temperature, undefined);
  assert.equal(reasoning.reasoning_effort, 'low');
  assert.equal(adaptBody('openai', 'o4-mini', base(), 'none').reasoning_effort, undefined);
  const classic = adaptBody('openai', 'gpt-4.1-mini', base(), 'low');
  assert.equal(classic.max_completion_tokens, 700);
  assert.equal(classic.temperature, 0.2);
  assert.equal(classic.reasoning_effort, undefined);
  const other = adaptBody('groq', 'llama-3.3-70b-versatile', base(), 'low');
  assert.equal(other.max_tokens, 700);
  assert.equal(other.max_completion_tokens, undefined);
  assert.equal(adaptBody('gemini', 'gemini-3.5-flash', base(), 'low').reasoning_effort, 'low');
});
