/**
 * ListAllDefaultIntentsUseCase
 * Use case para listar todas as intenções default
 */

import { IIntentRepository } from '../../domain/repositories/IIntentRepository';
import { Intent } from '../../domain/entities/Intent';

export class ListAllDefaultIntentsUseCase {
  constructor(private readonly repository: IIntentRepository) {}

  async execute(): Promise<Intent[]> {
    return await this.repository.findAllDefault();
  }
}

