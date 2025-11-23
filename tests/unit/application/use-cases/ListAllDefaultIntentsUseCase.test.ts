/**
 * ListAllDefaultIntentsUseCase Tests
 */

import { ListAllDefaultIntentsUseCase } from '../../../../src/application/use-cases/ListAllDefaultIntentsUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';

describe('ListAllDefaultIntentsUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: ListAllDefaultIntentsUseCase;

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

    useCase = new ListAllDefaultIntentsUseCase(repository);
  });

  it('should list all default intents successfully', async () => {
    const mockIntents = [
      Intent.create('intent-1', 'greeting', 'Description 1', IntentStatus.ACTIVE, [], [], true),
      Intent.create('intent-2', 'farewell', 'Description 2', IntentStatus.SUGGESTED, [], [], true),
    ];

    repository.findAllDefault.mockResolvedValue(mockIntents);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('intent-1');
    expect(result[1]?.id).toBe('intent-2');
    expect(repository.findAllDefault).toHaveBeenCalled();
  });

  it('should return empty array when no default intents exist', async () => {
    repository.findAllDefault.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toHaveLength(0);
    expect(repository.findAllDefault).toHaveBeenCalled();
  });
});

