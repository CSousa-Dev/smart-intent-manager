/**
 * ListAllIntentsUseCase
 * Use case para listar todas as intenções do sistema
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';

export class ListAllIntentsUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(): Promise<Intent[]> {
    return await this.repository.findAll();
  }
}

