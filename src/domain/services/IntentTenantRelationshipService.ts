/**
 * IntentTenantRelationshipService
 * Serviço de domínio para regras de negócio relacionadas ao relacionamento entre intents e tenants
 */

import { Intent } from '../entities/Intent';
import { TenantId } from '../value-objects/TenantId';
import { IIntentRepository } from '../repositories/IIntentRepository';

export class IntentTenantRelationshipService {
  /**
   * Verifica se uma intent pode ser excluída de um tenant
   * Regra de negócio: Apenas intents default podem ser excluídas de tenants
   * @param intent Intent a ser verificada
   * @throws Error se a intent não for default
   */
  static ensureIntentCanBeExcluded(intent: Intent): void {
    if (!intent.isDefault) {
      throw new Error('Can only exclude default intents from tenants');
    }
  }

  /**
   * Determina se uma intent precisa ser vinculada explicitamente a um tenant
   * Regra de negócio: Intents default não precisam ser vinculadas (já estão disponíveis)
   * @param intent Intent a ser verificada
   * @returns true se precisa vincular, false caso contrário
   */
  static requiresExplicitLinking(intent: Intent): boolean {
    return !intent.isDefault;
  }

  /**
   * Processa o vínculo de uma intent a um tenant
   * Regra de negócio: Remove exclusão se existir antes de vincular
   * @param repository Repositório de intents
   * @param intentId ID da intent
   * @param tenantId ID do tenant
   */
  static async linkIntentToTenant(
    repository: IIntentRepository,
    intentId: string,
    tenantId: TenantId
  ): Promise<void> {
    // Remove exclusão se existir (regra de negócio)
    const isExcluded = await repository.isIntentExcludedFromTenant(intentId, tenantId);
    if (isExcluded) {
      await repository.removeExclusion(intentId, tenantId);
    }

    // Verifica se já está vinculado antes de vincular
    const isLinked = await repository.isIntentLinkedToTenant(intentId, tenantId);
    if (!isLinked) {
      await repository.linkIntentToTenant(intentId, tenantId);
    }
  }

  /**
   * Processa a exclusão de uma intent de um tenant
   * Regra de negócio: Não pode excluir se já estiver excluído
   * @param repository Repositório de intents
   * @param intentId ID da intent
   * @param tenantId ID do tenant
   * @throws Error se já estiver excluído
   */
  static async excludeIntentFromTenant(
    repository: IIntentRepository,
    intentId: string,
    tenantId: TenantId
  ): Promise<void> {
    const isExcluded = await repository.isIntentExcludedFromTenant(intentId, tenantId);

    if (isExcluded) {
      throw new Error('Intent is already excluded from this tenant');
    }

    await repository.excludeIntentFromTenant(intentId, tenantId);
  }
}

