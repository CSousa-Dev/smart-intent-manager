-- Migration: Create intents table
-- Description: Creates the intents table with all required fields

CREATE TABLE IF NOT EXISTS intents (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'INACTIVE', 'SUGGESTED')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(client_id, label)
);

CREATE INDEX IF NOT EXISTS idx_intents_client_id ON intents(client_id);
CREATE INDEX IF NOT EXISTS idx_intents_status ON intents(status);

