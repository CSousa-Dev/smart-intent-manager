/**
 * UpdateIntentUseCase
 * Use case para atualizar uma intenção
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { IntentStatus } from '../../domain/value-objects/IntentStatus';
import { UpdateIntentDTO } from '../dtos/UpdateIntentDTO';
import { AppError } from '../../shared/utils/AppError';
import { IntentValidator } from '../../domain/services/IntentValidator';

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
    if (dto.status !== undefined) {
      IntentValidator.validateStatus(dto.status);
    }

    // Se está atualizando o label, verifica unicidade
    if (dto.label !== undefined && dto.label !== existingIntent.label) {
      IntentValidator.validateLabel(dto.label);

      const existingWithLabel = await this.repository.findByLabel(dto.label.trim());

      if (existingWithLabel && existingWithLabel.id !== id) {
        throw AppError.conflict(`Intent with label "${dto.label}" already exists`);
      }
    }

    // Valida arrays se fornecidos
    const synonyms =
      dto.synonyms !== undefined
        ? IntentValidator.validateSynonyms(dto.synonyms)
        : existingIntent.synonyms;

    const examplePhrases =
      dto.examplePhrases !== undefined
        ? IntentValidator.validateExamplePhrases(dto.examplePhrases)
        : existingIntent.examplePhrases;

    // Atualiza a intenção
    const updatedIntent = existingIntent.update(
      dto.label !== undefined ? dto.label : existingIntent.label,
      dto.description !== undefined ? dto.description : existingIntent.description,
      dto.status !== undefined ? dto.status : existingIntent.status,
      synonyms,
      examplePhrases
    );

    return await this.repository.update(updatedIntent);
  }
}
