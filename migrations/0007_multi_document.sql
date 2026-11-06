-- Nara v6: a bot can use several documents at once.
-- Chunks remember which document they belong to; `idx` is the position inside that document,
-- so neighbouring chunks are only ever glued together within the same document.
ALTER TABLE chunks ADD COLUMN file_id TEXT;
-- Existing chunk ids are "<file id>-<idx>", and every bot had at most one file.
UPDATE chunks SET file_id = (SELECT f.id FROM file f WHERE f.bot_id = chunks.bot_id AND chunks.id LIKE f.id || '-%' LIMIT 1) WHERE file_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_chunks_file_idx ON chunks(bot_id, file_id, idx);
