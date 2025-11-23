/**
 * Intent Entity Tests
 */

import { Intent } from '../../../../src/domain/entities/Intent';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';

describe('Intent', () => {
  describe('create', () => {
    it('should create a new intent', () => {
      const intent = Intent.create(
        'intent-id',
        'greeting',
        'Greeting intent',
        IntentStatus.ACTIVE
      );

      expect(intent.id).toBe('intent-id');
      expect(intent.label).toBe('greeting');
      expect(intent.description).toBe('Greeting intent');
      expect(intent.status).toBe(IntentStatus.ACTIVE);
      expect(intent.synonyms).toEqual([]);
      expect(intent.examplePhrases).toEqual([]);
      expect(intent.isDefault).toBe(false);
      expect(intent.createdAt).toBeInstanceOf(Date);
      expect(intent.updatedAt).toBeInstanceOf(Date);
    });

    it('should create default intent', () => {
      const intent = Intent.create(
        'intent-id',
        'greeting',
        'Greeting intent',
        IntentStatus.ACTIVE,
        [],
        [],
        true
      );

      expect(intent.isDefault).toBe(true);
    });

    it('should create intent with synonyms and examplePhrases', () => {
      const synonyms = ['marcar', 'agendar', 'horário'];
      const examplePhrases = ['Quero marcar um horário', 'Posso agendar?'];

      const intent = Intent.create(
        'intent-id',
        'agendamento',
        'Agendamento intent',
        IntentStatus.ACTIVE,
        synonyms,
        examplePhrases
      );

      expect(intent.synonyms).toEqual(synonyms);
      expect(intent.examplePhrases).toEqual(examplePhrases);
    });

    it('should trim label whitespace', () => {
      const intent = Intent.create(
        'intent-id',
        '  greeting  ',
        'Description',
        IntentStatus.ACTIVE
      );

      expect(intent.label).toBe('greeting');
    });

    it('should use empty string for description if not provided', () => {
      const intent = Intent.create('intent-id', 'greeting', '', IntentStatus.ACTIVE);

      expect(intent.description).toBe('');
    });

    it('should throw error when label is empty', () => {
      expect(() => {
        Intent.create('intent-id', '', 'Description', IntentStatus.ACTIVE);
      }).toThrow('Label cannot be empty');
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute an intent from persistence', () => {
      const createdAt = new Date('2025-01-10T10:30:00Z');
      const updatedAt = new Date('2025-01-10T11:00:00Z');

      const intent = Intent.reconstitute(
        'intent-id',
        'greeting',
        'Description',
        IntentStatus.ACTIVE,
        ['synonym1'],
        ['example1'],
        true,
        createdAt,
        updatedAt
      );

      expect(intent.id).toBe('intent-id');
      expect(intent.synonyms).toEqual(['synonym1']);
      expect(intent.examplePhrases).toEqual(['example1']);
      expect(intent.isDefault).toBe(true);
      expect(intent.createdAt).toEqual(createdAt);
      expect(intent.updatedAt).toEqual(updatedAt);
    });
  });

  describe('updateLabel', () => {
    it('should update label', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE);

      const originalUpdatedAt = intent.updatedAt.getTime();
      const updated = intent.updateLabel('farewell');

      expect(updated.label).toBe('farewell');
      expect(updated.id).toBe(intent.id);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
    });

    it('should trim label whitespace', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE);

      const updated = intent.updateLabel('  farewell  ');
      expect(updated.label).toBe('farewell');
    });

    it('should throw error when label is empty', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE);

      expect(() => intent.updateLabel('')).toThrow('Label cannot be empty');
    });
  });

  describe('updateDescription', () => {
    it('should update description', () => {
      const intent = Intent.create(
        'intent-id',
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
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE);

      const updated = intent.updateDescription('');
      expect(updated.description).toBe('');
    });
  });

  describe('updateStatus', () => {
    it('should update status', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.SUGGESTED);

      const originalUpdatedAt = intent.updatedAt.getTime();
      const updated = intent.updateStatus(IntentStatus.ACTIVE);

      expect(updated.status).toBe(IntentStatus.ACTIVE);
      expect(updated.id).toBe(intent.id);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
    });
  });

  describe('updateSynonyms', () => {
    it('should update synonyms', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE);

      const newSynonyms = ['marcar', 'agendar'];
      const updated = intent.updateSynonyms(newSynonyms);

      expect(updated.synonyms).toEqual(newSynonyms);
      expect(updated.id).toBe(intent.id);
    });
  });

  describe('updateExamplePhrases', () => {
    it('should update examplePhrases', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE);

      const newPhrases = ['Quero marcar', 'Posso agendar?'];
      const updated = intent.updateExamplePhrases(newPhrases);

      expect(updated.examplePhrases).toEqual(newPhrases);
      expect(updated.id).toBe(intent.id);
    });
  });

  describe('update', () => {
    it('should update label, description, status, synonyms and examplePhrases', () => {
      const intent = Intent.create(
        'intent-id',
        'greeting',
        'Old description',
        IntentStatus.SUGGESTED
      );

      const originalUpdatedAt = intent.updatedAt.getTime();
      const updated = intent.update(
        'farewell',
        'New description',
        IntentStatus.ACTIVE,
        ['marcar'],
        ['Quero marcar']
      );

      expect(updated.label).toBe('farewell');
      expect(updated.description).toBe('New description');
      expect(updated.status).toBe(IntentStatus.ACTIVE);
      expect(updated.synonyms).toEqual(['marcar']);
      expect(updated.examplePhrases).toEqual(['Quero marcar']);
      expect(updated.id).toBe(intent.id);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
    });

    it('should preserve existing synonyms and examplePhrases if not provided', () => {
      const intent = Intent.create(
        'intent-id',
        'greeting',
        'Description',
        IntentStatus.ACTIVE,
        ['old-synonym'],
        ['old-phrase']
      );

      const updated = intent.update('new-label', 'New description', IntentStatus.ACTIVE);

      expect(updated.synonyms).toEqual(['old-synonym']);
      expect(updated.examplePhrases).toEqual(['old-phrase']);
    });

    it('should throw error when label is empty', () => {
      const intent = Intent.create('intent-id', 'greeting', 'Description', IntentStatus.ACTIVE);

      expect(() => intent.update('', 'Description', IntentStatus.ACTIVE)).toThrow(
        'Label cannot be empty'
      );
    });
  });
});
