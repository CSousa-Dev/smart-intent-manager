/**
 * CreateDefaultIntentUseCase
 * Use case para criar uma intenção default (compartilhada)
 */

import { v4 as uuidv4 } from 'uuid';
import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { IntentStatus } from '../../domain/value-objects/IntentStatus';
import { CreateDefaultIntentDTO } from '../dtos/CreateIntentDTO';
import { AppError } from '../../shared/utils/AppError';
import { IntentValidator } from '../../domain/services/IntentValidator';

export class CreateDefaultIntentUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(dto: CreateDefaultIntentDTO): Promise<Intent> {
    // Validações usando serviço de domínio
    IntentValidator.validateLabel(dto.label);
    IntentValidator.validateStatus(dto.status);
    IntentValidator.validateStatusForCreation(dto.status);

    const synonyms = IntentValidator.validateSynonyms(dto.synonyms);
    const examplePhrases = IntentValidator.validateExamplePhrases(dto.examplePhrases);

    // Verifica se já existe uma intenção com mesmo label
    const existing = await this.repository.findByLabel(dto.label.trim());

    if (existing) {
      throw AppError.conflict(`Intent with label "${dto.label}" already exists`);
    }

    // Cria a intenção como default
    const intent = Intent.create(
      uuidv4(),
      dto.label,
      dto.description || '',
      dto.status,
      synonyms,
      examplePhrases,
      true // isDefault = true
    );

    return await this.repository.create(intent);
  }
}

