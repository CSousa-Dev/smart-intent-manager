/**
 * CreateTenantIntentUseCase Tests
 */

import { CreateTenantIntentUseCase } from '../../../../src/application/use-cases/CreateTenantIntentUseCase';
import { IIntentRepository } from '../../../../src/domain/repositories/IIntentRepository';
import { ITenantService } from '../../../../src/domain/services/ITenantService';
import { Intent } from '../../../../src/domain/entities/Intent';
import { TenantId } from '../../../../src/domain/value-objects/TenantId';
import { IntentStatus } from '../../../../src/domain/value-objects/IntentStatus';
import { AppError } from '../../../../src/shared/utils/AppError';

describe('CreateTenantIntentUseCase', () => {
  let intentRepository: jest.Mocked<IIntentRepository>;
  let tenantService: jest.Mocked<ITenantService>;
  let useCase: CreateTenantIntentUseCase;

  beforeEach(() => {
    intentRepository = {
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
    } as any;

    tenantService = {
      findById: jest.fn(),
      exists: jest.fn(),
    } as any;

    useCase = new CreateTenantIntentUseCase(intentRepository, tenantService);
  });

  it('should create a tenant intent successfully', async () => {
    const dto = {
      tenantId: 'tenant-001',
      label: 'greeting',
      description: 'Greeting intent',
      status: IntentStatus.ACTIVE,
      synonyms: ['marcar'],
      examplePhrases: ['Quero marcar'],
    };

    tenantService.exists.mockResolvedValue(true);
    intentRepository.findByLabel.mockResolvedValue(null);

    const mockIntent = Intent.createForCreation(
      'intent-id',
      dto.label,
      dto.description,
      dto.status,
      dto.synonyms,
      dto.examplePhrases,
      false
    );

    intentRepository.create.mockResolvedValue(mockIntent);
    intentRepository.linkIntentToTenant.mockResolvedValue();

    const result = await useCase.execute(dto);

    expect(result).toBeInstanceOf(Intent);
    expect(result.isDefault).toBe(false);
    expect(tenantService.exists).toHaveBeenCalledWith(expect.any(TenantId));
    expect(intentRepository.findByLabel).toHaveBeenCalledWith(dto.label);
    expect(intentRepository.create).toHaveBeenCalled();
    expect(intentRepository.linkIntentToTenant).toHaveBeenCalledWith(
      mockIntent.id,
      expect.any(TenantId)
    );
  });

  it('should throw error when tenantId is missing', async () => {
    const dto = {
      tenantId: '',
      label: 'greeting',
      description: 'Description',
      status: IntentStatus.ACTIVE,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(AppError);
  });

  it('should throw error when tenant does not exist', async () => {
    const dto = {
      tenantId: 'non-existent-tenant',
      label: 'greeting',
      description: 'Description',
      status: IntentStatus.ACTIVE,
    };

    tenantService.exists.mockResolvedValue(false);

    await expect(useCase.execute(dto)).rejects.toThrow(AppError);
    expect(intentRepository.create).not.toHaveBeenCalled();
  });

  it('should throw error when intent already exists', async () => {
    const dto = {
      tenantId: 'tenant-001',
      label: 'greeting',
      description: 'Description',
      status: IntentStatus.ACTIVE,
    };

    tenantService.exists.mockResolvedValue(true);
    const existingIntent = Intent.createForCreation('existing-id', dto.label, 'Existing', IntentStatus.ACTIVE);
    intentRepository.findByLabel.mockResolvedValue(existingIntent);

    await expect(useCase.execute(dto)).rejects.toThrow(AppError);
    expect(intentRepository.create).not.toHaveBeenCalled();
  });
});

