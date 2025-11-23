/**
 * Intent Entity
 * Entidade principal que representa uma intenção
 */

import { IntentStatus } from '../value-objects/IntentStatus';

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
    if (!label || label.trim().length === 0) {
      throw new Error('Label cannot be empty');
    }

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
    if (!newLabel || newLabel.trim().length === 0) {
      throw new Error('Label cannot be empty');
    }

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
    if (!label || label.trim().length === 0) {
      throw new Error('Label cannot be empty');
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
}
