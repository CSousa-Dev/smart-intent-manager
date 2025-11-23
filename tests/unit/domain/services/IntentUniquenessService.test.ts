import { IntentUniquenessService } from '../../../../src/domain/services/IntentUniquenessService';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';

describe('IntentUniquenessService', () => {
  let repository: jest.Mocked<IIntentRepository>;

  beforeEach(() => {
    repository = {
      findByLabel: jest.fn(),
    } as any;
  });

  describe('ensureLabelIsUnique', () => {
    it('should not throw when label is unique', async () => {
      repository.findByLabel.mockResolvedValue(null);

      await expect(
        IntentUniquenessService.ensureLabelIsUnique(repository, 'unique-label')
      ).resolves.not.toThrow();
    });

    it('should throw when label already exists', async () => {
      const existingIntent = Intent.createForCreation(
        'existing-id',
        'existing-label',
        'Description',
        IntentStatus.ACTIVE,
        [],
        [],
        false
      );
      repository.findByLabel.mockResolvedValue(existingIntent);

      await expect(
        IntentUniquenessService.ensureLabelIsUnique(repository, 'existing-label')
      ).rejects.toThrow('Intent with label "existing-label" already exists');
    });

    it('should not throw when label exists but is excluded from check', async () => {
      const existingIntent = Intent.createForCreation(
        'excluded-id',
        'existing-label',
        'Description',
        IntentStatus.ACTIVE,
        [],
        [],
        false
      );
      repository.findByLabel.mockResolvedValue(existingIntent);

      await expect(
        IntentUniquenessService.ensureLabelIsUnique(repository, 'existing-label', 'excluded-id')
      ).resolves.not.toThrow();
    });

    it('should throw when label exists for different intent', async () => {
      const existingIntent = Intent.createForCreation(
        'other-id',
        'existing-label',
        'Description',
        IntentStatus.ACTIVE,
        [],
        [],
        false
      );
      repository.findByLabel.mockResolvedValue(existingIntent);

      await expect(
        IntentUniquenessService.ensureLabelIsUnique(repository, 'existing-label', 'excluded-id')
      ).rejects.toThrow('Intent with label "existing-label" already exists');
    });
  });

  describe('ensureLabelIsUniqueForUpdate', () => {
    it('should not throw when label is unique', async () => {
      repository.findByLabel.mockResolvedValue(null);

      await expect(
        IntentUniquenessService.ensureLabelIsUniqueForUpdate(repository, 'unique-label', 'current-id')
      ).resolves.not.toThrow();
    });

    it('should throw when label exists for different intent', async () => {
      const existingIntent = Intent.createForCreation(
        'other-id',
        'existing-label',
        'Description',
        IntentStatus.ACTIVE,
        [],
        [],
        false
      );
      repository.findByLabel.mockResolvedValue(existingIntent);

      await expect(
        IntentUniquenessService.ensureLabelIsUniqueForUpdate(repository, 'existing-label', 'current-id')
      ).rejects.toThrow('Intent with label "existing-label" already exists');
    });

    it('should not throw when label exists for same intent', async () => {
      const existingIntent = Intent.createForCreation(
        'current-id',
        'existing-label',
        'Description',
        IntentStatus.ACTIVE,
        [],
        [],
        false
      );
      repository.findByLabel.mockResolvedValue(existingIntent);

      await expect(
        IntentUniquenessService.ensureLabelIsUniqueForUpdate(repository, 'existing-label', 'current-id')
      ).resolves.not.toThrow();
    });
  });
});

