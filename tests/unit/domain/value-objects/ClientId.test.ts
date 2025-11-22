/**
 * ClientId Value Object Tests
 */

import { ClientId } from '../../../../src/domain/value-objects/ClientId';

describe('ClientId', () => {
  describe('create', () => {
    it('should create a valid ClientId', () => {
      const clientId = ClientId.create('client-001');
      expect(clientId).toBeInstanceOf(ClientId);
      expect(clientId.getValue()).toBe('client-001');
    });

    it('should throw error when value is empty', () => {
      expect(() => ClientId.create('')).toThrow('ClientId cannot be empty');
    });

    it('should throw error when value is only whitespace', () => {
      expect(() => ClientId.create('   ')).toThrow('ClientId cannot be empty');
    });
  });

  describe('equals', () => {
    it('should return true for equal ClientIds', () => {
      const clientId1 = ClientId.create('client-001');
      const clientId2 = ClientId.create('client-001');
      expect(clientId1.equals(clientId2)).toBe(true);
    });

    it('should return false for different ClientIds', () => {
      const clientId1 = ClientId.create('client-001');
      const clientId2 = ClientId.create('client-002');
      expect(clientId1.equals(clientId2)).toBe(false);
    });
  });
});

