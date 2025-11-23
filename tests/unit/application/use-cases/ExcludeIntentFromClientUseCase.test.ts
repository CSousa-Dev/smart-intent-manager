/**
 * ExcludeIntentFromClientUseCase Tests
 */

import { ExcludeIntentFromClientUseCase } from '../../../../src/application/use-cases/ExcludeIntentFromClientUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { ClientId } from '../../../../src/domain/value-objects/ClientId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('ExcludeIntentFromClientUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: ExcludeIntentFromClientUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByLabel: jest.fn(),
      findAll: jest.fn(),
      findAllDefault: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      linkIntentToClient: jest.fn(),
      unlinkIntentFromClient: jest.fn(),
      excludeIntentFromClient: jest.fn(),
      removeExclusion: jest.fn(),
      findIntentsByClient: jest.fn(),
      isIntentLinkedToClient: jest.fn(),
      isIntentExcludedFromClient: jest.fn(),
      getLinkedIntentIds: jest.fn(),
      getExcludedIntentIds: jest.fn(),
    } as any;

    useCase = new ExcludeIntentFromClientUseCase(repository);
  });

  it('should exclude default intent from client', async () => {
    const intentId = 'intent-id';
    const clientId = 'client-001';
    const intent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], true);

    repository.findById.mockResolvedValue(intent);
    repository.isIntentExcludedFromClient.mockResolvedValue(false);
    repository.excludeIntentFromClient.mockResolvedValue();

    await useCase.execute(intentId, clientId);

    expect(repository.findById).toHaveBeenCalledWith(intentId);
    expect(repository.excludeIntentFromClient).toHaveBeenCalledWith(intentId, expect.any(ClientId));
  });

  it('should throw error when intent not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id', 'client-001')).rejects.toThrow(AppError);
  });

  it('should throw error when intent is not default', async () => {
    const intentId = 'intent-id';
    const clientId = 'client-001';
    const intent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], false);

    repository.findById.mockResolvedValue(intent);

    await expect(useCase.execute(intentId, clientId)).rejects.toThrow(AppError);
    expect(repository.excludeIntentFromClient).not.toHaveBeenCalled();
  });

  it('should throw error when intent is already excluded', async () => {
    const intentId = 'intent-id';
    const clientId = 'client-001';
    const intent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], true);

    repository.findById.mockResolvedValue(intent);
    repository.isIntentExcludedFromClient.mockResolvedValue(true);

    await expect(useCase.execute(intentId, clientId)).rejects.toThrow(AppError);
  });

  it('should throw error when intentId is empty', async () => {
    await expect(useCase.execute('', 'client-001')).rejects.toThrow(AppError);
  });

  it('should throw error when clientId is empty', async () => {
    await expect(useCase.execute('intent-id', '')).rejects.toThrow(AppError);
  });
});

