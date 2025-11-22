/**
 * IntentStatus Value Object Tests
 */

import { IntentStatus, isValidIntentStatus } from '../../../../src/domain/value-objects/IntentStatus';

describe('IntentStatus', () => {
  describe('isValidIntentStatus', () => {
    it('should return true for ACTIVE', () => {
      expect(isValidIntentStatus('ACTIVE')).toBe(true);
    });

    it('should return true for INACTIVE', () => {
      expect(isValidIntentStatus('INACTIVE')).toBe(true);
    });

    it('should return true for SUGGESTED', () => {
      expect(isValidIntentStatus('SUGGESTED')).toBe(true);
    });

    it('should return false for invalid status', () => {
      expect(isValidIntentStatus('INVALID')).toBe(false);
      expect(isValidIntentStatus('')).toBe(false);
      expect(isValidIntentStatus('active')).toBe(false); // case sensitive
    });
  });

  describe('enum values', () => {
    it('should have correct enum values', () => {
      expect(IntentStatus.ACTIVE).toBe('ACTIVE');
      expect(IntentStatus.INACTIVE).toBe('INACTIVE');
      expect(IntentStatus.SUGGESTED).toBe('SUGGESTED');
    });
  });
});

