/**
 * Intent Entity Tests
 */

import { Intent } from '../../../../src/domain/entities/Intent';
import { ClientId } from '../../../../src/domain/value-objects/ClientId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';

describe('Intent', () => {
  const clientId = ClientId.create('client-001');

  describe('create', () => {
    it('should create a new intent', () => {
      const intent = Intent.create(
        'intent-id',
        clientId,
        'greeting',
        'Greeting intent',
        IntentStatus.ACTIVE
      );

      expect(intent.id).toBe('intent-id');
      expect(intent.clientId).toBe(clientId);
      expect(intent.label).toBe('greeting');
      expect(intent.description).toBe('Greeting intent');
      expect(intent.status).toBe(IntentStatus.ACTIVE);
      expect(intent.createdAt).toBeInstanceOf(Date);
      expect(intent.updatedAt).toBeInstanceOf(Date);
    });

    it('should trim label whitespace', () => {
      const intent = Intent.create(
        'intent-id',
        clientId,
        '  greeting  ',
        'Description',
        IntentStatus.ACTIVE
      );

      expect(intent.label).toBe('greeting');
    });

    it('should use empty string for description if not provided', () => {
      const intent = Intent.create(
        'intent-id',
        clientId,
        'greeting',
        '',
        IntentStatus.ACTIVE
      );

      expect(intent.description).toBe('');
    });

    it('should throw error when label is empty', () => {
      expect(() => {
        Intent.create('intent-id', clientId, '', 'Description', IntentStatus.ACTIVE);
      }).toThrow('Label cannot be empty');
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute an intent from persistence', () => {
      const createdAt = new Date('2025-01-10T10:30:00Z');
      const updatedAt = new Date('2025-01-10T11:00:00Z');

      const intent = Intent.reconstitute(
        'intent-id',
        clientId,
        'greeting',
        'Description',
        IntentStatus.ACTIVE,
        createdAt,
        updatedAt
      );

      expect(intent.id).toBe('intent-id');
      expect(intent.createdAt).toEqual(createdAt);
      expect(intent.updatedAt).toEqual(updatedAt);
    });
  });

  describe('updateLabel', () => {
    it('should update label', () => {
      const intent = Intent.create(
        'intent-id',
        clientId,
        'greeting',
        'Description',
        IntentStatus.ACTIVE
      );

      const originalUpdatedAt = intent.updatedAt.getTime();
      const updated = intent.updateLabel('farewell');

      expect(updated.label).toBe('farewell');
      expect(updated.id).toBe(intent.id);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
    });

    it('should trim label whitespace', () => {
      const intent = Intent.create(
        'intent-id',
        clientId,
        'greeting',
        'Description',
        IntentStatus.ACTIVE
      );

      const updated = intent.updateLabel('  farewell  ');
      expect(updated.label).toBe('farewell');
    });

    it('should throw error when label is empty', () => {
      const intent = Intent.create(
        'intent-id',
        clientId,
        'greeting',
        'Description',
        IntentStatus.ACTIVE
      );

      expect(() => intent.updateLabel('')).toThrow('Label cannot be empty');
    });
  });

  describe('updateDescription', () => {
    it('should update description', () => {
      const intent = Intent.create(
        'intent-id',
        clientId,
        'greeting',
        'Old description',
        IntentStatus.ACTIVE
      );

      const originalUpdatedAt = intent.updatedAt.getTime();
      const updated = intent.updateDescription('New description');

      expect(updated.description).toBe('New description');
      expect(updated.id).toBe(intent.id);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
    });

    it('should use empty string if description is not provided', () => {
      const intent = Intent.create(
        'intent-id',
        clientId,
        'greeting',
        'Description',
        IntentStatus.ACTIVE
      );

      const updated = intent.updateDescription('');
      expect(updated.description).toBe('');
    });
  });

  describe('updateStatus', () => {
    it('should update status', () => {
      const intent = Intent.create(
        'intent-id',
        clientId,
        'greeting',
        'Description',
        IntentStatus.SUGGESTED
      );

      const originalUpdatedAt = intent.updatedAt.getTime();
      const updated = intent.updateStatus(IntentStatus.ACTIVE);

      expect(updated.status).toBe(IntentStatus.ACTIVE);
      expect(updated.id).toBe(intent.id);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
    });
  });

  describe('update', () => {
    it('should update label, description and status', () => {
      const intent = Intent.create(
        'intent-id',
        clientId,
        'greeting',
        'Old description',
        IntentStatus.SUGGESTED
      );

      const originalUpdatedAt = intent.updatedAt.getTime();
      const updated = intent.update('farewell', 'New description', IntentStatus.ACTIVE);

      expect(updated.label).toBe('farewell');
      expect(updated.description).toBe('New description');
      expect(updated.status).toBe(IntentStatus.ACTIVE);
      expect(updated.id).toBe(intent.id);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
    });

    it('should throw error when label is empty', () => {
      const intent = Intent.create(
        'intent-id',
        clientId,
        'greeting',
        'Description',
        IntentStatus.ACTIVE
      );

      expect(() => intent.update('', 'Description', IntentStatus.ACTIVE)).toThrow(
        'Label cannot be empty'
      );
    });
  });
});

