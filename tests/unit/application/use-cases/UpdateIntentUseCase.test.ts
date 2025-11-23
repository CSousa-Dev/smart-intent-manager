/**
 * UpdateIntentUseCase Tests
 */

import { UpdateIntentUseCase } from '../../../../src/application/use-cases/UpdateIntentUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { ITenantService } from '../../../../src/domain/services/ITenantService';
import { Intent } from '../../../../src/domain/entities/Intent';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';
import { TenantId } from '../../../../src/domain/value-objects/TenantId';

describe('UpdateIntentUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let tenantService: jest.Mocked<ITenantService>;
  let useCase: UpdateIntentUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByLabel: jest.fn(),
      findAll: jest.fn(),
      findAllDefault: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      linkIntentToTenant: jest.fn(),
      unlinkIntentFromTenant: jest.fn(),
      excludeIntentFromTenant: jest.fn(),
      removeExclusion: jest.fn(),
      findIntentsByTenant: jest.fn(),
      isIntentLinkedToTenant: jest.fn(),
      isIntentExcludedFromTenant: jest.fn(),
      getLinkedIntentIds: jest.fn(),
      getExcludedIntentIds: jest.fn(),
      getTenantIdsForIntent: jest.fn(),
    } as any;

    tenantService = {
      findById: jest.fn(),
      exists: jest.fn(),
    } as any;

    useCase = new UpdateIntentUseCase(repository, tenantService);
  });

  it('should update intent successfully', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(intentId, 'greeting', 'Old description', IntentStatus.ACTIVE);

    repository.findById.mockResolvedValue(existingIntent);
    repository.findByLabel.mockResolvedValue(null);

    const updatedIntent = existingIntent.update(
      'farewell',
      'New description',
      IntentStatus.INACTIVE,
      ['marcar'],
      ['Quero marcar']
    );
    repository.update.mockResolvedValue(updatedIntent);

    const dto = {
      label: 'farewell',
      description: 'New description',
      status: IntentStatus.INACTIVE,
      synonyms: ['marcar'],
      examplePhrases: ['Quero marcar'],
    };

    const result = await useCase.execute(intentId, dto);

    expect(result.label).toBe('farewell');
    expect(result.description).toBe('New description');
    expect(result.status).toBe(IntentStatus.INACTIVE);
    expect(result.synonyms).toEqual(['marcar']);
    expect(result.examplePhrases).toEqual(['Quero marcar']);
    expect(repository.findById).toHaveBeenCalledWith(intentId);
    expect(repository.update).toHaveBeenCalled();
  });

  it('should update only label', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE);

    repository.findById.mockResolvedValue(existingIntent);
    repository.findByLabel.mockResolvedValue(null);

    const updatedIntent = existingIntent.updateLabel('farewell');
    repository.update.mockResolvedValue(updatedIntent);

    const result = await useCase.execute(intentId, { label: 'farewell' });

    expect(result.label).toBe('farewell');
    expect(result.description).toBe(existingIntent.description);
    expect(result.status).toBe(existingIntent.status);
  });

  it('should update only description', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(intentId, 'greeting', 'Old description', IntentStatus.ACTIVE);

    repository.findById.mockResolvedValue(existingIntent);

    const updatedIntent = existingIntent.updateDescription('New description');
    repository.update.mockResolvedValue(updatedIntent);

    const result = await useCase.execute(intentId, { description: 'New description' });

    expect(result.description).toBe('New description');
    expect(result.label).toBe(existingIntent.label);
  });

  it('should update only status', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.SUGGESTED);

    repository.findById.mockResolvedValue(existingIntent);

    const updatedIntent = existingIntent.updateStatus(IntentStatus.ACTIVE);
    repository.update.mockResolvedValue(updatedIntent);

    const result = await useCase.execute(intentId, { status: IntentStatus.ACTIVE });

    expect(result.status).toBe(IntentStatus.ACTIVE);
    expect(result.label).toBe(existingIntent.label);
  });

  it('should update synonyms', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE);

    repository.findById.mockResolvedValue(existingIntent);

    const updatedIntent = existingIntent.updateSynonyms(['marcar', 'agendar']);
    repository.update.mockResolvedValue(updatedIntent);

    const result = await useCase.execute(intentId, { synonyms: ['marcar', 'agendar'] });

    expect(result.synonyms).toEqual(['marcar', 'agendar']);
  });

  it('should update examplePhrases', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE);

    repository.findById.mockResolvedValue(existingIntent);

    const updatedIntent = existingIntent.updateExamplePhrases(['Quero marcar', 'Posso agendar?']);
    repository.update.mockResolvedValue(updatedIntent);

    const result = await useCase.execute(intentId, {
      examplePhrases: ['Quero marcar', 'Posso agendar?'],
    });

    expect(result.examplePhrases).toEqual(['Quero marcar', 'Posso agendar?']);
  });

  it('should promote SUGGESTED to ACTIVE', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.SUGGESTED);

    repository.findById.mockResolvedValue(existingIntent);

    const updatedIntent = existingIntent.updateStatus(IntentStatus.ACTIVE);
    repository.update.mockResolvedValue(updatedIntent);

    const result = await useCase.execute(intentId, { status: IntentStatus.ACTIVE });

    expect(result.status).toBe(IntentStatus.ACTIVE);
  });

  it('should throw error when intent not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id', { label: 'new-label' })).rejects.toThrow(AppError);
  });

  it('should throw error when label already exists', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE);

    const conflictingIntent = Intent.create('other-id', 'farewell', 'Description', IntentStatus.ACTIVE);

    repository.findById.mockResolvedValue(existingIntent);
    repository.findByLabel.mockResolvedValue(conflictingIntent);

    await expect(useCase.execute(intentId, { label: 'farewell' })).rejects.toThrow(AppError);
  });

  it('should allow updating label to same value', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE);

    repository.findById.mockResolvedValue(existingIntent);
    repository.findByLabel.mockResolvedValue(existingIntent);

    const updatedIntent = existingIntent.update('greeting', 'New description', IntentStatus.ACTIVE);
    repository.update.mockResolvedValue(updatedIntent);

    const result = await useCase.execute(intentId, {
      label: 'greeting',
      description: 'New description',
    });

    expect(result.label).toBe('greeting');
    expect(result.description).toBe('New description');
  });

  it('should throw error when status is invalid', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE);

    repository.findById.mockResolvedValue(existingIntent);

    await expect(useCase.execute(intentId, { status: 'INVALID' as IntentStatus })).rejects.toThrow();
  });

  describe('tenantIds update', () => {
    it('should update tenantIds when provided', async () => {
      const intentId = 'intent-id';
      const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], false);

      repository.findById
        .mockResolvedValueOnce(existingIntent) // Primeira chamada no execute
        .mockResolvedValueOnce(existingIntent); // Segunda chamada no updateTenantLinks
      repository.getTenantIdsForIntent.mockResolvedValue(['tenant-001']);
      tenantService.exists.mockResolvedValue(true);
      repository.unlinkIntentFromTenant.mockResolvedValue();
      repository.linkIntentToTenant.mockResolvedValue();

      const updatedIntent = existingIntent.update('greeting', 'Description', IntentStatus.ACTIVE);
      repository.update.mockResolvedValue(updatedIntent);

      await useCase.execute(intentId, { tenantIds: ['tenant-002'] });

      expect(repository.getTenantIdsForIntent).toHaveBeenCalledWith(intentId);
      expect(repository.unlinkIntentFromTenant).toHaveBeenCalledWith(intentId, expect.any(TenantId));
      expect(repository.linkIntentToTenant).toHaveBeenCalledWith(intentId, expect.any(TenantId));
    });

    it('should not update tenantIds when list is the same', async () => {
      const intentId = 'intent-id';
      const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], false);

      repository.findById
        .mockResolvedValueOnce(existingIntent) // Primeira chamada no execute
        .mockResolvedValueOnce(existingIntent); // Segunda chamada no updateTenantLinks
      repository.getTenantIdsForIntent.mockResolvedValue(['tenant-001']);
      tenantService.exists.mockResolvedValue(true);

      const updatedIntent = existingIntent.update('greeting', 'Description', IntentStatus.ACTIVE);
      repository.update.mockResolvedValue(updatedIntent);

      await useCase.execute(intentId, { tenantIds: ['tenant-001'] });

      expect(repository.getTenantIdsForIntent).toHaveBeenCalledWith(intentId);
      expect(repository.unlinkIntentFromTenant).not.toHaveBeenCalled();
      expect(repository.linkIntentToTenant).not.toHaveBeenCalled();
    });

    it('should add new tenants and remove old ones', async () => {
      const intentId = 'intent-id';
      const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], false);

      repository.findById
        .mockResolvedValueOnce(existingIntent) // Primeira chamada no execute
        .mockResolvedValueOnce(existingIntent); // Segunda chamada no updateTenantLinks
      repository.getTenantIdsForIntent.mockResolvedValue(['tenant-001', 'tenant-002']);
      tenantService.exists.mockResolvedValue(true);
      repository.unlinkIntentFromTenant.mockResolvedValue();
      repository.linkIntentToTenant.mockResolvedValue();

      const updatedIntent = existingIntent.update('greeting', 'Description', IntentStatus.ACTIVE);
      repository.update.mockResolvedValue(updatedIntent);

      await useCase.execute(intentId, { tenantIds: ['tenant-002', 'tenant-003'] });

      expect(repository.unlinkIntentFromTenant).toHaveBeenCalledTimes(1); // Remove tenant-001
      expect(repository.linkIntentToTenant).toHaveBeenCalledTimes(1); // Add tenant-003
    });

    it('should throw error when tenant does not exist', async () => {
      const intentId = 'intent-id';
      const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], false);

      repository.findById
        .mockResolvedValueOnce(existingIntent) // Primeira chamada no execute
        .mockResolvedValueOnce(existingIntent); // Segunda chamada no updateTenantLinks
      repository.getTenantIdsForIntent.mockResolvedValue(['tenant-001']);
      tenantService.exists.mockResolvedValue(false);

      const updatedIntent = existingIntent.update('greeting', 'Description', IntentStatus.ACTIVE);
      repository.update.mockResolvedValue(updatedIntent);

      await expect(useCase.execute(intentId, { tenantIds: ['non-existent-tenant'] })).rejects.toThrow(AppError);
    });

    it('should not update tenantIds for default intents', async () => {
      const intentId = 'intent-id';
      const existingIntent = Intent.create(intentId, 'greeting', 'Description', IntentStatus.ACTIVE, [], [], true);

      repository.findById
        .mockResolvedValueOnce(existingIntent) // Primeira chamada no execute
        .mockResolvedValueOnce(existingIntent); // Segunda chamada no updateTenantLinks
      repository.getTenantIdsForIntent.mockResolvedValue([]);

      const updatedIntent = existingIntent.update('greeting', 'Description', IntentStatus.ACTIVE);
      repository.update.mockResolvedValue(updatedIntent);

      await useCase.execute(intentId, { tenantIds: ['tenant-001'] });

      // Para intents default, não valida existência de tenant
      expect(tenantService.exists).not.toHaveBeenCalled();
    });
  });
});
