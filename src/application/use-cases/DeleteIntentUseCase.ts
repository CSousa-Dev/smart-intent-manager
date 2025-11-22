/**
 * DeleteIntentUseCase
 * Use case para excluir uma intenção
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { AppError } from '../../shared/utils/AppError';

export class DeleteIntentUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(id: string): Promise<void> {
    if (!id || id.trim().length === 0) {
      throw AppError.badRequest('Intent id is required');
    }

    // Verifica se a intenção existe
    const intent = await this.repository.findById(id);

    if (!intent) {
      throw AppError.notFound(`Intent with id ${id} not found`);
    }

    await this.repository.delete(id);
  }
}

