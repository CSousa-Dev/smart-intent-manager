/**
 * IntentAccessService Service Tests
 */

import { IntentAccessService } from '../../../../src/domain/services/IntentAccessService';
import { Intent } from '../../../../src/domain/entities/Intent';
import { ClientId } from '../../../../src/domain/value-objects/ClientId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';

describe('IntentAccessService', () => {
  const clientId = ClientId.create('client-001');

  describe('hasAccess', () => {
    it('should return true for default intent when not excluded', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE, [], [], true);

      const hasAccess = IntentAccessService.hasAccess(intent, clientId, false, false);

      expect(hasAccess).toBe(true);
    });

    it('should return false for default intent when excluded', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE, [], [], true);

      const hasAccess = IntentAccessService.hasAccess(intent, clientId, false, true);

      expect(hasAccess).toBe(false);
    });

    it('should return true for non-default intent when linked', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE, [], [], false);

      const hasAccess = IntentAccessService.hasAccess(intent, clientId, true, false);

      expect(hasAccess).toBe(true);
    });

    it('should return false for non-default intent when not linked', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE, [], [], false);

      const hasAccess = IntentAccessService.hasAccess(intent, clientId, false, false);

      expect(hasAccess).toBe(false);
    });
  });

  describe('filterByClientAccess', () => {
    it('should filter intents by client access', () => {
      const defaultIntent = Intent.create('default-id', 'default', 'Description', IntentStatus.ACTIVE, [], [], true);
      const clientIntent = Intent.create('client-id', 'client', 'Description', IntentStatus.ACTIVE, [], [], false);
      const excludedIntent = Intent.create('excluded-id', 'excluded', 'Description', IntentStatus.ACTIVE, [], [], true);

      const intents = [defaultIntent, clientIntent, excludedIntent];
      const linkedIds = new Set(['client-id']);
      const excludedIds = new Set(['excluded-id']);

      const filtered = IntentAccessService.filterByClientAccess(intents, clientId, linkedIds, excludedIds);

      expect(filtered).toHaveLength(2);
      expect(filtered.map((i) => i.id)).toContain('default-id');
      expect(filtered.map((i) => i.id)).toContain('client-id');
      expect(filtered.map((i) => i.id)).not.toContain('excluded-id');
    });
  });
});

