/**
 * IntentAccessService Service Tests
 */

import { IntentAccessService } from '../../../../src/domain/services/IntentAccessService';
import { Intent } from '../../../../src/domain/entities/Intent';
import { TenantId } from '../../../../src/domain/value-objects/TenantId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';

describe('IntentAccessService', () => {
  const tenantId = TenantId.create('tenant-001');

  describe('hasAccess', () => {
    it('should return true for default intent when not excluded', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE, [], [], true);

      const hasAccess = IntentAccessService.hasAccess(intent, tenantId, false, false);

      expect(hasAccess).toBe(true);
    });

    it('should return false for default intent when excluded', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE, [], [], true);

      const hasAccess = IntentAccessService.hasAccess(intent, tenantId, false, true);

      expect(hasAccess).toBe(false);
    });

    it('should return true for non-default intent when linked', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE, [], [], false);

      const hasAccess = IntentAccessService.hasAccess(intent, tenantId, true, false);

      expect(hasAccess).toBe(true);
    });

    it('should return false for non-default intent when not linked', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE, [], [], false);

      const hasAccess = IntentAccessService.hasAccess(intent, tenantId, false, false);

      expect(hasAccess).toBe(false);
    });
  });

  describe('filterByTenantAccess', () => {
    it('should filter intents by tenant access', () => {
      const defaultIntent = Intent.create('default-id', 'default', 'Description', IntentStatus.ACTIVE, [], [], true);
      const tenantIntent = Intent.create('tenant-id', 'tenant', 'Description', IntentStatus.ACTIVE, [], [], false);
      const excludedIntent = Intent.create('excluded-id', 'excluded', 'Description', IntentStatus.ACTIVE, [], [], true);

      const intents = [defaultIntent, tenantIntent, excludedIntent];
      const linkedIds = new Set(['tenant-id']);
      const excludedIds = new Set(['excluded-id']);

      const filtered = IntentAccessService.filterByTenantAccess(intents, tenantId, linkedIds, excludedIds);

      expect(filtered).toHaveLength(2);
      expect(filtered.map((i) => i.id)).toContain('default-id');
      expect(filtered.map((i) => i.id)).toContain('tenant-id');
      expect(filtered.map((i) => i.id)).not.toContain('excluded-id');
    });
  });
});
