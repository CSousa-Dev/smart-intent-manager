/**
 * ExcludeIntentFromTenantUseCase Tests
 */

import { ExcludeIntentFromTenantUseCase } from '../../../../src/application/use-cases/ExcludeIntentFromTenantUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { TenantId } from '../../../../src/domain/value-objects/TenantId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('ExcludeIntentFromTenantUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: ExcludeIntentFromTenantUseCase;

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

    useCase = new ExcludeIntentFromTenantUseCase(repository);
  });

  it('should exclude default intent from tenant', async () => {
    const intentId = 'intent-id';
    const tenantId = 'tenant-001';
    const intent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], true);

    repository.findById.mockResolvedValue(intent);
    repository.isIntentExcludedFromTenant.mockResolvedValue(false);
    repository.excludeIntentFromTenant.mockResolvedValue();

    await useCase.execute(intentId, tenantId);

    expect(repository.findById).toHaveBeenCalledWith(intentId);
    expect(repository.excludeIntentFromTenant).toHaveBeenCalledWith(intentId, expect.any(TenantId));
  });

  it('should throw error when intent not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id', 'tenant-001')).rejects.toThrow(AppError);
  });

  it('should throw error when intent is not default', async () => {
    const intentId = 'intent-id';
    const tenantId = 'tenant-001';
    const intent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], false);

    repository.findById.mockResolvedValue(intent);

    await expect(useCase.execute(intentId, tenantId)).rejects.toThrow(AppError);
    expect(repository.excludeIntentFromTenant).not.toHaveBeenCalled();
  });

  it('should throw error when intent is already excluded', async () => {
    const intentId = 'intent-id';
    const tenantId = 'tenant-001';
    const intent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], true);

    repository.findById.mockResolvedValue(intent);
    repository.isIntentExcludedFromTenant.mockResolvedValue(true);

    await expect(useCase.execute(intentId, tenantId)).rejects.toThrow(AppError);
  });

  it('should throw error when intentId is empty', async () => {
    await expect(useCase.execute('', 'tenant-001')).rejects.toThrow(AppError);
  });

  it('should throw error when tenantId is empty', async () => {
    await expect(useCase.execute('intent-id', '')).rejects.toThrow(AppError);
  });
});

