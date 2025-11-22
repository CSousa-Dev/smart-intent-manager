/**
 * GetIntentUseCase
 * Use case para buscar uma intenção por ID
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { AppError } from '../../shared/utils/AppError';

export class GetIntentUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(id: string): Promise<Intent> {
    if (!id || id.trim().length === 0) {
      throw AppError.badRequest('Intent id is required');
    }

    const intent = await this.repository.findById(id);

    if (!intent) {
      throw AppError.notFound(`Intent with id ${id} not found`);
    }

    return intent;
  }
}

