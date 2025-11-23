/**
 * CreateDefaultIntentUseCase Tests
 */

import { CreateDefaultIntentUseCase } from '../../../../src/application/use-cases/CreateDefaultIntentUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('CreateDefaultIntentUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: CreateDefaultIntentUseCase;

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

    useCase = new CreateDefaultIntentUseCase(repository);
  });

  it('should create a default intent successfully', async () => {
    const dto = {
      label: 'greeting',
      description: 'Greeting intent',
      status: IntentStatus.ACTIVE,
      synonyms: ['marcar', 'agendar'],
      examplePhrases: ['Quero marcar', 'Posso agendar?'],
    };

    repository.findByLabel.mockResolvedValue(null);

    const mockIntent = Intent.create(
      'intent-id',
      dto.label,
      dto.description,
      dto.status,
      dto.synonyms,
      dto.examplePhrases,
      true
    );

    repository.create.mockResolvedValue(mockIntent);

    const result = await useCase.execute(dto);

    expect(result).toBeInstanceOf(Intent);
    expect(result.isDefault).toBe(true);
    expect(result.synonyms).toEqual(dto.synonyms);
    expect(result.examplePhrases).toEqual(dto.examplePhrases);
    expect(repository.findByLabel).toHaveBeenCalledWith(dto.label);
    expect(repository.create).toHaveBeenCalled();
  });

  it('should create intent with SUGGESTED status', async () => {
    const dto = {
      label: 'greeting',
      description: 'Greeting intent',
      status: IntentStatus.SUGGESTED,
    };

    repository.findByLabel.mockResolvedValue(null);

    const mockIntent = Intent.create('intent-id', dto.label, dto.description, dto.status, [], [], true);
    repository.create.mockResolvedValue(mockIntent);

    const result = await useCase.execute(dto);

    expect(result.status).toBe(IntentStatus.SUGGESTED);
    expect(result.isDefault).toBe(true);
  });

  it('should throw error when intent already exists', async () => {
    const dto = {
      label: 'greeting',
      description: 'Greeting intent',
      status: IntentStatus.ACTIVE,
    };

    const existingIntent = Intent.create('existing-id', dto.label, 'Existing description', IntentStatus.ACTIVE, [], [], true);
    repository.findByLabel.mockResolvedValue(existingIntent);

    await expect(useCase.execute(dto)).rejects.toThrow(AppError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw error when label is missing', async () => {
    const dto = {
      label: '',
      description: 'Description',
      status: IntentStatus.ACTIVE,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Label cannot be empty');
  });

  it('should throw error when status is invalid', async () => {
    const dto = {
      label: 'greeting',
      description: 'Description',
      status: 'INVALID' as IntentStatus,
    };

    await expect(useCase.execute(dto)).rejects.toThrow();
  });

  it('should throw error when status is INACTIVE on creation', async () => {
    const dto = {
      label: 'greeting',
      description: 'Description',
      status: IntentStatus.INACTIVE,
    };

    await expect(useCase.execute(dto)).rejects.toThrow();
  });

  it('should validate synonyms array', async () => {
    const dto = {
      label: 'greeting',
      description: 'Description',
      status: IntentStatus.ACTIVE,
      synonyms: 'not-array' as any,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('synonyms must be an array of strings');
  });

  it('should validate examplePhrases array', async () => {
    const dto = {
      label: 'greeting',
      description: 'Description',
      status: IntentStatus.ACTIVE,
      examplePhrases: 'not-array' as any,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('examplePhrases must be an array of strings');
  });
});

