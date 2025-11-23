/**
 * IntentUniquenessService
 * Serviço de domínio para regras de negócio relacionadas à unicidade de intents
 */

import { Intent } from '../entities/Intent';
import { IIntentRepository } from '../repositories/IIntentRepository';

export class IntentUniquenessService {
  /**
   * Verifica se um label pode ser usado para criar uma nova intent
   * Regra de negócio: Label deve ser único globalmente
   * @param repository Repositório de intents
   * @param label Label a ser verificado
   * @param excludeIntentId ID da intent a ser excluída da verificação (útil na atualização)
   * @throws Error se o label já estiver em uso
   */
  static async ensureLabelIsUnique(
    repository: IIntentRepository,
    label: string,
    excludeIntentId?: string
  ): Promise<void> {
    const existing = await repository.findByLabel(label.trim());

    if (existing && (!excludeIntentId || existing.id !== excludeIntentId)) {
      throw new Error(`Intent with label "${label}" already exists`);
    }
  }

  /**
   * Verifica se um label pode ser usado para atualizar uma intent existente
   * Regra de negócio: Label deve ser único globalmente, exceto para a própria intent
   * @param repository Repositório de intents
   * @param label Novo label
   * @param currentIntentId ID da intent que está sendo atualizada
   * @throws Error se o label já estiver em uso por outra intent
   */
  static async ensureLabelIsUniqueForUpdate(
    repository: IIntentRepository,
    label: string,
    currentIntentId: string
  ): Promise<void> {
    await this.ensureLabelIsUnique(repository, label, currentIntentId);
  }
}

