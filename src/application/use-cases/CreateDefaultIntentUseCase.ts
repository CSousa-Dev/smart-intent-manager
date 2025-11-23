/**
 * CreateDefaultIntentUseCase
 * Use case para criar uma intenção default (compartilhada)
 */

import { v4 as uuidv4 } from 'uuid';
import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { CreateDefaultIntentDTO } from '../dtos/CreateIntentDTO';
import { AppError } from '../../shared/utils/AppError';
import { IntentUniquenessService } from '../../domain/services/IntentUniquenessService';

export class CreateDefaultIntentUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(dto: CreateDefaultIntentDTO): Promise<Intent> {
    try {
      // Regra de negócio: Label deve ser único globalmente
      await IntentUniquenessService.ensureLabelIsUnique(this.repository, dto.label);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw AppError.conflict(error.message);
      }
      throw error;
    }

    // Cria a intenção como default
    // A entidade garante sua própria integridade através de validações internas
    const intent = Intent.createForCreation(
      uuidv4(),
      dto.label,
      dto.description || '',
      dto.status,
      dto.synonyms || [],
      dto.examplePhrases || [],
      true // isDefault = true
    );

    return await this.repository.create(intent);
  }
}
