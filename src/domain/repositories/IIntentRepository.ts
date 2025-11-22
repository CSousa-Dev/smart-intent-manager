/**
 * IIntentRepository Interface
 * Interface do repositório de intenções (Domain Layer)
 */

import { Intent } from '../entities/Intent';
import { ClientId } from '../value-objects/ClientId';

export interface IIntentRepository {
  create(intent: Intent): Promise<Intent>;
  findById(id: string): Promise<Intent | null>;
  findByClientAndLabel(clientId: ClientId, label: string): Promise<Intent | null>;
  findAllByClient(clientId: ClientId): Promise<Intent[]>;
  findAll(): Promise<Intent[]>;
  update(intent: Intent): Promise<Intent>;
  delete(id: string): Promise<void>;
}

