/**
 * TenantId Value Object Tests
 */

import { TenantId } from '../../../../src/domain/value-objects/TenantId';

describe('TenantId', () => {
  describe('create', () => {
    it('should create a TenantId successfully', () => {
      const tenantId = TenantId.create('tenant-001');

      expect(tenantId).toBeInstanceOf(TenantId);
      expect(tenantId.getValue()).toBe('tenant-001');
    });

    it('should throw error when value is empty', () => {
      expect(() => {
        TenantId.create('');
      }).toThrow('TenantId cannot be empty');
    });

    it('should throw error when value is only whitespace', () => {
      expect(() => {
        TenantId.create('   ');
      }).toThrow('TenantId cannot be empty');
    });
  });

  describe('equals', () => {
    it('should return true for equal TenantIds', () => {
      const tenantId1 = TenantId.create('tenant-001');
      const tenantId2 = TenantId.create('tenant-001');

      expect(tenantId1.equals(tenantId2)).toBe(true);
    });

    it('should return false for different TenantIds', () => {
      const tenantId1 = TenantId.create('tenant-001');
      const tenantId2 = TenantId.create('tenant-002');

      expect(tenantId1.equals(tenantId2)).toBe(false);
    });
  });
});

