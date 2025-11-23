/**
 * IntentController
 * Controller para gerenciar intenções
 */

import { Request, Response } from 'express';
import { CreateDefaultIntentUseCase } from '../../application/use-cases/CreateDefaultIntentUseCase';
import { CreateTenantIntentUseCase } from '../../application/use-cases/CreateTenantIntentUseCase';
import { GetIntentUseCase } from '../../application/use-cases/GetIntentUseCase';
import { UpdateIntentUseCase } from '../../application/use-cases/UpdateIntentUseCase';
import { DeleteIntentUseCase } from '../../application/use-cases/DeleteIntentUseCase';
import { ListTenantIntentsUseCase } from '../../application/use-cases/ListTenantIntentsUseCase';
import { ListAllIntentsUseCase } from '../../application/use-cases/ListAllIntentsUseCase';
import { ListAllDefaultIntentsUseCase } from '../../application/use-cases/ListAllDefaultIntentsUseCase';
import { LinkIntentToTenantUseCase } from '../../application/use-cases/LinkIntentToTenantUseCase';
import { ExcludeIntentFromTenantUseCase } from '../../application/use-cases/ExcludeIntentFromTenantUseCase';
import {
  IntentResponseDTO,
  ListIntentsResponseDTO,
  LinkIntentDTO,
  ExcludeIntentDTO,
} from '../../application/dtos/IntentResponseDTO';
import { CreateDefaultIntentDTO, CreateTenantIntentDTO } from '../../application/dtos/CreateIntentDTO';
import { UpdateIntentDTO } from '../../application/dtos/UpdateIntentDTO';
import { Intent } from '../../domain/entities/Intent';
import { IntentStatus, isValidIntentStatus } from '../../domain/value-objects/IntentStatus';
import { AppError } from '../../shared/utils/AppError';
import { successResponse, errorResponse } from '../../shared/types/ApiResponse';

export class IntentController {
  constructor(
    private readonly createDefaultIntentUseCase: CreateDefaultIntentUseCase,
    private readonly createTenantIntentUseCase: CreateTenantIntentUseCase,
    private readonly getIntentUseCase: GetIntentUseCase,
    private readonly updateIntentUseCase: UpdateIntentUseCase,
    private readonly deleteIntentUseCase: DeleteIntentUseCase,
    private readonly listTenantIntentsUseCase: ListTenantIntentsUseCase,
    private readonly listAllIntentsUseCase: ListAllIntentsUseCase,
    private readonly listAllDefaultIntentsUseCase: ListAllDefaultIntentsUseCase,
    private readonly linkIntentToTenantUseCase: LinkIntentToTenantUseCase,
    private readonly excludeIntentFromTenantUseCase: ExcludeIntentFromTenantUseCase
  ) {}

  async createDefaultIntent(req: Request, res: Response): Promise<void> {
    try {
      const dto = this.validateCreateDefaultIntentDTO(req.body);
      const intent = await this.createDefaultIntentUseCase.execute(dto);

      const responseData: IntentResponseDTO = this.mapIntentToResponseDTO(intent);

      res.status(201).json(successResponse(responseData));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async createTenantIntent(req: Request, res: Response): Promise<void> {
    try {
      const dto = this.validateCreateTenantIntentDTO(req.body);
      const intent = await this.createTenantIntentUseCase.execute(dto);

      const responseData: IntentResponseDTO = this.mapIntentToResponseDTO(intent);

      res.status(201).json(successResponse(responseData));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getIntent(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw AppError.badRequest('Intent id is required');
      }

      const intent = await this.getIntentUseCase.execute(req.params.id);

      const responseData: IntentResponseDTO = this.mapIntentToResponseDTO(intent, true);

      res.status(200).json(successResponse(responseData));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateIntent(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw AppError.badRequest('Intent id is required');
      }

      const dto = this.validateUpdateIntentDTO(req.body);
      const intent = await this.updateIntentUseCase.execute(req.params.id, dto);

      const responseData: IntentResponseDTO = this.mapIntentToResponseDTO(intent, true);

      res.status(200).json(successResponse(responseData));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteIntent(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw AppError.badRequest('Intent id is required');
      }

      await this.deleteIntentUseCase.execute(req.params.id);

      res.status(200).json(successResponse({ message: 'Intent deleted successfully' }));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async listTenantIntents(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.query.tenantId as string | undefined;

      if (!tenantId) {
        throw AppError.badRequest('tenantId query parameter is required');
      }

      const intents = await this.listTenantIntentsUseCase.execute(tenantId);

      const responseData: ListIntentsResponseDTO = {
        items: intents.map((intent) => this.mapIntentToResponseDTO(intent, true)),
        total: intents.length,
      };

      res.status(200).json(successResponse(responseData));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async listAllIntents(req: Request, res: Response): Promise<void> {
    try {
      const intents = await this.listAllIntentsUseCase.execute();

      const responseData: ListIntentsResponseDTO = {
        items: intents.map((intent) => this.mapIntentToResponseDTO(intent, true)),
        total: intents.length,
      };

      res.status(200).json(successResponse(responseData));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async listAllDefaultIntents(req: Request, res: Response): Promise<void> {
    try {
      const intents = await this.listAllDefaultIntentsUseCase.execute();

      const responseData: ListIntentsResponseDTO = {
        items: intents.map((intent) => this.mapIntentToResponseDTO(intent, true)),
        total: intents.length,
      };

      res.status(200).json(successResponse(responseData));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async linkIntentToTenant(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw AppError.badRequest('Intent id is required');
      }

      const dto = this.validateLinkIntentDTO(req.body);
      await this.linkIntentToTenantUseCase.execute(req.params.id, dto.tenantId);

      res.status(200).json(successResponse({ message: 'Intent linked to tenant successfully' }));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async excludeIntentFromTenant(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw AppError.badRequest('Intent id is required');
      }

      const dto = this.validateExcludeIntentDTO(req.body);
      await this.excludeIntentFromTenantUseCase.execute(req.params.id, dto.tenantId);

      res.status(200).json(successResponse({ message: 'Intent excluded from tenant successfully' }));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private mapIntentToResponseDTO(intent: Intent, includeUpdatedAt = false): IntentResponseDTO {
    return {
      id: intent.id,
      label: intent.label,
      description: intent.description,
      status: intent.status,
      synonyms: intent.synonyms || [],
      examplePhrases: intent.examplePhrases || [],
      isDefault: intent.isDefault,
      createdAt: intent.createdAt.toISOString(),
      ...(includeUpdatedAt && { updatedAt: intent.updatedAt.toISOString() }),
    };
  }

  private validateCreateDefaultIntentDTO(body: unknown): CreateDefaultIntentDTO {
    if (!body || typeof body !== 'object') {
      throw AppError.badRequest('Request body is required');
    }

    const dto = body as Partial<CreateDefaultIntentDTO>;

    if (!dto.label || typeof dto.label !== 'string' || dto.label.trim().length === 0) {
      throw AppError.badRequest('label is required and must be a non-empty string');
    }

    if (dto.description !== undefined && typeof dto.description !== 'string') {
      throw AppError.badRequest('description must be a string');
    }

    if (!dto.status || typeof dto.status !== 'string') {
      throw AppError.badRequest('status is required and must be a string');
    }

    if (!isValidIntentStatus(dto.status)) {
      throw AppError.badRequest('status must be ACTIVE, INACTIVE, or SUGGESTED');
    }

    if (dto.status !== IntentStatus.ACTIVE && dto.status !== IntentStatus.SUGGESTED) {
      throw AppError.badRequest('status must be ACTIVE or SUGGESTED when creating');
    }

    const synonyms = this.validateStringArray(dto.synonyms, 'synonyms');
    const examplePhrases = this.validateStringArray(dto.examplePhrases, 'examplePhrases');

    return {
      label: dto.label.trim(),
      description: dto.description || '',
      status: dto.status as IntentStatus,
      synonyms: synonyms || [],
      examplePhrases: examplePhrases || [],
    };
  }

  private validateCreateTenantIntentDTO(body: unknown): CreateTenantIntentDTO {
    if (!body || typeof body !== 'object') {
      throw AppError.badRequest('Request body is required');
    }

    const dto = body as Partial<CreateTenantIntentDTO>;

    if (!dto.tenantId || typeof dto.tenantId !== 'string' || dto.tenantId.trim().length === 0) {
      throw AppError.badRequest('tenantId is required and must be a non-empty string');
    }

    if (!dto.label || typeof dto.label !== 'string' || dto.label.trim().length === 0) {
      throw AppError.badRequest('label is required and must be a non-empty string');
    }

    if (dto.description !== undefined && typeof dto.description !== 'string') {
      throw AppError.badRequest('description must be a string');
    }

    if (!dto.status || typeof dto.status !== 'string') {
      throw AppError.badRequest('status is required and must be a string');
    }

    if (!isValidIntentStatus(dto.status)) {
      throw AppError.badRequest('status must be ACTIVE, INACTIVE, or SUGGESTED');
    }

    if (dto.status !== IntentStatus.ACTIVE && dto.status !== IntentStatus.SUGGESTED) {
      throw AppError.badRequest('status must be ACTIVE or SUGGESTED when creating');
    }

    const synonyms = this.validateStringArray(dto.synonyms, 'synonyms');
    const examplePhrases = this.validateStringArray(dto.examplePhrases, 'examplePhrases');

    return {
      tenantId: dto.tenantId.trim(),
      label: dto.label.trim(),
      description: dto.description || '',
      status: dto.status as IntentStatus,
      synonyms: synonyms || [],
      examplePhrases: examplePhrases || [],
    };
  }

  private validateUpdateIntentDTO(body: unknown): UpdateIntentDTO {
    if (!body || typeof body !== 'object') {
      throw AppError.badRequest('Request body is required');
    }

    const dto = body as Partial<UpdateIntentDTO>;

    if (dto.label !== undefined) {
      if (typeof dto.label !== 'string' || dto.label.trim().length === 0) {
        throw AppError.badRequest('label must be a non-empty string');
      }
    }

    if (dto.description !== undefined && typeof dto.description !== 'string') {
      throw AppError.badRequest('description must be a string');
    }

    if (dto.status !== undefined) {
      if (typeof dto.status !== 'string') {
        throw AppError.badRequest('status must be a string');
      }

      if (!isValidIntentStatus(dto.status)) {
        throw AppError.badRequest('status must be ACTIVE, INACTIVE, or SUGGESTED');
      }
    }

    const result: UpdateIntentDTO = {};

    if (dto.label !== undefined) {
      result.label = dto.label.trim();
    }

    if (dto.description !== undefined) {
      result.description = dto.description;
    }

    if (dto.status !== undefined) {
      result.status = dto.status as IntentStatus;
    }

    if (dto.synonyms !== undefined) {
      const validated = this.validateStringArray(dto.synonyms, 'synonyms');
      if (validated !== undefined) {
        result.synonyms = validated;
      }
    }

    if (dto.examplePhrases !== undefined) {
      const validated = this.validateStringArray(dto.examplePhrases, 'examplePhrases');
      if (validated !== undefined) {
        result.examplePhrases = validated;
      }
    }

    return result;
  }

  private validateLinkIntentDTO(body: unknown): LinkIntentDTO {
    if (!body || typeof body !== 'object') {
      throw AppError.badRequest('Request body is required');
    }

    const dto = body as Partial<LinkIntentDTO>;

    if (!dto.tenantId || typeof dto.tenantId !== 'string' || dto.tenantId.trim().length === 0) {
      throw AppError.badRequest('tenantId is required and must be a non-empty string');
    }

    return {
      tenantId: dto.tenantId.trim(),
      intentId: '', // Não usado, mas necessário para o tipo
    };
  }

  private validateExcludeIntentDTO(body: unknown): ExcludeIntentDTO {
    if (!body || typeof body !== 'object') {
      throw AppError.badRequest('Request body is required');
    }

    const dto = body as Partial<ExcludeIntentDTO>;

    if (!dto.tenantId || typeof dto.tenantId !== 'string' || dto.tenantId.trim().length === 0) {
      throw AppError.badRequest('tenantId is required and must be a non-empty string');
    }

    return {
      tenantId: dto.tenantId.trim(),
      intentId: '', // Não usado, mas necessário para o tipo
    };
  }

  private validateStringArray(value: unknown, fieldName: string): string[] | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (!Array.isArray(value)) {
      throw AppError.badRequest(`${fieldName} must be an array`);
    }

    const invalidItems = value.filter((item) => typeof item !== 'string');
    if (invalidItems.length > 0) {
      throw AppError.badRequest(`All items in ${fieldName} must be strings`);
    }

    return value as string[];
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(errorResponse(error.message, error.code));
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json(errorResponse(errorMessage, 'INTERNAL_ERROR'));
  }
}
