/**
 * IIntentRepository Interface
 * Interface do repositório de intenções (Domain Layer)
 */

import { Intent } from '../entities/Intent';
import { ClientId } from '../value-objects/ClientId';

export interface IIntentRepository {
  // CRUD básico
  create(intent: Intent): Promise<Intent>;
  findById(id: string): Promise<Intent | null>;
  findByLabel(label: string): Promise<Intent | null>;
  findAll(): Promise<Intent[]>;
  findAllDefault(): Promise<Intent[]>;
  update(intent: Intent): Promise<Intent>;
  delete(id: string): Promise<void>;

  // Relacionamentos com clientes
  linkIntentToClient(intentId: string, clientId: ClientId): Promise<void>;
  unlinkIntentFromClient(intentId: string, clientId: ClientId): Promise<void>;
  excludeIntentFromClient(intentId: string, clientId: ClientId): Promise<void>;
  removeExclusion(intentId: string, clientId: ClientId): Promise<void>;
  
  // Buscar intents de um cliente
  findIntentsByClient(clientId: ClientId): Promise<Intent[]>;
  
  // Verificar relacionamentos
  isIntentLinkedToClient(intentId: string, clientId: ClientId): Promise<boolean>;
  isIntentExcludedFromClient(intentId: string, clientId: ClientId): Promise<boolean>;
  
  // Buscar IDs vinculados/excluídos para um cliente
  getLinkedIntentIds(clientId: ClientId): Promise<Set<string>>;
  getExcludedIntentIds(clientId: ClientId): Promise<Set<string>>;
}
