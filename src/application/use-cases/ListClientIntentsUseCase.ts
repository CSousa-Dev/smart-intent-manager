/**
 * ListClientIntentsUseCase
 * Use case para listar intenções de um cliente específico
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { ClientId } from '../../domain/value-objects/ClientId';
import { AppError } from '../../shared/utils/AppError';

export class ListClientIntentsUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(clientId: string): Promise<Intent[]> {
    if (!clientId || clientId.trim().length === 0) {
      throw AppError.badRequest('clientId is required');
    }

    const clientIdVO = ClientId.create(clientId);
    return await this.repository.findIntentsByClient(clientIdVO);
  }
}

