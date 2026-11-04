-- Nara v5.1: document language (drives the automatic reranker) and a flag for answers
-- that came back without any valid citation.
ALTER TABLE file ADD COLUMN lang TEXT;
ALTER TABLE chat_log ADD COLUMN ungrounded INTEGER NOT NULL DEFAULT 0;
