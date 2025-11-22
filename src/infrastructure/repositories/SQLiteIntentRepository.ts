/**
 * SQLiteIntentRepository
 * Implementação do repositório de intenções usando SQLite
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { ClientId } from '../../domain/value-objects/ClientId';
import { IntentStatus } from '../../domain/value-objects/IntentStatus';
import { getDatabase } from '../database/DatabaseConnection';

export class SQLiteIntentRepository implements IIntentRepository {
  async create(intent: Intent): Promise<Intent> {
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT INTO intents (
        id, client_id, label, description, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        intent.id,
        intent.clientId.getValue(),
        intent.label,
        intent.description,
        intent.status,
        intent.createdAt.toISOString(),
        intent.updatedAt.toISOString()
      );

      return intent;
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(
          `Intent with label "${intent.label}" already exists for clientId: ${intent.clientId.getValue()}`
        );
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Intent | null> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT * FROM intents WHERE id = ?
    `);

    const row = stmt.get(id) as {
      id: string;
      client_id: string;
      label: string;
      description: string;
      status: string;
      created_at: string;
      updated_at: string;
    } | undefined;

    if (!row) {
      return null;
    }

    return this.mapRowToIntent(row);
  }

  async findByClientAndLabel(clientId: ClientId, label: string): Promise<Intent | null> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT * FROM intents 
      WHERE client_id = ? AND label = ?
      LIMIT 1
    `);

    const row = stmt.get(clientId.getValue(), label.trim()) as {
      id: string;
      client_id: string;
      label: string;
      description: string;
      status: string;
      created_at: string;
      updated_at: string;
    } | undefined;

    if (!row) {
      return null;
    }

    return this.mapRowToIntent(row);
  }

  async findAllByClient(clientId: ClientId): Promise<Intent[]> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT * FROM intents 
      WHERE client_id = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(clientId.getValue()) as Array<{
      id: string;
      client_id: string;
      label: string;
      description: string;
      status: string;
      created_at: string;
      updated_at: string;
    }>;

    return rows.map((row) => this.mapRowToIntent(row));
  }

  async findAll(): Promise<Intent[]> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT * FROM intents 
      ORDER BY created_at DESC
    `);

    const rows = stmt.all() as Array<{
      id: string;
      client_id: string;
      label: string;
      description: string;
      status: string;
      created_at: string;
      updated_at: string;
    }>;

    return rows.map((row) => this.mapRowToIntent(row));
  }

  async update(intent: Intent): Promise<Intent> {
    const db = getDatabase();

    const stmt = db.prepare(`
      UPDATE intents SET
        label = ?,
        description = ?,
        status = ?,
        updated_at = ?
      WHERE id = ?
    `);

    try {
      stmt.run(
        intent.label,
        intent.description,
        intent.status,
        intent.updatedAt.toISOString(),
        intent.id
      );

      return intent;
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(
          `Intent with label "${intent.label}" already exists for clientId: ${intent.clientId.getValue()}`
        );
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

  private mapRowToIntent(row: {
    id: string;
    client_id: string;
    label: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
  }): Intent {
    return Intent.reconstitute(
      row.id,
      ClientId.create(row.client_id),
      row.label,
      row.description,
      row.status as IntentStatus,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}

