/**
 * IntentTenantValidationService
 * Serviço de domínio para validações de negócio relacionadas a intents e tenants
 */

import { ITenantService } from './ITenantService';
import { TenantId } from '../value-objects/TenantId';

export class IntentTenantValidationService {
  /**
   * Valida se um tenant existe antes de criar um intent não-default
   * Regra de negócio: Não é possível criar intents não-default para tenants inexistentes
   * @param tenantService Serviço de tenant
   * @param tenantId ID do tenant a ser validado
   * @throws Error se o tenant não existir
   */
  static async ensureTenantExistsForNonDefaultIntent(
    tenantService: ITenantService,
    tenantId: TenantId
  ): Promise<void> {
    const tenantExists = await tenantService.exists(tenantId);

    if (!tenantExists) {
      throw new Error(`Tenant with id "${tenantId.getValue()}" does not exist`);
    }
  }
}

