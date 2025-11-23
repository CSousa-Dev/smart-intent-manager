/**
 * IntentValidator Service
 * Serviço de domínio para validação de intenções
 */

import { IntentStatus, isValidIntentStatus } from '../value-objects/IntentStatus';

export class IntentValidator {
  /**
   * Valida se o label não está vazio
   */
  static validateLabel(label: string): void {
    if (!label || label.trim().length === 0) {
      throw new Error('Label cannot be empty');
    }
  }

  /**
   * Valida se o status é válido
   */
  static validateStatus(status: string): void {
    if (!status || !isValidIntentStatus(status)) {
      throw new Error('Status must be ACTIVE, INACTIVE, or SUGGESTED');
    }
  }

  /**
   * Valida se o status pode ser usado na criação
   */
  static validateStatusForCreation(status: IntentStatus): void {
    if (status !== IntentStatus.ACTIVE && status !== IntentStatus.SUGGESTED) {
      throw new Error('Status must be ACTIVE or SUGGESTED when creating');
    }
  }

  /**
   * Valida se synonyms é um array válido de strings
   */
  static validateSynonyms(synonyms: unknown): string[] {
    if (synonyms === undefined || synonyms === null) {
      return [];
    }

    if (!Array.isArray(synonyms)) {
      throw new Error('synonyms must be an array of strings');
    }

    const invalidItems = synonyms.filter((item) => typeof item !== 'string');
    if (invalidItems.length > 0) {
      throw new Error('All items in synonyms must be strings');
    }

    return synonyms as string[];
  }

  /**
   * Valida se examplePhrases é um array válido de strings
   */
  static validateExamplePhrases(examplePhrases: unknown): string[] {
    if (examplePhrases === undefined || examplePhrases === null) {
      return [];
    }

    if (!Array.isArray(examplePhrases)) {
      throw new Error('examplePhrases must be an array of strings');
    }

    const invalidItems = examplePhrases.filter((item) => typeof item !== 'string');
    if (invalidItems.length > 0) {
      throw new Error('All items in examplePhrases must be strings');
    }

    return examplePhrases as string[];
  }
}

