/**
 * CreateIntentDTO
 * DTOs para criação de intenção
 */

import { IntentStatus } from '../../domain/value-objects/IntentStatus';

export interface CreateDefaultIntentDTO {
  label: string;
  description: string;
  status: IntentStatus;
  synonyms?: string[];
  examplePhrases?: string[];
}

export interface CreateClientIntentDTO {
  clientId: string;
  label: string;
  description: string;
  status: IntentStatus;
  synonyms?: string[];
  examplePhrases?: string[];
}
