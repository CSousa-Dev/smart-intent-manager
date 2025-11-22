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
    // Migration 001: Create intents table
    const migration001Path = join(
      process.cwd(),
      'src',
      'infrastructure',
      'database',
      'migrations',
      '001_create_intents_table.sql'
    );

    const migration001 = readFileSync(migration001Path, 'utf-8');
    db.exec(migration001);

    logger.info('Database migrations executed successfully');
  } catch (error) {
    // Se não encontrar o arquivo, tenta executar o SQL diretamente
    try {
      const migrationSQL = `
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
      `;

      db.exec(migrationSQL);

      logger.info('Database migrations executed successfully (fallback)');
    } catch (fallbackError) {
      logger.error('Error running migrations', { error, fallbackError });
      throw error;
    }
  }
}

