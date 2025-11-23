/**
 * IntentResponseDTO
 * DTOs para resposta de intenção
 */

import { IntentStatus } from '../../domain/value-objects/IntentStatus';

export interface IntentResponseDTO {
  id: string;
  label: string;
  description: string;
  status: IntentStatus;
  synonyms: string[];
  examplePhrases: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ListIntentsResponseDTO {
  items: IntentResponseDTO[];
  total: number;
}

export interface LinkIntentDTO {
  clientId: string;
  intentId: string;
}

export interface ExcludeIntentDTO {
  clientId: string;
  intentId: string;
}
