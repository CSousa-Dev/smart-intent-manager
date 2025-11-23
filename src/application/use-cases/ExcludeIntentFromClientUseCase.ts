/**
 * ExcludeIntentFromClientUseCase
 * Use case para excluir um intent default de um cliente específico
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { ClientId } from '../../domain/value-objects/ClientId';
import { AppError } from '../../shared/utils/AppError';

export class ExcludeIntentFromClientUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(intentId: string, clientId: string): Promise<void> {
    if (!intentId || intentId.trim().length === 0) {
      throw AppError.badRequest('Intent id is required');
    }

    if (!clientId || clientId.trim().length === 0) {
      throw AppError.badRequest('clientId is required');
    }

    const intent = await this.repository.findById(intentId);

    if (!intent) {
      throw AppError.notFound(`Intent with id ${intentId} not found`);
    }

    if (!intent.isDefault) {
      throw AppError.badRequest('Can only exclude default intents from clients');
    }

    const clientIdVO = ClientId.create(clientId);

    // Verifica se já está excluído
    const isExcluded = await this.repository.isIntentExcludedFromClient(intentId, clientIdVO);
    if (isExcluded) {
      throw AppError.conflict('Intent is already excluded from this client');
    }

    await this.repository.excludeIntentFromClient(intentId, clientIdVO);
  }
}

