/**
 * CreateIntentUseCase Tests
 */

import { CreateIntentUseCase } from '../../../../src/application/use-cases/CreateIntentUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { ClientId } from '../../../../src/domain/value-objects/ClientId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('CreateIntentUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: CreateIntentUseCase;

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

    useCase = new CreateIntentUseCase(repository);
  });

  it('should create an intent successfully', async () => {
    const dto = {
      clientId: 'client-001',
      label: 'greeting',
      description: 'Greeting intent',
      status: IntentStatus.ACTIVE,
    };

    repository.findByClientAndLabel.mockResolvedValue(null);

    const mockIntent = Intent.create(
      'intent-id',
      ClientId.create(dto.clientId),
      dto.label,
      dto.description,
      dto.status
    );

    repository.create.mockResolvedValue(mockIntent);

    const result = await useCase.execute(dto);

    expect(result).toBeInstanceOf(Intent);
    expect(repository.findByClientAndLabel).toHaveBeenCalledWith(
      expect.any(ClientId),
      dto.label
    );
    expect(repository.create).toHaveBeenCalled();
  });

  it('should create intent with SUGGESTED status', async () => {
    const dto = {
      clientId: 'client-001',
      label: 'greeting',
      description: 'Greeting intent',
      status: IntentStatus.SUGGESTED,
    };

    repository.findByClientAndLabel.mockResolvedValue(null);

    const mockIntent = Intent.create(
      'intent-id',
      ClientId.create(dto.clientId),
      dto.label,
      dto.description,
      dto.status
    );

    repository.create.mockResolvedValue(mockIntent);

    const result = await useCase.execute(dto);

    expect(result.status).toBe(IntentStatus.SUGGESTED);
  });

  it('should throw error when intent already exists', async () => {
    const dto = {
      clientId: 'client-001',
      label: 'greeting',
      description: 'Greeting intent',
      status: IntentStatus.ACTIVE,
    };

    const existingIntent = Intent.create(
      'existing-id',
      ClientId.create(dto.clientId),
      dto.label,
      'Existing description',
      IntentStatus.ACTIVE
    );

    repository.findByClientAndLabel.mockResolvedValue(existingIntent);

    await expect(useCase.execute(dto)).rejects.toThrow(AppError);
    expect(repository.create).not.toHaveBeenCalled();
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

  it('should throw error when label is missing', async () => {
    const dto = {
      clientId: 'client-001',
      label: '',
      description: 'Description',
      status: IntentStatus.ACTIVE,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(AppError);
  });

  it('should throw error when status is invalid', async () => {
    const dto = {
      clientId: 'client-001',
      label: 'greeting',
      description: 'Description',
      status: 'INVALID' as IntentStatus,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(AppError);
  });

  it('should throw error when status is INACTIVE on creation', async () => {
    const dto = {
      clientId: 'client-001',
      label: 'greeting',
      description: 'Description',
      status: IntentStatus.INACTIVE,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(AppError);
  });

  it('should trim label when creating', async () => {
    const dto = {
      clientId: 'client-001',
      label: '  greeting  ',
      description: 'Description',
      status: IntentStatus.ACTIVE,
    };

    repository.findByClientAndLabel.mockResolvedValue(null);

    const mockIntent = Intent.create(
      'intent-id',
      ClientId.create(dto.clientId),
      'greeting',
      dto.description,
      dto.status
    );

    repository.create.mockResolvedValue(mockIntent);

    await useCase.execute(dto);

    expect(repository.findByClientAndLabel).toHaveBeenCalledWith(
      expect.any(ClientId),
      'greeting'
    );
  });
});

