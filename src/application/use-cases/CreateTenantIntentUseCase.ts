/**
 * CreateTenantIntentUseCase
 * Use case para criar uma intenção específica de tenant
 * Garante que o tenant existe antes de criar a intenção
 */

import { v4 as uuidv4 } from 'uuid';
import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { ITenantService } from '../../domain/services/ITenantService';
import { Intent } from '../../domain/entities/Intent';
import { TenantId } from '../../domain/value-objects/TenantId';
import { CreateTenantIntentDTO } from '../dtos/CreateIntentDTO';
import { AppError } from '../../shared/utils/AppError';
import { IntentUniquenessService } from '../../domain/services/IntentUniquenessService';
import { IntentTenantValidationService } from '../../domain/services/IntentTenantValidationService';
import { IntentTenantRelationshipService } from '../../domain/services/IntentTenantRelationshipService';

export class CreateTenantIntentUseCase {
  constructor(
    private readonly intentRepository: IIntentRepository,
    private readonly tenantService: ITenantService
  ) {}

  async execute(dto: CreateTenantIntentDTO): Promise<Intent> {
    // Validações de aplicação (não de negócio)
    if (!dto.tenantIds || !Array.isArray(dto.tenantIds) || dto.tenantIds.length === 0) {
      throw AppError.badRequest('tenantIds is required and must be a non-empty array');
    }

    // Valida e cria TenantIds
    const tenantIds = dto.tenantIds.map((id) => {
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw AppError.badRequest('All tenantIds must be non-empty strings');
      }
      return TenantId.create(id.trim());
    });

    // Remove duplicatas
    const uniqueTenantIds = Array.from(
      new Map(tenantIds.map((id) => [id.getValue(), id])).values()
    );

    // Valida existência de todos os tenants
    for (const tenantId of uniqueTenantIds) {
      try {
        await IntentTenantValidationService.ensureTenantExistsForNonDefaultIntent(
          this.tenantService,
          tenantId
        );
      } catch (error) {
        if (error instanceof Error && error.message.includes('does not exist')) {
          throw AppError.notFound(error.message);
        }
        throw error;
      }
    }

    try {
      // Regra de negócio: Label deve ser único globalmente
      await IntentUniquenessService.ensureLabelIsUnique(this.intentRepository, dto.label);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw AppError.conflict(error.message);
      }
      throw error;
    }

    // Cria a intenção como específica de tenant
    // A entidade garante sua própria integridade através de validações internas
    const intent = Intent.createForCreation(
      uuidv4(),
      dto.label,
      dto.description || '',
      dto.status,
      dto.synonyms || [],
      dto.examplePhrases || [],
      false // isDefault = false
    );

    const createdIntent = await this.intentRepository.create(intent);

    // Regra de negócio: Vincula a intent a todos os tenants usando serviço de domínio
    for (const tenantId of uniqueTenantIds) {
      await IntentTenantRelationshipService.linkIntentToTenant(
        this.intentRepository,
        createdIntent.id,
        tenantId
      );
    }

    return createdIntent;
  }
}
