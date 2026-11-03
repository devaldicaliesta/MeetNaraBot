-- Nara v4: accounts and one-or-more bots per user. Every bot's data is scoped by bot_id.
-- The platform's own demo bot keeps the id 'default' and is managed with ADMIN_PASSWORD.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL DEFAULT '',
  pass_hash TEXT NOT NULL,        -- PBKDF2-SHA256, hex
  pass_salt TEXT NOT NULL,        -- 16 random bytes, hex
  pass_iter INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT,
  -- Accounts are active for a fixed period (7 days). After that they cannot sign in, their bots
  -- stop answering, and the daily cleanup deletes the account and all of its data.
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_expires ON users(expires_at);

-- Only a SHA-256 of the session token is stored, so a database leak does not leak live sessions.
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS bots (
  id TEXT PRIMARY KEY,            -- public id used by the widget, e.g. "k3x9m2q7pa"
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bots_owner ON bots(owner_id);

-- Vector ids whose deletion failed (e.g. Vectorize briefly unavailable); the daily cron retries them,
-- so deleted bots never leave embeddings behind.
CREATE TABLE IF NOT EXISTS vector_tombstones (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Scope existing tables by bot. Existing rows belong to the platform bot 'default'.
ALTER TABLE file ADD COLUMN bot_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE chunks ADD COLUMN bot_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE chat_log ADD COLUMN bot_id TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS idx_file_bot ON file(bot_id);
CREATE INDEX IF NOT EXISTS idx_chunks_bot_idx ON chunks(bot_id, idx);
CREATE INDEX IF NOT EXISTS idx_chat_log_bot ON chat_log(bot_id, id);

-- FTS5 tables cannot gain columns, so rebuild the keyword index with a bot_id column.
DROP TABLE IF EXISTS chunks_fts;
CREATE VIRTUAL TABLE chunks_fts USING fts5(
  chunk_id UNINDEXED,
  bot_id UNINDEXED,
  label,
  text,
  tokenize = 'unicode61 remove_diacritics 2'
);
INSERT INTO chunks_fts (chunk_id, bot_id, label, text) SELECT id, bot_id, label, text FROM chunks;
