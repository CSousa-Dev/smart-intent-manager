/**
 * IntentAccessService Service
 * Serviço de domínio para lógica de acesso de intenções por tenant
 */

import { Intent } from '../entities/Intent';
import { TenantId } from '../value-objects/TenantId';

export class IntentAccessService {
  /**
   * Verifica se um tenant tem acesso a uma intenção
   * @param intent Intenção a ser verificada
   * @param tenantId ID do tenant
   * @param isLinked Se a intenção está vinculada ao tenant na tabela tenant_intents
   * @param isExcluded Se a intenção está excluída do tenant na tabela exclusions
   * @returns true se o tenant tem acesso, false caso contrário
   */
  static hasAccess(
    intent: Intent,
    tenantId: TenantId,
    isLinked: boolean,
    isExcluded: boolean
  ): boolean {
    // Se é intenção default
    if (intent.isDefault) {
      // Tenant tem acesso se não estiver excluído
      return !isExcluded;
    }

    // Se não é default, tenant só tem acesso se estiver vinculado
    return isLinked;
  }

  /**
   * Filtra lista de intenções baseado no acesso do tenant
   * @param intents Lista de intenções
   * @param tenantId ID do tenant
   * @param linkedIntentIds IDs das intenções vinculadas ao tenant
   * @param excludedIntentIds IDs das intenções excluídas do tenant
   * @returns Lista de intenções que o tenant tem acesso
   */
  static filterByTenantAccess(
    intents: Intent[],
    tenantId: TenantId,
    linkedIntentIds: Set<string>,
    excludedIntentIds: Set<string>
  ): Intent[] {
    return intents.filter((intent) => {
      const isLinked = linkedIntentIds.has(intent.id);
      const isExcluded = excludedIntentIds.has(intent.id);
      return this.hasAccess(intent, tenantId, isLinked, isExcluded);
    });
  }
}
