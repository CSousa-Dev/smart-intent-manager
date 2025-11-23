/**
 * IntentValidator Service Tests
 */

import { IntentValidator } from '../../../../src/domain/services/IntentValidator';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';

describe('IntentValidator', () => {
  describe('validateLabel', () => {
    it('should not throw for valid label', () => {
      expect(() => IntentValidator.validateLabel('valid-label')).not.toThrow();
    });

    it('should throw for empty label', () => {
      expect(() => IntentValidator.validateLabel('')).toThrow('Label cannot be empty');
    });

    it('should throw for whitespace-only label', () => {
      expect(() => IntentValidator.validateLabel('   ')).toThrow('Label cannot be empty');
    });
  });

  describe('validateStatus', () => {
    it('should not throw for valid status', () => {
      expect(() => IntentValidator.validateStatus('ACTIVE')).not.toThrow();
      expect(() => IntentValidator.validateStatus('INACTIVE')).not.toThrow();
      expect(() => IntentValidator.validateStatus('SUGGESTED')).not.toThrow();
    });

    it('should throw for invalid status', () => {
      expect(() => IntentValidator.validateStatus('INVALID')).toThrow();
      expect(() => IntentValidator.validateStatus('')).toThrow();
    });
  });

  describe('validateStatusForCreation', () => {
    it('should not throw for ACTIVE', () => {
      expect(() => IntentValidator.validateStatusForCreation(IntentStatus.ACTIVE)).not.toThrow();
    });

    it('should not throw for SUGGESTED', () => {
      expect(() => IntentValidator.validateStatusForCreation(IntentStatus.SUGGESTED)).not.toThrow();
    });

    it('should throw for INACTIVE', () => {
      expect(() => IntentValidator.validateStatusForCreation(IntentStatus.INACTIVE)).toThrow();
    });
  });

  describe('validateSynonyms', () => {
    it('should return empty array for undefined', () => {
      const result = IntentValidator.validateSynonyms(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array for null', () => {
      const result = IntentValidator.validateSynonyms(null);
      expect(result).toEqual([]);
    });

    it('should return array for valid synonyms', () => {
      const synonyms = ['marcar', 'agendar', 'horário'];
      const result = IntentValidator.validateSynonyms(synonyms);
      expect(result).toEqual(synonyms);
    });

    it('should throw for non-array', () => {
      expect(() => IntentValidator.validateSynonyms('not-array')).toThrow();
      expect(() => IntentValidator.validateSynonyms({})).toThrow();
    });

    it('should throw for array with non-string items', () => {
      expect(() => IntentValidator.validateSynonyms([1, 2, 3])).toThrow();
      expect(() => IntentValidator.validateSynonyms(['valid', 123])).toThrow();
    });
  });

  describe('validateExamplePhrases', () => {
    it('should return empty array for undefined', () => {
      const result = IntentValidator.validateExamplePhrases(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array for null', () => {
      const result = IntentValidator.validateExamplePhrases(null);
      expect(result).toEqual([]);
    });

    it('should return array for valid examplePhrases', () => {
      const phrases = ['Quero marcar um horário', 'Posso agendar?'];
      const result = IntentValidator.validateExamplePhrases(phrases);
      expect(result).toEqual(phrases);
    });

    it('should throw for non-array', () => {
      expect(() => IntentValidator.validateExamplePhrases('not-array')).toThrow();
      expect(() => IntentValidator.validateExamplePhrases({})).toThrow();
    });

    it('should throw for array with non-string items', () => {
      expect(() => IntentValidator.validateExamplePhrases([1, 2, 3])).toThrow();
      expect(() => IntentValidator.validateExamplePhrases(['valid', 123])).toThrow();
    });
  });
});

