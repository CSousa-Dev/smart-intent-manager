/**
 * IntentController
 * Controller para gerenciar intenções
 */

import { Request, Response } from 'express';
import { CreateIntentUseCase } from '../../application/use-cases/CreateIntentUseCase';
import { GetIntentUseCase } from '../../application/use-cases/GetIntentUseCase';
import { UpdateIntentUseCase } from '../../application/use-cases/UpdateIntentUseCase';
import { DeleteIntentUseCase } from '../../application/use-cases/DeleteIntentUseCase';
import { ListIntentsByClientUseCase } from '../../application/use-cases/ListIntentsByClientUseCase';
import { ListAllIntentsUseCase } from '../../application/use-cases/ListAllIntentsUseCase';
import { IntentResponseDTO, ListIntentsResponseDTO } from '../../application/dtos/IntentResponseDTO';
import { CreateIntentDTO } from '../../application/dtos/CreateIntentDTO';
import { UpdateIntentDTO } from '../../application/dtos/UpdateIntentDTO';
import { IntentStatus, isValidIntentStatus } from '../../domain/value-objects/IntentStatus';
import { AppError } from '../../shared/utils/AppError';
import { successResponse, errorResponse } from '../../shared/types/ApiResponse';

export class IntentController {
  constructor(
    private readonly createIntentUseCase: CreateIntentUseCase,
    private readonly getIntentUseCase: GetIntentUseCase,
    private readonly updateIntentUseCase: UpdateIntentUseCase,
    private readonly deleteIntentUseCase: DeleteIntentUseCase,
    private readonly listIntentsByClientUseCase: ListIntentsByClientUseCase,
    private readonly listAllIntentsUseCase: ListAllIntentsUseCase
  ) {}

  async createIntent(req: Request, res: Response): Promise<void> {
    try {
      const dto = this.validateCreateIntentDTO(req.body);
      const intent = await this.createIntentUseCase.execute(dto);

      const responseData: IntentResponseDTO = {
        id: intent.id,
        clientId: intent.clientId.getValue(),
        label: intent.label,
        description: intent.description,
        status: intent.status,
        createdAt: intent.createdAt.toISOString(),
      };

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

      const responseData: IntentResponseDTO = {
        id: intent.id,
        clientId: intent.clientId.getValue(),
        label: intent.label,
        description: intent.description,
        status: intent.status,
        createdAt: intent.createdAt.toISOString(),
        updatedAt: intent.updatedAt.toISOString(),
      };

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

      const responseData: IntentResponseDTO = {
        id: intent.id,
        clientId: intent.clientId.getValue(),
        label: intent.label,
        description: intent.description,
        status: intent.status,
        createdAt: intent.createdAt.toISOString(),
        updatedAt: intent.updatedAt.toISOString(),
      };

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

  async listIntents(req: Request, res: Response): Promise<void> {
    try {
      const clientId = req.query.clientId as string | undefined;

      if (!clientId) {
        throw AppError.badRequest('clientId query parameter is required');
      }

      const intents = await this.listIntentsByClientUseCase.execute(clientId);

      const responseData: ListIntentsResponseDTO = {
        items: intents.map((intent) => ({
          id: intent.id,
          clientId: intent.clientId.getValue(),
          label: intent.label,
          description: intent.description,
          status: intent.status,
          createdAt: intent.createdAt.toISOString(),
          updatedAt: intent.updatedAt.toISOString(),
        })),
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
        items: intents.map((intent) => ({
          id: intent.id,
          clientId: intent.clientId.getValue(),
          label: intent.label,
          description: intent.description,
          status: intent.status,
          createdAt: intent.createdAt.toISOString(),
          updatedAt: intent.updatedAt.toISOString(),
        })),
        total: intents.length,
      };

      res.status(200).json(successResponse(responseData));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private validateCreateIntentDTO(body: unknown): CreateIntentDTO {
    if (!body || typeof body !== 'object') {
      throw AppError.badRequest('Request body is required');
    }

    const dto = body as Partial<CreateIntentDTO>;

    if (!dto.clientId || typeof dto.clientId !== 'string' || dto.clientId.trim().length === 0) {
      throw AppError.badRequest('clientId is required and must be a non-empty string');
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

    return {
      clientId: dto.clientId.trim(),
      label: dto.label.trim(),
      description: dto.description || '',
      status: dto.status as IntentStatus,
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

    return result;
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

