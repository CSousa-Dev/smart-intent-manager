/**
 * ListTenantIntentsUseCase
 * Use case para listar intenções de um tenant específico
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { TenantId } from '../../domain/value-objects/TenantId';
import { AppError } from '../../shared/utils/AppError';

export class ListTenantIntentsUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(tenantId: string): Promise<Intent[]> {
    if (!tenantId || tenantId.trim().length === 0) {
      throw AppError.badRequest('tenantId is required');
    }

    const tenantIdVO = TenantId.create(tenantId);
    return await this.repository.findIntentsByTenant(tenantIdVO);
  }
}

