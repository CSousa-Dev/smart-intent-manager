/**
 * DatabaseConnection
 * Gerencia a conexão com o banco de dados SQLite
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { config } from '../../config/environment';

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = config.database?.path || join(process.cwd(), 'data', 'intent-manager.db');
  const dbDir = dirname(dbPath);

  // Cria o diretório se não existir
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = new Database(dbPath);
  dbInstance.pragma('journal_mode = WAL');

  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

