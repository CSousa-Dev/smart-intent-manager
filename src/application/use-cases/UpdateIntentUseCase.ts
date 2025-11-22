/**
 * UpdateIntentUseCase
 * Use case para atualizar uma intenção
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { IntentStatus, isValidIntentStatus } from '../../domain/value-objects/IntentStatus';
import { UpdateIntentDTO } from '../dtos/UpdateIntentDTO';
import { AppError } from '../../shared/utils/AppError';

export class UpdateIntentUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(id: string, dto: UpdateIntentDTO): Promise<Intent> {
    if (!id || id.trim().length === 0) {
      throw AppError.badRequest('Intent id is required');
    }

    // Busca a intenção existente
    const existingIntent = await this.repository.findById(id);

    if (!existingIntent) {
      throw AppError.notFound(`Intent with id ${id} not found`);
    }

    // Valida status se fornecido
    if (dto.status !== undefined && !isValidIntentStatus(dto.status)) {
      throw AppError.badRequest('status must be ACTIVE, INACTIVE, or SUGGESTED');
    }

    // Se está atualizando o label, verifica unicidade
    if (dto.label !== undefined && dto.label !== existingIntent.label) {
      const existingWithLabel = await this.repository.findByClientAndLabel(
        existingIntent.clientId,
        dto.label.trim()
      );

      if (existingWithLabel && existingWithLabel.id !== id) {
        throw AppError.conflict(
          `Intent with label "${dto.label}" already exists for clientId: ${existingIntent.clientId.getValue()}`
        );
      }
    }

    // Atualiza a intenção
    let updatedIntent = existingIntent;

    if (dto.label !== undefined || dto.description !== undefined || dto.status !== undefined) {
      updatedIntent = updatedIntent.update(
        dto.label !== undefined ? dto.label : updatedIntent.label,
        dto.description !== undefined ? dto.description : updatedIntent.description,
        dto.status !== undefined ? dto.status : updatedIntent.status
      );
    }

    return await this.repository.update(updatedIntent);
  }
}

