import { defineConfig, devices } from '@playwright/test';

// Three QA targets:
//  - "ui": landing page, widget and dashboard against the local mock server (no Cloudflare needed).
//  - "tsbot": the TSbot Pages build (tsbot/dist with its _headers) against the mock, plus iframe hosts.
//  - "worker": the real Worker running locally (wrangler dev --local, local D1) for security
//    headers, admin lockout, body limits, and the Telegram/WhatsApp webhooks against a fake
//    chat-app API. No real keys, no network calls to Telegram, Meta, Google or Cloudflare.
const MOCK_PORT = 8799;
const WORKER_PORT = 8788;
export const FAKE_API_PORT = 8899;
export const QA_PASSWORD = 'qa-password-1234';
export const TSBOT_PORT = 8801;
export const IMTS_PORT = 8802;
export const OTHER_PORT = 8803;

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]] : 'list',
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure', locale: 'id-ID' },
  projects: [
    { name: 'ui', testMatch: /ui\/.*\.spec\.ts/, use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${MOCK_PORT}` } },
    { name: 'tsbot', testMatch: /tsbot\/.*\.spec\.ts/, use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${TSBOT_PORT}` } },
    { name: 'worker', testMatch: /worker\/.*\.spec\.ts/, use: { baseURL: `http://127.0.0.1:${WORKER_PORT}` } },
  ],
  webServer: [
    {
      command: `node dev-server.mjs`,
      env: { PORT: String(MOCK_PORT), ADMIN_PASSWORD: QA_PASSWORD },
      url: `http://127.0.0.1:${MOCK_PORT}/api/public/info`,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `node tests/support/serve-tsbot.mjs ${TSBOT_PORT} ${MOCK_PORT} ${IMTS_PORT} ${OTHER_PORT}`,
      url: `http://127.0.0.1:${TSBOT_PORT}/`,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `node tests/support/start-worker.mjs ${WORKER_PORT} ${FAKE_API_PORT} ${QA_PASSWORD}`,
      url: `http://127.0.0.1:${WORKER_PORT}/api/health`,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
