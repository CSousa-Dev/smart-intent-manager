/**
 * Intent Entity
 * Entidade principal que representa uma intenção
 */

import { ClientId } from '../value-objects/ClientId';
import { IntentStatus } from '../value-objects/IntentStatus';

export class Intent {
  private constructor(
    public readonly id: string,
    public readonly clientId: ClientId,
    public readonly label: string,
    public readonly description: string,
    public readonly status: IntentStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    id: string,
    clientId: ClientId,
    label: string,
    description: string,
    status: IntentStatus
  ): Intent {
    if (!label || label.trim().length === 0) {
      throw new Error('Label cannot be empty');
    }

    const now = new Date();
    return new Intent(id, clientId, label.trim(), description || '', status, now, now);
  }

  static reconstitute(
    id: string,
    clientId: ClientId,
    label: string,
    description: string,
    status: IntentStatus,
    createdAt: Date,
    updatedAt: Date
  ): Intent {
    return new Intent(id, clientId, label, description, status, createdAt, updatedAt);
  }

  updateLabel(newLabel: string): Intent {
    if (!newLabel || newLabel.trim().length === 0) {
      throw new Error('Label cannot be empty');
    }

    return Intent.reconstitute(
      this.id,
      this.clientId,
      newLabel.trim(),
      this.description,
      this.status,
      this.createdAt,
      new Date()
    );
  }

  updateDescription(newDescription: string): Intent {
    return Intent.reconstitute(
      this.id,
      this.clientId,
      this.label,
      newDescription || '',
      this.status,
      this.createdAt,
      new Date()
    );
  }

  updateStatus(newStatus: IntentStatus): Intent {
    return Intent.reconstitute(
      this.id,
      this.clientId,
      this.label,
      this.description,
      newStatus,
      this.createdAt,
      new Date()
    );
  }

  update(label: string, description: string, status: IntentStatus): Intent {
    if (!label || label.trim().length === 0) {
      throw new Error('Label cannot be empty');
    }

    return Intent.reconstitute(
      this.id,
      this.clientId,
      label.trim(),
      description || '',
      status,
      this.createdAt,
      new Date()
    );
  }
}

