import { IntentTenantValidationService } from '../../../../src/domain/services/IntentTenantValidationService';
import { ITenantService } from '../../../../src/domain/services/ITenantService';
import { TenantId } from '../../../../src/domain/value-objects/TenantId';

describe('IntentTenantValidationService', () => {
  let tenantService: jest.Mocked<ITenantService>;

  beforeEach(() => {
    tenantService = {
      exists: jest.fn(),
      findById: jest.fn(),
    } as any;
  });

  describe('ensureTenantExistsForNonDefaultIntent', () => {
    it('should not throw when tenant exists', async () => {
      const tenantId = TenantId.create('tenant-001');
      tenantService.exists.mockResolvedValue(true);

      await expect(
        IntentTenantValidationService.ensureTenantExistsForNonDefaultIntent(tenantService, tenantId)
      ).resolves.not.toThrow();
    });

    it('should throw when tenant does not exist', async () => {
      const tenantId = TenantId.create('non-existent-tenant');
      tenantService.exists.mockResolvedValue(false);

      await expect(
        IntentTenantValidationService.ensureTenantExistsForNonDefaultIntent(tenantService, tenantId)
      ).rejects.toThrow('Tenant with id "non-existent-tenant" does not exist');
    });
  });
});

