/**
 * ListTenantIntentsUseCase Tests
 */

import { ListTenantIntentsUseCase } from '../../../../src/application/use-cases/ListTenantIntentsUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { TenantId } from '../../../../src/domain/value-objects/TenantId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('ListTenantIntentsUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: ListTenantIntentsUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByLabel: jest.fn(),
      findAll: jest.fn(),
      findAllDefault: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      linkIntentToTenant: jest.fn(),
      unlinkIntentFromTenant: jest.fn(),
      excludeIntentFromTenant: jest.fn(),
      removeExclusion: jest.fn(),
      findIntentsByTenant: jest.fn(),
      isIntentLinkedToTenant: jest.fn(),
      isIntentExcludedFromTenant: jest.fn(),
      getLinkedIntentIds: jest.fn(),
      getExcludedIntentIds: jest.fn(),
    } as any;

    useCase = new ListTenantIntentsUseCase(repository);
  });

  it('should list intents by tenant successfully', async () => {
    const tenantId = 'tenant-001';
    const mockIntents = [
      Intent.create('intent-1', 'greeting', 'Description 1', IntentStatus.ACTIVE),
      Intent.create('intent-2', 'farewell', 'Description 2', IntentStatus.SUGGESTED),
    ];

    repository.findIntentsByTenant.mockResolvedValue(mockIntents);

    const result = await useCase.execute(tenantId);

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('intent-1');
    expect(result[1]?.id).toBe('intent-2');
    expect(repository.findIntentsByTenant).toHaveBeenCalledWith(expect.any(TenantId));
  });

  it('should return empty array when tenant has no intents', async () => {
    const tenantId = 'tenant-001';
    repository.findIntentsByTenant.mockResolvedValue([]);

    const result = await useCase.execute(tenantId);

    expect(result).toHaveLength(0);
    expect(repository.findIntentsByTenant).toHaveBeenCalled();
  });

  it('should throw error when tenantId is empty', async () => {
    await expect(useCase.execute('')).rejects.toThrow(AppError);
    expect(repository.findIntentsByTenant).not.toHaveBeenCalled();
  });

  it('should throw error when tenantId is only whitespace', async () => {
    await expect(useCase.execute('   ')).rejects.toThrow(AppError);
    expect(repository.findIntentsByTenant).not.toHaveBeenCalled();
  });
});

