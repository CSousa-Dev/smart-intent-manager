/**
 * LinkIntentToClientUseCase
 * Use case para vincular um intent default a um cliente específico
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { ClientId } from '../../domain/value-objects/ClientId';
import { AppError } from '../../shared/utils/AppError';

export class LinkIntentToClientUseCase {
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

    const clientIdVO = ClientId.create(clientId);

    // Remove exclusão se existir
    const isExcluded = await this.repository.isIntentExcludedFromClient(intentId, clientIdVO);
    if (isExcluded) {
      await this.repository.removeExclusion(intentId, clientIdVO);
    }

    // Se não for default, vincula diretamente
    if (!intent.isDefault) {
      const isLinked = await this.repository.isIntentLinkedToClient(intentId, clientIdVO);
      if (!isLinked) {
        await this.repository.linkIntentToClient(intentId, clientIdVO);
      }
    }
    // Se for default, não precisa vincular (já está disponível)
  }
}

