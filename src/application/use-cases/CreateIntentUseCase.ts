/**
 * CreateIntentUseCase
 * Use case para criar uma nova intenção
 */

import { v4 as uuidv4 } from 'uuid';
import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';
import { ClientId } from '../../domain/value-objects/ClientId';
import { IntentStatus, isValidIntentStatus } from '../../domain/value-objects/IntentStatus';
import { CreateIntentDTO } from '../dtos/CreateIntentDTO';
import { AppError } from '../../shared/utils/AppError';

export class CreateIntentUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(dto: CreateIntentDTO): Promise<Intent> {
    // Validações
    if (!dto.clientId || dto.clientId.trim().length === 0) {
      throw AppError.badRequest('clientId is required');
    }

    if (!dto.label || dto.label.trim().length === 0) {
      throw AppError.badRequest('label is required');
    }

    if (!dto.status || !isValidIntentStatus(dto.status)) {
      throw AppError.badRequest('status must be ACTIVE, INACTIVE, or SUGGESTED');
    }

    // Valida se status é ACTIVE ou SUGGESTED (conforme especificação)
    if (dto.status !== IntentStatus.ACTIVE && dto.status !== IntentStatus.SUGGESTED) {
      throw AppError.badRequest('status must be ACTIVE or SUGGESTED when creating');
    }

    const clientId = ClientId.create(dto.clientId);

    // Verifica se já existe uma intenção com mesmo clientId + label
    const existing = await this.repository.findByClientAndLabel(clientId, dto.label.trim());

    if (existing) {
      throw AppError.conflict(
        `Intent with label "${dto.label}" already exists for clientId: ${dto.clientId}`
      );
    }

    // Cria a intenção
    const intent = Intent.create(
      uuidv4(),
      clientId,
      dto.label,
      dto.description || '',
      dto.status
    );

    return await this.repository.create(intent);
  }
}

