/**
 * LinkIntentToTenantUseCase Tests
 */

import { LinkIntentToTenantUseCase } from '../../../../src/application/use-cases/LinkIntentToTenantUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { TenantId } from '../../../../src/domain/value-objects/TenantId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('LinkIntentToTenantUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: LinkIntentToTenantUseCase;

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

    useCase = new LinkIntentToTenantUseCase(repository);
  });

  it('should link default intent to tenant', async () => {
    const intentId = 'intent-id';
    const tenantId = 'tenant-001';
    const intent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], true);

    repository.findById.mockResolvedValue(intent);
    repository.isIntentExcludedFromTenant.mockResolvedValue(false);
    repository.removeExclusion.mockResolvedValue();

    await useCase.execute(intentId, tenantId);

    expect(repository.findById).toHaveBeenCalledWith(intentId);
    expect(repository.removeExclusion).not.toHaveBeenCalled();
  });

  it('should remove exclusion if intent is excluded', async () => {
    const intentId = 'intent-id';
    const tenantId = 'tenant-001';
    const intent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], true);

    repository.findById.mockResolvedValue(intent);
    repository.isIntentExcludedFromTenant.mockResolvedValue(true);
    repository.removeExclusion.mockResolvedValue();

    await useCase.execute(intentId, tenantId);

    expect(repository.removeExclusion).toHaveBeenCalledWith(intentId, expect.any(TenantId));
  });

  it('should link non-default intent to tenant', async () => {
    const intentId = 'intent-id';
    const tenantId = 'tenant-001';
    const intent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], false);

    repository.findById.mockResolvedValue(intent);
    repository.isIntentExcludedFromTenant.mockResolvedValue(false);
    repository.isIntentLinkedToTenant.mockResolvedValue(false);
    repository.linkIntentToTenant.mockResolvedValue();

    await useCase.execute(intentId, tenantId);

    expect(repository.linkIntentToTenant).toHaveBeenCalledWith(intentId, expect.any(TenantId));
  });

  it('should throw error when intent not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id', 'tenant-001')).rejects.toThrow(AppError);
  });

  it('should throw error when intentId is empty', async () => {
    await expect(useCase.execute('', 'tenant-001')).rejects.toThrow(AppError);
  });

  it('should throw error when tenantId is empty', async () => {
    await expect(useCase.execute('intent-id', '')).rejects.toThrow(AppError);
  });
});

