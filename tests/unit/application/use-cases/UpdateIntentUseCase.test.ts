/**
 * UpdateIntentUseCase Tests
 */

import { UpdateIntentUseCase } from '../../../../src/application/use-cases/UpdateIntentUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { Intent } from '../../../../src/domain/entities/Intent';
import { ClientId } from '../../../../src/domain/value-objects/ClientId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('UpdateIntentUseCase', () => {
  let repository: jest.Mocked<IIntentRepository>;
  let useCase: UpdateIntentUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByClientAndLabel: jest.fn(),
      findAllByClient: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new UpdateIntentUseCase(repository);
  });

  it('should update intent successfully', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(
      intentId,
      ClientId.create('client-001'),
      'greeting',
      'Old description',
      IntentStatus.ACTIVE
    );

    repository.findById.mockResolvedValue(existingIntent);
    repository.findByClientAndLabel.mockResolvedValue(null);

    const updatedIntent = existingIntent.update('farewell', 'New description', IntentStatus.INACTIVE);
    repository.update.mockResolvedValue(updatedIntent);

    const dto = {
      label: 'farewell',
      description: 'New description',
      status: IntentStatus.INACTIVE,
    };

    const result = await useCase.execute(intentId, dto);

    expect(result.label).toBe('farewell');
    expect(result.description).toBe('New description');
    expect(result.status).toBe(IntentStatus.INACTIVE);
    expect(repository.findById).toHaveBeenCalledWith(intentId);
    expect(repository.update).toHaveBeenCalled();
  });

  it('should update only label', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(
      intentId,
      ClientId.create('client-001'),
      'greeting',
      'Description',
      IntentStatus.ACTIVE
    );

    repository.findById.mockResolvedValue(existingIntent);
    repository.findByClientAndLabel.mockResolvedValue(null);

    const updatedIntent = existingIntent.updateLabel('farewell');
    repository.update.mockResolvedValue(updatedIntent);

    const result = await useCase.execute(intentId, { label: 'farewell' });

    expect(result.label).toBe('farewell');
    expect(result.description).toBe(existingIntent.description);
    expect(result.status).toBe(existingIntent.status);
  });

  it('should update only description', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(
      intentId,
      ClientId.create('client-001'),
      'greeting',
      'Old description',
      IntentStatus.ACTIVE
    );

    repository.findById.mockResolvedValue(existingIntent);

    const updatedIntent = existingIntent.updateDescription('New description');
    repository.update.mockResolvedValue(updatedIntent);

    const result = await useCase.execute(intentId, { description: 'New description' });

    expect(result.description).toBe('New description');
    expect(result.label).toBe(existingIntent.label);
  });

  it('should update only status', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(
      intentId,
      ClientId.create('client-001'),
      'greeting',
      'Description',
      IntentStatus.SUGGESTED
    );

    repository.findById.mockResolvedValue(existingIntent);

    const updatedIntent = existingIntent.updateStatus(IntentStatus.ACTIVE);
    repository.update.mockResolvedValue(updatedIntent);

    const result = await useCase.execute(intentId, { status: IntentStatus.ACTIVE });

    expect(result.status).toBe(IntentStatus.ACTIVE);
    expect(result.label).toBe(existingIntent.label);
  });

  it('should promote SUGGESTED to ACTIVE', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(
      intentId,
      ClientId.create('client-001'),
      'greeting',
      'Description',
      IntentStatus.SUGGESTED
    );

    repository.findById.mockResolvedValue(existingIntent);

    const updatedIntent = existingIntent.updateStatus(IntentStatus.ACTIVE);
    repository.update.mockResolvedValue(updatedIntent);

    const result = await useCase.execute(intentId, { status: IntentStatus.ACTIVE });

    expect(result.status).toBe(IntentStatus.ACTIVE);
  });

  it('should throw error when intent not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent-id', { label: 'new-label' })
    ).rejects.toThrow(AppError);
  });

  it('should throw error when label already exists for same client', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(
      intentId,
      ClientId.create('client-001'),
      'greeting',
      'Description',
      IntentStatus.ACTIVE
    );

    const conflictingIntent = Intent.create(
      'other-id',
      ClientId.create('client-001'),
      'farewell',
      'Description',
      IntentStatus.ACTIVE
    );

    repository.findById.mockResolvedValue(existingIntent);
    repository.findByClientAndLabel.mockResolvedValue(conflictingIntent);

    await expect(
      useCase.execute(intentId, { label: 'farewell' })
    ).rejects.toThrow(AppError);
  });

  it('should allow updating label to same value', async () => {
    const intentId = 'intent-id';
    const existingIntent = Intent.create(
      intentId,
      ClientId.create('client-001'),
      'greeting',
      'Description',
      IntentStatus.ACTIVE
    );

    repository.findById.mockResolvedValue(existingIntent);
    repository.findByClientAndLabel.mockResolvedValue(existingIntent);

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
    const existingIntent = Intent.create(
      intentId,
      ClientId.create('client-001'),
      'greeting',
      'Description',
      IntentStatus.ACTIVE
    );

    repository.findById.mockResolvedValue(existingIntent);

    await expect(
      useCase.execute(intentId, { status: 'INVALID' as IntentStatus })
    ).rejects.toThrow(AppError);
  });
});

