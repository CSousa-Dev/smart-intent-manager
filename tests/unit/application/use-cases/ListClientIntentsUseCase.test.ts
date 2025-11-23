/**
 * ListClientIntentsUseCase Tests
 */

import { ListClientIntentsUseCase } from '../../../../src/application/use-cases/ListClientIntentsUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { ClientId } from '../../../../src/domain/value-objects/ClientId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('ListClientIntentsUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: ListClientIntentsUseCase;

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

    useCase = new ListClientIntentsUseCase(repository);
  });

  it('should list intents by client successfully', async () => {
    const clientId = 'client-001';
    const mockIntents = [
      Intent.create('intent-1', 'greeting', 'Description 1', IntentStatus.ACTIVE),
      Intent.create('intent-2', 'farewell', 'Description 2', IntentStatus.SUGGESTED),
    ];

    repository.findIntentsByClient.mockResolvedValue(mockIntents);

    const result = await useCase.execute(clientId);

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('intent-1');
    expect(result[1]?.id).toBe('intent-2');
    expect(repository.findIntentsByClient).toHaveBeenCalledWith(expect.any(ClientId));
  });

  it('should return empty array when client has no intents', async () => {
    const clientId = 'client-001';
    repository.findIntentsByClient.mockResolvedValue([]);

    const result = await useCase.execute(clientId);

    expect(result).toHaveLength(0);
    expect(repository.findIntentsByClient).toHaveBeenCalled();
  });

  it('should throw error when clientId is empty', async () => {
    await expect(useCase.execute('')).rejects.toThrow(AppError);
    expect(repository.findIntentsByClient).not.toHaveBeenCalled();
  });

  it('should throw error when clientId is only whitespace', async () => {
    await expect(useCase.execute('   ')).rejects.toThrow(AppError);
    expect(repository.findIntentsByClient).not.toHaveBeenCalled();
  });
});

