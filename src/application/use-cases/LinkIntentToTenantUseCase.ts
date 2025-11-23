/**
 * LinkIntentToTenantUseCase
 * Use case para vincular um intent default a um tenant específico
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { TenantId } from '../../domain/value-objects/TenantId';
import { AppError } from '../../shared/utils/AppError';
import { IntentTenantRelationshipService } from '../../domain/services/IntentTenantRelationshipService';

export class LinkIntentToTenantUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(intentId: string, tenantId: string): Promise<void> {
    // Validações de aplicação
    if (!intentId || intentId.trim().length === 0) {
      throw AppError.badRequest('Intent id is required');
    }

    if (!tenantId || tenantId.trim().length === 0) {
      throw AppError.badRequest('tenantId is required');
    }

    const intent = await this.repository.findById(intentId);

    if (!intent) {
      throw AppError.notFound(`Intent with id ${intentId} not found`);
    }

    const tenantIdVO = TenantId.create(tenantId);

    // Regra de negócio: Se intent é default, não precisa vincular (já está disponível)
    if (!IntentTenantRelationshipService.requiresExplicitLinking(intent)) {
      // Se for default, apenas remove exclusão se existir
      const isExcluded = await this.repository.isIntentExcludedFromTenant(intentId, tenantIdVO);
      if (isExcluded) {
        await this.repository.removeExclusion(intentId, tenantIdVO);
      }
      return;
    }

    // Regra de negócio: Se não for default, vincula usando serviço de domínio
    await IntentTenantRelationshipService.linkIntentToTenant(
      this.repository,
      intentId,
      tenantIdVO
    );
  }
}
