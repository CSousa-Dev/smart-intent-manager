import { IntentTenantRelationshipService } from '../../../../src/domain/services/IntentTenantRelationshipService';
import { Intent } from '../../../../src/domain/entities/Intent';
import { TenantId } from '../../../../src/domain/value-objects/TenantId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';

describe('IntentTenantRelationshipService', () => {
  let repository: jest.Mocked<IIntentRepository>;

  beforeEach(() => {
    repository = {
      isIntentExcludedFromTenant: jest.fn(),
      removeExclusion: jest.fn(),
      isIntentLinkedToTenant: jest.fn(),
      linkIntentToTenant: jest.fn(),
      excludeIntentFromTenant: jest.fn(),
    } as any;
  });

  describe('ensureIntentCanBeExcluded', () => {
    it('should not throw for default intent', () => {
      const intent = Intent.createForCreation(
        'intent-id',
        'label',
        'Description',
        IntentStatus.ACTIVE,
        [],
        [],
        true // isDefault
      );

      expect(() => IntentTenantRelationshipService.ensureIntentCanBeExcluded(intent)).not.toThrow();
    });

    it('should throw for non-default intent', () => {
      const intent = Intent.createForCreation(
        'intent-id',
        'label',
        'Description',
        IntentStatus.ACTIVE,
        [],
        [],
        false // not default
      );

      expect(() => IntentTenantRelationshipService.ensureIntentCanBeExcluded(intent)).toThrow(
        'Can only exclude default intents from tenants'
      );
    });
  });

  describe('requiresExplicitLinking', () => {
    it('should return false for default intent', () => {
      const intent = Intent.createForCreation(
        'intent-id',
        'label',
        'Description',
        IntentStatus.ACTIVE,
        [],
        [],
        true // isDefault
      );

      expect(IntentTenantRelationshipService.requiresExplicitLinking(intent)).toBe(false);
    });

    it('should return true for non-default intent', () => {
      const intent = Intent.createForCreation(
        'intent-id',
        'label',
        'Description',
        IntentStatus.ACTIVE,
        [],
        [],
        false // not default
      );

      expect(IntentTenantRelationshipService.requiresExplicitLinking(intent)).toBe(true);
    });
  });

  describe('linkIntentToTenant', () => {
    it('should remove exclusion and link if intent is excluded', async () => {
      const intentId = 'intent-001';
      const tenantId = TenantId.create('tenant-001');

      repository.isIntentExcludedFromTenant.mockResolvedValue(true);
      repository.isIntentLinkedToTenant.mockResolvedValue(false);

      await IntentTenantRelationshipService.linkIntentToTenant(repository, intentId, tenantId);

      expect(repository.removeExclusion).toHaveBeenCalledWith(intentId, tenantId);
      expect(repository.linkIntentToTenant).toHaveBeenCalledWith(intentId, tenantId);
    });

    it('should link if intent is not excluded and not linked', async () => {
      const intentId = 'intent-001';
      const tenantId = TenantId.create('tenant-001');

      repository.isIntentExcludedFromTenant.mockResolvedValue(false);
      repository.isIntentLinkedToTenant.mockResolvedValue(false);

      await IntentTenantRelationshipService.linkIntentToTenant(repository, intentId, tenantId);

      expect(repository.removeExclusion).not.toHaveBeenCalled();
      expect(repository.linkIntentToTenant).toHaveBeenCalledWith(intentId, tenantId);
    });

    it('should not link if intent is already linked', async () => {
      const intentId = 'intent-001';
      const tenantId = TenantId.create('tenant-001');

      repository.isIntentExcludedFromTenant.mockResolvedValue(false);
      repository.isIntentLinkedToTenant.mockResolvedValue(true);

      await IntentTenantRelationshipService.linkIntentToTenant(repository, intentId, tenantId);

      expect(repository.removeExclusion).not.toHaveBeenCalled();
      expect(repository.linkIntentToTenant).not.toHaveBeenCalled();
    });
  });

  describe('excludeIntentFromTenant', () => {
    it('should exclude intent when not already excluded', async () => {
      const intentId = 'intent-001';
      const tenantId = TenantId.create('tenant-001');

      repository.isIntentExcludedFromTenant.mockResolvedValue(false);

      await IntentTenantRelationshipService.excludeIntentFromTenant(repository, intentId, tenantId);

      expect(repository.excludeIntentFromTenant).toHaveBeenCalledWith(intentId, tenantId);
    });

    it('should throw when intent is already excluded', async () => {
      const intentId = 'intent-001';
      const tenantId = TenantId.create('tenant-001');

      repository.isIntentExcludedFromTenant.mockResolvedValue(true);

      await expect(
        IntentTenantRelationshipService.excludeIntentFromTenant(repository, intentId, tenantId)
      ).rejects.toThrow('Intent is already excluded from this tenant');

      expect(repository.excludeIntentFromTenant).not.toHaveBeenCalled();
    });
  });
});

