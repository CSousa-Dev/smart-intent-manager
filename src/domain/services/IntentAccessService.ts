/**
 * IntentAccessService Service
 * Serviço de domínio para lógica de acesso de intenções por cliente
 */

import { Intent } from '../entities/Intent';
import { ClientId } from '../value-objects/ClientId';

export class IntentAccessService {
  /**
   * Verifica se um cliente tem acesso a uma intenção
   * @param intent Intenção a ser verificada
   * @param clientId ID do cliente
   * @param isLinked Se a intenção está vinculada ao cliente na tabela client_intents
   * @param isExcluded Se a intenção está excluída do cliente na tabela exclusions
   * @returns true se o cliente tem acesso, false caso contrário
   */
  static hasAccess(
    intent: Intent,
    clientId: ClientId,
    isLinked: boolean,
    isExcluded: boolean
  ): boolean {
    // Se é intenção default
    if (intent.isDefault) {
      // Cliente tem acesso se não estiver excluído
      return !isExcluded;
    }

    // Se não é default, cliente só tem acesso se estiver vinculado
    return isLinked;
  }

  /**
   * Filtra lista de intenções baseado no acesso do cliente
   * @param intents Lista de intenções
   * @param clientId ID do cliente
   * @param linkedIntentIds IDs das intenções vinculadas ao cliente
   * @param excludedIntentIds IDs das intenções excluídas do cliente
   * @returns Lista de intenções que o cliente tem acesso
   */
  static filterByClientAccess(
    intents: Intent[],
    clientId: ClientId,
    linkedIntentIds: Set<string>,
    excludedIntentIds: Set<string>
  ): Intent[] {
    return intents.filter((intent) => {
      const isLinked = linkedIntentIds.has(intent.id);
      const isExcluded = excludedIntentIds.has(intent.id);
      return this.hasAccess(intent, clientId, isLinked, isExcluded);
    });
  }
}

