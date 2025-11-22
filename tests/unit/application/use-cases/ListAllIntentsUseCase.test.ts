/**
 * ListAllIntentsUseCase Tests
 */

import { ListAllIntentsUseCase } from '../../../../src/application/use-cases/ListAllIntentsUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { ClientId } from '../../../../src/domain/value-objects/ClientId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';

describe('ListAllIntentsUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: ListAllIntentsUseCase;

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

    useCase = new ListAllIntentsUseCase(repository);
  });

  it('should list all intents successfully', async () => {
    const mockIntents = [
      Intent.create('intent-1', ClientId.create('client-001'), 'greeting', 'Description 1', IntentStatus.ACTIVE),
      Intent.create('intent-2', ClientId.create('client-002'), 'farewell', 'Description 2', IntentStatus.SUGGESTED),
      Intent.create('intent-3', ClientId.create('client-001'), 'question', 'Description 3', IntentStatus.INACTIVE),
    ];

    repository.findAll.mockResolvedValue(mockIntents);

    const result = await useCase.execute();

    expect(result).toHaveLength(3);
    expect(result[0]?.id).toBe('intent-1');
    expect(result[1]?.id).toBe('intent-2');
    expect(result[2]?.id).toBe('intent-3');
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('should return empty array when no intents exist', async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toHaveLength(0);
    expect(repository.findAll).toHaveBeenCalled();
  });
});

