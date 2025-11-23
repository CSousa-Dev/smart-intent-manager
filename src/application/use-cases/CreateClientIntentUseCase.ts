/**
 * CreateClientIntentUseCase
 * Use case para criar uma intenção específica de cliente
 */

import { v4 as uuidv4 } from 'uuid';
import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { ClientId } from '../../domain/value-objects/ClientId';
import { IntentStatus } from '../../domain/value-objects/IntentStatus';
import { CreateClientIntentDTO } from '../dtos/CreateIntentDTO';
import { AppError } from '../../shared/utils/AppError';
import { IntentValidator } from '../../domain/services/IntentValidator';

export class CreateClientIntentUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(dto: CreateClientIntentDTO): Promise<Intent> {
    // Validações
    if (!dto.clientId || dto.clientId.trim().length === 0) {
      throw AppError.badRequest('clientId is required');
    }

    IntentValidator.validateLabel(dto.label);
    IntentValidator.validateStatus(dto.status);
    IntentValidator.validateStatusForCreation(dto.status);

    const synonyms = IntentValidator.validateSynonyms(dto.synonyms);
    const examplePhrases = IntentValidator.validateExamplePhrases(dto.examplePhrases);

    const clientId = ClientId.create(dto.clientId);

    // Verifica se já existe uma intenção com mesmo label
    const existing = await this.repository.findByLabel(dto.label.trim());

    if (existing) {
      throw AppError.conflict(`Intent with label "${dto.label}" already exists`);
    }

    // Cria a intenção como específica de cliente
    const intent = Intent.create(
      uuidv4(),
      dto.label,
      dto.description || '',
      dto.status,
      synonyms,
      examplePhrases,
      false // isDefault = false
    );

    const createdIntent = await this.repository.create(intent);

    // Vincula ao cliente
    await this.repository.linkIntentToClient(createdIntent.id, clientId);

    return createdIntent;
  }
}

