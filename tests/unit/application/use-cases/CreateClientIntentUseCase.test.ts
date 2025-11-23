/**
 * CreateClientIntentUseCase Tests
 */

import { CreateClientIntentUseCase } from '../../../../src/application/use-cases/CreateClientIntentUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { ClientId } from '../../../../src/domain/value-objects/ClientId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('CreateClientIntentUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: CreateClientIntentUseCase;

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

    useCase = new CreateClientIntentUseCase(repository);
  });

  it('should create a client intent successfully', async () => {
    const dto = {
      clientId: 'client-001',
      label: 'greeting',
      description: 'Greeting intent',
      status: IntentStatus.ACTIVE,
      synonyms: ['marcar'],
      examplePhrases: ['Quero marcar'],
    };

    repository.findByLabel.mockResolvedValue(null);

    const mockIntent = Intent.create(
      'intent-id',
      dto.label,
      dto.description,
      dto.status,
      dto.synonyms,
      dto.examplePhrases,
      false
    );

    repository.create.mockResolvedValue(mockIntent);
    repository.linkIntentToClient.mockResolvedValue();

    const result = await useCase.execute(dto);

    expect(result).toBeInstanceOf(Intent);
    expect(result.isDefault).toBe(false);
    expect(repository.findByLabel).toHaveBeenCalledWith(dto.label);
    expect(repository.create).toHaveBeenCalled();
    expect(repository.linkIntentToClient).toHaveBeenCalledWith(
      mockIntent.id,
      expect.any(ClientId)
    );
  });

  it('should throw error when clientId is missing', async () => {
    const dto = {
      clientId: '',
      label: 'greeting',
      description: 'Description',
      status: IntentStatus.ACTIVE,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(AppError);
  });

  it('should throw error when intent already exists', async () => {
    const dto = {
      clientId: 'client-001',
      label: 'greeting',
      description: 'Description',
      status: IntentStatus.ACTIVE,
    };

    const existingIntent = Intent.create('existing-id', dto.label, 'Existing', IntentStatus.ACTIVE);
    repository.findByLabel.mockResolvedValue(existingIntent);

    await expect(useCase.execute(dto)).rejects.toThrow(AppError);
    expect(repository.create).not.toHaveBeenCalled();
  });
});

