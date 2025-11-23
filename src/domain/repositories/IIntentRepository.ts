/**
 * IIntentRepository Interface
 * Interface do repositório de intenções (Domain Layer)
 */

import { Intent } from '../entities/Intent';
import { TenantId } from '../value-objects/TenantId';

export interface IIntentRepository {
  // CRUD básico
  create(intent: Intent): Promise<Intent>;
  findById(id: string): Promise<Intent | null>;
  findByLabel(label: string): Promise<Intent | null>;
  findAll(): Promise<Intent[]>;
  findAllDefault(): Promise<Intent[]>;
  update(intent: Intent): Promise<Intent>;
  delete(id: string): Promise<void>;

  // Relacionamentos com tenants
  linkIntentToTenant(intentId: string, tenantId: TenantId): Promise<void>;
  unlinkIntentFromTenant(intentId: string, tenantId: TenantId): Promise<void>;
  excludeIntentFromTenant(intentId: string, tenantId: TenantId): Promise<void>;
  removeExclusion(intentId: string, tenantId: TenantId): Promise<void>;
  
  // Buscar intents de um tenant
  findIntentsByTenant(tenantId: TenantId): Promise<Intent[]>;
  
  // Verificar relacionamentos
  isIntentLinkedToTenant(intentId: string, tenantId: TenantId): Promise<boolean>;
  isIntentExcludedFromTenant(intentId: string, tenantId: TenantId): Promise<boolean>;
  
  // Buscar IDs vinculados/excluídos para um tenant
  getLinkedIntentIds(tenantId: TenantId): Promise<Set<string>>;
  getExcludedIntentIds(tenantId: TenantId): Promise<Set<string>>;
  
  // Buscar tenantIds vinculados a uma intent
  getTenantIdsForIntent(intentId: string): Promise<string[]>;
}
