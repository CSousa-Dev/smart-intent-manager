/**
 * Intent Entity
 * Entidade principal que representa uma intenção
 * Garante sua própria integridade através de validações internas
 */

import { IntentStatus, isValidIntentStatus } from '../value-objects/IntentStatus';

export class Intent {
  private constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly description: string,
    public readonly status: IntentStatus,
    public readonly synonyms: string[],
    public readonly examplePhrases: string[],
    public readonly isDefault: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    id: string,
    label: string,
    description: string,
    status: IntentStatus,
    synonyms: string[] = [],
    examplePhrases: string[] = [],
    isDefault: boolean = false
  ): Intent {
    // Validações de integridade da entidade
    Intent.validateLabel(label);
    Intent.validateStatus(status);
    Intent.validateSynonyms(synonyms);
    Intent.validateExamplePhrases(examplePhrases);

    const now = new Date();
    return new Intent(
      id,
      label.trim(),
      description || '',
      status,
      synonyms || [],
      examplePhrases || [],
      isDefault,
      now,
      now
    );
  }

  static createForCreation(
    id: string,
    label: string,
    description: string,
    status: IntentStatus,
    synonyms: string[] = [],
    examplePhrases: string[] = [],
    isDefault: boolean = false
  ): Intent {
    // Validação adicional: status deve ser ACTIVE ou SUGGESTED na criação
    Intent.validateStatusForCreation(status);
    return Intent.create(id, label, description, status, synonyms, examplePhrases, isDefault);
  }

  static reconstitute(
    id: string,
    label: string,
    description: string,
    status: IntentStatus,
    synonyms: string[],
    examplePhrases: string[],
    isDefault: boolean,
    createdAt: Date,
    updatedAt: Date
  ): Intent {
    // Na reconstitição, assumimos que os dados já foram validados anteriormente
    // Mas ainda validamos para garantir integridade
    Intent.validateLabel(label);
    Intent.validateStatus(status);
    Intent.validateSynonyms(synonyms);
    Intent.validateExamplePhrases(examplePhrases);

    return new Intent(
      id,
      label,
      description,
      status,
      synonyms || [],
      examplePhrases || [],
      isDefault,
      createdAt,
      updatedAt
    );
  }

  updateLabel(newLabel: string): Intent {
    Intent.validateLabel(newLabel);

    return Intent.reconstitute(
      this.id,
      newLabel.trim(),
      this.description,
      this.status,
      this.synonyms,
      this.examplePhrases,
      this.isDefault,
      this.createdAt,
      new Date()
    );
  }

  updateDescription(newDescription: string): Intent {
    return Intent.reconstitute(
      this.id,
      this.label,
      newDescription || '',
      this.status,
      this.synonyms,
      this.examplePhrases,
      this.isDefault,
      this.createdAt,
      new Date()
    );
  }

  updateStatus(newStatus: IntentStatus): Intent {
    Intent.validateStatus(newStatus);

    return Intent.reconstitute(
      this.id,
      this.label,
      this.description,
      newStatus,
      this.synonyms,
      this.examplePhrases,
      this.isDefault,
      this.createdAt,
      new Date()
    );
  }

  updateSynonyms(newSynonyms: string[]): Intent {
    Intent.validateSynonyms(newSynonyms);

    return Intent.reconstitute(
      this.id,
      this.label,
      this.description,
      this.status,
      newSynonyms || [],
      this.examplePhrases,
      this.isDefault,
      this.createdAt,
      new Date()
    );
  }

  updateExamplePhrases(newExamplePhrases: string[]): Intent {
    Intent.validateExamplePhrases(newExamplePhrases);

    return Intent.reconstitute(
      this.id,
      this.label,
      this.description,
      this.status,
      this.synonyms,
      newExamplePhrases || [],
      this.isDefault,
      this.createdAt,
      new Date()
    );
  }

  update(
    label: string,
    description: string,
    status: IntentStatus,
    synonyms?: string[],
    examplePhrases?: string[]
  ): Intent {
    Intent.validateLabel(label);
    Intent.validateStatus(status);

    if (synonyms !== undefined) {
      Intent.validateSynonyms(synonyms);
    }

    if (examplePhrases !== undefined) {
      Intent.validateExamplePhrases(examplePhrases);
    }

    return Intent.reconstitute(
      this.id,
      label.trim(),
      description || '',
      status,
      synonyms !== undefined ? synonyms : this.synonyms,
      examplePhrases !== undefined ? examplePhrases : this.examplePhrases,
      this.isDefault,
      this.createdAt,
      new Date()
    );
  }

  // Métodos privados de validação - garantem integridade da entidade
  private static validateLabel(label: string): void {
    if (!label || label.trim().length === 0) {
      throw new Error('Label cannot be empty');
    }
  }

  private static validateStatus(status: string | IntentStatus): void {
    if (!status || !isValidIntentStatus(status)) {
      throw new Error('Status must be ACTIVE, INACTIVE, or SUGGESTED');
    }
  }

  private static validateStatusForCreation(status: IntentStatus): void {
    if (status !== IntentStatus.ACTIVE && status !== IntentStatus.SUGGESTED) {
      throw new Error('Status must be ACTIVE or SUGGESTED when creating');
    }
  }

  private static validateSynonyms(synonyms: unknown): void {
    if (synonyms === undefined || synonyms === null) {
      return;
    }

    if (!Array.isArray(synonyms)) {
      throw new Error('synonyms must be an array of strings');
    }

    const invalidItems = synonyms.filter((item) => typeof item !== 'string');
    if (invalidItems.length > 0) {
      throw new Error('All items in synonyms must be strings');
    }
  }

  private static validateExamplePhrases(examplePhrases: unknown): void {
    if (examplePhrases === undefined || examplePhrases === null) {
      return;
    }

    if (!Array.isArray(examplePhrases)) {
      throw new Error('examplePhrases must be an array of strings');
    }

    const invalidItems = examplePhrases.filter((item) => typeof item !== 'string');
    if (invalidItems.length > 0) {
      throw new Error('All items in examplePhrases must be strings');
    }
  }
}
