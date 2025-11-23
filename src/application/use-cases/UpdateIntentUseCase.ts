/**
 * UpdateIntentUseCase
 * Use case para atualizar uma intenção
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { UpdateIntentDTO } from '../dtos/UpdateIntentDTO';
import { AppError } from '../../shared/utils/AppError';
import { IntentUniquenessService } from '../../domain/services/IntentUniquenessService';
import { ITenantService } from '../../domain/services/ITenantService';
import { TenantId } from '../../domain/value-objects/TenantId';
import { IntentTenantValidationService } from '../../domain/services/IntentTenantValidationService';
import { IntentTenantRelationshipService } from '../../domain/services/IntentTenantRelationshipService';

export class UpdateIntentUseCase {
  constructor(
    private readonly repository: IIntentRepository,
    private readonly tenantService: ITenantService
  ) {}

  async execute(id: string, dto: UpdateIntentDTO): Promise<Intent> {
    // Validação de aplicação
    if (!id || id.trim().length === 0) {
      throw AppError.badRequest('Intent id is required');
    }

    // Busca a intenção existente
    const existingIntent = await this.repository.findById(id);

    if (!existingIntent) {
      throw AppError.notFound(`Intent with id ${id} not found`);
    }

    // Regra de negócio: Se está atualizando o label, verifica unicidade
    if (dto.label !== undefined && dto.label !== existingIntent.label) {
      try {
        await IntentUniquenessService.ensureLabelIsUniqueForUpdate(
          this.repository,
          dto.label,
          id
        );
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          throw AppError.conflict(error.message);
        }
        throw error;
      }
    }

    // Atualiza a intenção
    // A entidade garante sua própria integridade através de validações internas
    const updatedIntent = existingIntent.update(
      dto.label !== undefined ? dto.label : existingIntent.label,
      dto.description !== undefined ? dto.description : existingIntent.description,
      dto.status !== undefined ? dto.status : existingIntent.status,
      dto.synonyms,
      dto.examplePhrases
    );

    const savedIntent = await this.repository.update(updatedIntent);

    // Atualiza vínculos com tenants se tenantIds foi fornecido
    if (dto.tenantIds !== undefined) {
      await this.updateTenantLinks(savedIntent.id, dto.tenantIds);
    }

    return savedIntent;
  }

  private async updateTenantLinks(intentId: string, newTenantIds: string[]): Promise<void> {
    // Busca tenantIds atuais vinculados à intent
    const currentTenantIds = await this.repository.getTenantIdsForIntent(intentId);
    const currentSet = new Set(currentTenantIds);
    const newSet = new Set(newTenantIds.map((id) => id.trim()));

    // Se as listas são iguais, não há nada a fazer
    if (
      currentSet.size === newSet.size &&
      Array.from(currentSet).every((id) => newSet.has(id))
    ) {
      return;
    }

    // Valida que todos os novos tenants existem (apenas para intents não-default)
    const intent = await this.repository.findById(intentId);
    if (!intent) {
      throw AppError.notFound(`Intent with id ${intentId} not found`);
    }

    if (!intent.isDefault) {
      // Valida existência de todos os novos tenants
      for (const tenantIdStr of newSet) {
        if (!tenantIdStr || tenantIdStr.trim().length === 0) {
          throw AppError.badRequest('All tenantIds must be non-empty strings');
        }

        const tenantId = TenantId.create(tenantIdStr);
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
    }

    // Identifica tenants a remover (estão no atual mas não no novo)
    const tenantsToRemove = Array.from(currentSet).filter((id) => !newSet.has(id));

    // Identifica tenants a adicionar (estão no novo mas não no atual)
    const tenantsToAdd = Array.from(newSet).filter((id) => !currentSet.has(id));

    // Remove vínculos antigos
    for (const tenantIdStr of tenantsToRemove) {
      const tenantId = TenantId.create(tenantIdStr);
      await this.repository.unlinkIntentFromTenant(intentId, tenantId);
    }

    // Adiciona novos vínculos
    for (const tenantIdStr of tenantsToAdd) {
      const tenantId = TenantId.create(tenantIdStr);
      await IntentTenantRelationshipService.linkIntentToTenant(
        this.repository,
        intentId,
        tenantId
      );
    }
  }
}
