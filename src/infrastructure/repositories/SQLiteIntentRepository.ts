/**
 * SQLiteIntentRepository
 * Implementação do repositório de intenções usando SQLite
 */

import { v4 as uuidv4 } from 'uuid';
import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { ClientId } from '../../domain/value-objects/ClientId';
import { IntentStatus } from '../../domain/value-objects/IntentStatus';
import { getDatabase } from '../database/DatabaseConnection';
import { IntentAccessService } from '../../domain/services/IntentAccessService';

export class SQLiteIntentRepository implements IIntentRepository {
  async create(intent: Intent): Promise<Intent> {
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT INTO intents (
        id, label, description, status, synonyms, example_phrases, is_default, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        intent.id,
        intent.label,
        intent.description,
        intent.status,
        JSON.stringify(intent.synonyms),
        JSON.stringify(intent.examplePhrases),
        intent.isDefault ? 1 : 0,
        intent.createdAt.toISOString(),
        intent.updatedAt.toISOString()
      );

      return intent;
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(`Intent with label "${intent.label}" already exists`);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Intent | null> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT * FROM intents WHERE id = ?
    `);

    const row = stmt.get(id) as IntentRow | undefined;

    if (!row) {
      return null;
    }

    return this.mapRowToIntent(row);
  }

  async findByLabel(label: string): Promise<Intent | null> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT * FROM intents WHERE label = ? LIMIT 1
    `);

    const row = stmt.get(label.trim()) as IntentRow | undefined;

    if (!row) {
      return null;
    }

    return this.mapRowToIntent(row);
  }

  async findAll(): Promise<Intent[]> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT * FROM intents ORDER BY created_at DESC
    `);

    const rows = stmt.all() as IntentRow[];

    return rows.map((row) => this.mapRowToIntent(row));
  }

  async findAllDefault(): Promise<Intent[]> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT * FROM intents WHERE is_default = 1 ORDER BY created_at DESC
    `);

    const rows = stmt.all() as IntentRow[];

    return rows.map((row) => this.mapRowToIntent(row));
  }

  async update(intent: Intent): Promise<Intent> {
    const db = getDatabase();

    const stmt = db.prepare(`
      UPDATE intents SET
        label = ?,
        description = ?,
        status = ?,
        synonyms = ?,
        example_phrases = ?,
        updated_at = ?
      WHERE id = ?
    `);

    try {
      stmt.run(
        intent.label,
        intent.description,
        intent.status,
        JSON.stringify(intent.synonyms),
        JSON.stringify(intent.examplePhrases),
        intent.updatedAt.toISOString(),
        intent.id
      );

      return intent;
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(`Intent with label "${intent.label}" already exists`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();

    const stmt = db.prepare(`
      DELETE FROM intents WHERE id = ?
    `);

    stmt.run(id);
  }

  async linkIntentToClient(intentId: string, clientId: ClientId): Promise<void> {
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT INTO client_intents (id, client_id, intent_id, created_at)
      VALUES (?, ?, ?, ?)
    `);

    try {
      stmt.run(uuidv4(), clientId.getValue(), intentId, new Date().toISOString());
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        // Já está vinculado, não precisa fazer nada
        return;
      }
      throw error;
    }
  }

  async unlinkIntentFromClient(intentId: string, clientId: ClientId): Promise<void> {
    const db = getDatabase();

    const stmt = db.prepare(`
      DELETE FROM client_intents WHERE intent_id = ? AND client_id = ?
    `);

    stmt.run(intentId, clientId.getValue());
  }

  async excludeIntentFromClient(intentId: string, clientId: ClientId): Promise<void> {
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT INTO client_intent_exclusions (id, client_id, intent_id, created_at)
      VALUES (?, ?, ?, ?)
    `);

    try {
      stmt.run(uuidv4(), clientId.getValue(), intentId, new Date().toISOString());
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        // Já está excluído, não precisa fazer nada
        return;
      }
      throw error;
    }
  }

  async removeExclusion(intentId: string, clientId: ClientId): Promise<void> {
    const db = getDatabase();

    const stmt = db.prepare(`
      DELETE FROM client_intent_exclusions WHERE intent_id = ? AND client_id = ?
    `);

    stmt.run(intentId, clientId.getValue());
  }

  async findIntentsByClient(clientId: ClientId): Promise<Intent[]> {
    const db = getDatabase();

    // Busca todas as intenções (defaults e específicas)
    const allIntents = await this.findAll();

    // Busca IDs vinculados e excluídos
    const linkedIds = await this.getLinkedIntentIds(clientId);
    const excludedIds = await this.getExcludedIntentIds(clientId);

    // Filtra usando o serviço de domínio
    return IntentAccessService.filterByClientAccess(
      allIntents,
      clientId,
      linkedIds,
      excludedIds
    );
  }

  async isIntentLinkedToClient(intentId: string, clientId: ClientId): Promise<boolean> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM client_intents 
      WHERE intent_id = ? AND client_id = ?
    `);

    const result = stmt.get(intentId, clientId.getValue()) as { count: number };

    return result.count > 0;
  }

  async isIntentExcludedFromClient(intentId: string, clientId: ClientId): Promise<boolean> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM client_intent_exclusions 
      WHERE intent_id = ? AND client_id = ?
    `);

    const result = stmt.get(intentId, clientId.getValue()) as { count: number };

    return result.count > 0;
  }

  async getLinkedIntentIds(clientId: ClientId): Promise<Set<string>> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT intent_id FROM client_intents WHERE client_id = ?
    `);

    const rows = stmt.all(clientId.getValue()) as Array<{ intent_id: string }>;

    return new Set(rows.map((row) => row.intent_id));
  }

  async getExcludedIntentIds(clientId: ClientId): Promise<Set<string>> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT intent_id FROM client_intent_exclusions WHERE client_id = ?
    `);

    const rows = stmt.all(clientId.getValue()) as Array<{ intent_id: string }>;

    return new Set(rows.map((row) => row.intent_id));
  }

  private mapRowToIntent(row: IntentRow): Intent {
    let synonyms: string[] = [];
    let examplePhrases: string[] = [];

    try {
      if (row.synonyms) {
        synonyms = JSON.parse(row.synonyms);
      }
    } catch {
      synonyms = [];
    }

    try {
      if (row.example_phrases) {
        examplePhrases = JSON.parse(row.example_phrases);
      }
    } catch {
      examplePhrases = [];
    }

    return Intent.reconstitute(
      row.id,
      row.label,
      row.description,
      row.status as IntentStatus,
      synonyms,
      examplePhrases,
      row.is_default === 1,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}

interface IntentRow {
  id: string;
  label: string;
  description: string;
  status: string;
  synonyms: string | null;
  example_phrases: string | null;
  is_default: number;
  created_at: string;
  updated_at: string;
}
