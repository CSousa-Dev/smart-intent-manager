/**
 * ListIntentsByClientUseCase
 * Use case para listar intenções por cliente
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { ClientId } from '../../domain/value-objects/ClientId';
import { AppError } from '../../shared/utils/AppError';

export class ListIntentsByClientUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(clientId: string): Promise<Intent[]> {
    if (!clientId || clientId.trim().length === 0) {
      throw AppError.badRequest('clientId is required');
    }

    const clientIdVO = ClientId.create(clientId);
    return await this.repository.findAllByClient(clientIdVO);
  }
}

