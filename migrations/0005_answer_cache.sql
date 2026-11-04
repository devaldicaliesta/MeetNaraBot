-- Nara v5: semantic answer cache (design after GPTCache, see src/cache.ts).
-- One row per answered standalone question. `scope` is a hash of the document version and every
-- setting that shapes the answer, so stale entries simply stop matching.
CREATE TABLE IF NOT EXISTS answer_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id TEXT NOT NULL,
  scope TEXT NOT NULL,
  norm TEXT NOT NULL,          -- normalised question (exact-match key)
  question TEXT NOT NULL,
  vec TEXT,                    -- L2-normalised int8 embedding, base64 (NULL when embedding failed)
  answer TEXT NOT NULL,
  sources TEXT NOT NULL,       -- JSON Source[]
  refused INTEGER NOT NULL DEFAULT 0,
  provider TEXT,
  hits INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_hit_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_answer_cache_exact ON answer_cache(bot_id, scope, norm);
CREATE INDEX IF NOT EXISTS idx_answer_cache_recent ON answer_cache(bot_id, scope, last_hit_at);
