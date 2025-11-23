/**
 * Run Database Migrations
 * Executa as migrations do banco de dados
 */

import { getDatabase } from '../DatabaseConnection';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getLogger } from '../../../shared/logger';

const logger = getLogger();

export function runMigrations(): void {
  const db = getDatabase();

  try {
    // Drop old tables if they exist (for migration from old schema)
    try {
      db.exec('DROP TABLE IF EXISTS client_intent_exclusions');
      db.exec('DROP TABLE IF EXISTS client_intents');
      db.exec('DROP TABLE IF EXISTS intents');
    } catch {
      // Ignore errors if tables don't exist
    }

    // Migration 001: Create intents tables
    const migration001Path = join(
      process.cwd(),
      'src',
      'infrastructure',
      'database',
      'migrations',
      '001_create_intents_tables.sql'
    );

    const migration001 = readFileSync(migration001Path, 'utf-8');
    db.exec(migration001);

    logger.info('Database migrations executed successfully');
  } catch (error) {
    // Se não encontrar o arquivo, tenta executar o SQL diretamente
    try {
      const migrationSQL = `
        -- Tabela principal de intents
        CREATE TABLE IF NOT EXISTS intents (
          id TEXT PRIMARY KEY,
          label TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'INACTIVE', 'SUGGESTED')),
          synonyms TEXT,
          example_phrases TEXT,
          is_default BOOLEAN NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        -- Tabela de relacionamento many-to-many
        CREATE TABLE IF NOT EXISTS client_intents (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          intent_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE(client_id, intent_id),
          FOREIGN KEY (intent_id) REFERENCES intents(id) ON DELETE CASCADE
        );

        -- Tabela de exclusões
        CREATE TABLE IF NOT EXISTS client_intent_exclusions (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          intent_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE(client_id, intent_id),
          FOREIGN KEY (intent_id) REFERENCES intents(id) ON DELETE CASCADE
        );

        -- Índices
        CREATE INDEX IF NOT EXISTS idx_intents_status ON intents(status);
        CREATE INDEX IF NOT EXISTS idx_intents_is_default ON intents(is_default);
        CREATE INDEX IF NOT EXISTS idx_intents_label ON intents(label);
        CREATE INDEX IF NOT EXISTS idx_client_intents_client_id ON client_intents(client_id);
        CREATE INDEX IF NOT EXISTS idx_client_intents_intent_id ON client_intents(intent_id);
        CREATE INDEX IF NOT EXISTS idx_exclusions_client_id ON client_intent_exclusions(client_id);
        CREATE INDEX IF NOT EXISTS idx_exclusions_intent_id ON client_intent_exclusions(intent_id);
      `;

      db.exec(migrationSQL);

      logger.info('Database migrations executed successfully (fallback)');
    } catch (fallbackError) {
      logger.error('Error running migrations', { error, fallbackError });
      throw error;
    }
  }
}
