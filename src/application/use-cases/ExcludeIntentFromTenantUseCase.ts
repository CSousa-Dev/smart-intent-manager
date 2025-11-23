/**
 * ExcludeIntentFromTenantUseCase
 * Use case para excluir um intent default de um tenant específico
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { TenantId } from '../../domain/value-objects/TenantId';
import { AppError } from '../../shared/utils/AppError';
import { IntentTenantRelationshipService } from '../../domain/services/IntentTenantRelationshipService';

export class ExcludeIntentFromTenantUseCase {
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

    try {
      // Regra de negócio: Apenas intents default podem ser excluídas
      IntentTenantRelationshipService.ensureIntentCanBeExcluded(intent);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Can only exclude')) {
        throw AppError.badRequest(error.message);
      }
      throw error;
    }

    const tenantIdVO = TenantId.create(tenantId);

    try {
      // Regra de negócio: Processa exclusão usando serviço de domínio
      await IntentTenantRelationshipService.excludeIntentFromTenant(
        this.repository,
        intentId,
        tenantIdVO
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('already excluded')) {
        throw AppError.conflict(error.message);
      }
      throw error;
    }
  }
}
