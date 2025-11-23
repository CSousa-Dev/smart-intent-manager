/**
 * DeleteIntentUseCase Tests
 */

import { DeleteIntentUseCase } from '../../../../src/application/use-cases/DeleteIntentUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('DeleteIntentUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: DeleteIntentUseCase;

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

    useCase = new DeleteIntentUseCase(repository);
  });

  it('should delete intent successfully', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE);

    repository.findById.mockResolvedValue(existingIntent);
    repository.delete.mockResolvedValue();

    await useCase.execute(intentId);

    expect(repository.findById).toHaveBeenCalledWith(intentId);
    expect(repository.delete).toHaveBeenCalledWith(intentId);
  });

  it('should throw error when intent not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(AppError);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should throw error when id is empty', async () => {
    await expect(useCase.execute('')).rejects.toThrow(AppError);
    expect(repository.findById).not.toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
