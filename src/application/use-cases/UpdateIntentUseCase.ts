/**
 * UpdateIntentUseCase
 * Use case para atualizar uma intenção
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { UpdateIntentDTO } from '../dtos/UpdateIntentDTO';
import { AppError } from '../../shared/utils/AppError';
import { IntentUniquenessService } from '../../domain/services/IntentUniquenessService';

export class UpdateIntentUseCase {
  constructor(private readonly repository: IIntentRepository) {}

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

    return await this.repository.update(updatedIntent);
  }
}
