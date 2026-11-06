import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEYED_PROVIDERS, PROVIDERS, tenantEnv } from '../../src/settings.ts';
import { adaptBody, endpointFor } from '../../src/openai-compat.ts';
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

test('every provider has an https base URL and its own secret name', () => {
  const secrets = new Set<string>();
  for (const p of KEYED_PROVIDERS) {
    assert.match(PROVIDERS[p].baseUrl, /^https:\/\/[a-z0-9.-]+\//, p);
    assert.ok(!secrets.has(PROVIDERS[p].secret), `duplicate secret ${PROVIDERS[p].secret}`);
    secrets.add(PROVIDERS[p].secret);
  }
  for (const p of ['cohere', 'nvidia', 'mistral', 'cloudflare', 'openai']) assert.ok((KEYED_PROVIDERS as string[]).includes(p), p);
});

test('Workers AI over REST takes ACCOUNT_ID:API_TOKEN and rejects anything that could change the URL', () => {
  const base = 'https://api.cloudflare.com/client/v4/accounts/{account}/ai/v1';
  const acc = '0123456789abcdef0123456789abcdef';
  assert.deepEqual(endpointFor(base, `${acc}:tok-123`), { url: `https://api.cloudflare.com/client/v4/accounts/${acc}/ai/v1/chat/completions`, token: 'tok-123' });
  assert.equal(endpointFor(base, 'tok-only'), null);
  assert.equal(endpointFor(base, '../../evil:tok'), null);
  assert.equal(endpointFor(base, `${acc}:`), null);
  assert.deepEqual(endpointFor('https://api.mistral.ai/v1', 'k'), { url: 'https://api.mistral.ai/v1/chat/completions', token: 'k' });
});
