/**
 * GetIntentUseCase Tests
 */

import { GetIntentUseCase } from '../../../../src/application/use-cases/GetIntentUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { ClientId } from '../../../../src/domain/value-objects/ClientId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('GetIntentUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: GetIntentUseCase;

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

    useCase = new GetIntentUseCase(repository);
  });

  it('should get an intent by id successfully', async () => {
    const intentId = 'intent-id';
    const mockIntent = Intent.create(
      intentId,
      ClientId.create('client-001'),
      'greeting',
      'Description',
      IntentStatus.ACTIVE
    );

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

