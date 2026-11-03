-- TanyaSaya v2: settings store, hybrid search (FTS5), question log, daily quota.

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Which embedding model produced this file's vectors (query must use the same one).
ALTER TABLE file ADD COLUMN embedder TEXT DEFAULT 'workers-ai';

CREATE INDEX IF NOT EXISTS idx_chunks_idx ON chunks(idx);

-- Keyword index for hybrid retrieval. Column weights in queries: label 2.0, text 1.0.
CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
  chunk_id UNINDEXED,
  label,
  text,
  tokenize = 'unicode61 remove_diacritics 2'
);
INSERT INTO chunks_fts (chunk_id, label, text) SELECT id, label, text FROM chunks;

CREATE TABLE IF NOT EXISTS chat_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  source TEXT NOT NULL DEFAULT 'widget',   -- 'widget' = real visitors, 'admin' = owner tests
  question TEXT NOT NULL,
  answer TEXT,
  refused INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  provider TEXT,
  best_score REAL
);
CREATE INDEX IF NOT EXISTS idx_chat_log_created ON chat_log(created_at);

-- Daily request counters (visitor IP stored only as a salted daily hash).
CREATE TABLE IF NOT EXISTS usage (
  day TEXT NOT NULL,
  key TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, key)
);
