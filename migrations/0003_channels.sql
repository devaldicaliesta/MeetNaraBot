-- Nara v3: Telegram and WhatsApp channels.

-- Short conversation memory per chat. `id` is a salted hash of "<channel>:<chat id>", so raw
-- phone numbers and Telegram IDs are never stored. Rows idle for more than a day are pruned.
CREATE TABLE IF NOT EXISTS channel_history (
  id TEXT PRIMARY KEY,
  history TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_channel_history_updated ON channel_history(updated_at);

-- Delivered message IDs, so webhook retries are answered only once. Pruned after a day.
CREATE TABLE IF NOT EXISTS channel_seen (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
