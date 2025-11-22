/**
 * ListIntentsByClientUseCase Tests
 */

import { ListIntentsByClientUseCase } from '../../../../src/application/use-cases/ListIntentsByClientUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { ClientId } from '../../../../src/domain/value-objects/ClientId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('ListIntentsByClientUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: ListIntentsByClientUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByClientAndLabel: jest.fn(),
      findAllByClient: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new ListIntentsByClientUseCase(repository);
  });

  it('should list intents by client successfully', async () => {
    const clientId = 'client-001';
    const mockIntents = [
      Intent.create('intent-1', ClientId.create(clientId), 'greeting', 'Description 1', IntentStatus.ACTIVE),
      Intent.create('intent-2', ClientId.create(clientId), 'farewell', 'Description 2', IntentStatus.SUGGESTED),
    ];

    repository.findAllByClient.mockResolvedValue(mockIntents);

    const result = await useCase.execute(clientId);

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('intent-1');
    expect(result[1]?.id).toBe('intent-2');
    expect(repository.findAllByClient).toHaveBeenCalledWith(expect.any(ClientId));
  });

  it('should return empty array when client has no intents', async () => {
    const clientId = 'client-001';
    repository.findAllByClient.mockResolvedValue([]);

    const result = await useCase.execute(clientId);

    expect(result).toHaveLength(0);
    expect(repository.findAllByClient).toHaveBeenCalled();
  });

  it('should throw error when clientId is empty', async () => {
    await expect(useCase.execute('')).rejects.toThrow(AppError);
    expect(repository.findAllByClient).not.toHaveBeenCalled();
  });

  it('should throw error when clientId is only whitespace', async () => {
    await expect(useCase.execute('   ')).rejects.toThrow(AppError);
    expect(repository.findAllByClient).not.toHaveBeenCalled();
  });
});

