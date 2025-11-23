/**
 * GetIntentUseCase Tests
 */

import { GetIntentUseCase } from '../../../../src/application/use-cases/GetIntentUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('GetIntentUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: GetIntentUseCase;

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

    useCase = new GetIntentUseCase(repository);
  });

  it('should get an intent by id successfully', async () => {
    const intentId = 'intent-id';
    const mockIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE);

    repository.findById.mockResolvedValue(mockIntent);

    const result = await useCase.execute(intentId);

    expect(result).toBeInstanceOf(Intent);
    expect(result.id).toBe(intentId);
    expect(repository.findById).toHaveBeenCalledWith(intentId);
  });

  it('should throw error when intent not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(AppError);
    expect(repository.findById).toHaveBeenCalledWith('non-existent-id');
  });

  it('should throw error when id is empty', async () => {
    await expect(useCase.execute('')).rejects.toThrow(AppError);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('should throw error when id is only whitespace', async () => {
    await expect(useCase.execute('   ')).rejects.toThrow(AppError);
    expect(repository.findById).not.toHaveBeenCalled();
  });
});
