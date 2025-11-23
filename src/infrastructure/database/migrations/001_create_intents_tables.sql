-- Migration: Create intents tables with many-to-many relationship
-- Description: Creates intents table, tenant_intents junction table, and exclusions table

-- Tabela principal de intents
CREATE TABLE IF NOT EXISTS intents (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'INACTIVE', 'SUGGESTED')),
  synonyms TEXT,  -- JSON array: ["marcar", "agendar", "horário"]
  example_phrases TEXT,  -- JSON array: ["Quero marcar um horário", "Posso agendar?"]
  is_default BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Tabela de relacionamento many-to-many (tenants <-> intents específicos)
CREATE TABLE IF NOT EXISTS tenant_intents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  intent_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(tenant_id, intent_id),
  FOREIGN KEY (intent_id) REFERENCES intents(id) ON DELETE CASCADE
);

-- Tabela de exclusões (tenants que não devem ver intents default)
CREATE TABLE IF NOT EXISTS tenant_intent_exclusions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  intent_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(tenant_id, intent_id),
  FOREIGN KEY (intent_id) REFERENCES intents(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_intents_status ON intents(status);
CREATE INDEX IF NOT EXISTS idx_intents_is_default ON intents(is_default);
CREATE INDEX IF NOT EXISTS idx_intents_label ON intents(label);
CREATE INDEX IF NOT EXISTS idx_tenant_intents_tenant_id ON tenant_intents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_intents_intent_id ON tenant_intents(intent_id);
CREATE INDEX IF NOT EXISTS idx_exclusions_tenant_id ON tenant_intent_exclusions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_exclusions_intent_id ON tenant_intent_exclusions(intent_id);
