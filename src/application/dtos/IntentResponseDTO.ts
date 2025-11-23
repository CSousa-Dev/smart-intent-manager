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
  tenantIds: string[]; // Lista de tenantIds vinculados à intent
  createdAt: string;
  updatedAt?: string;
}

export interface ListIntentsResponseDTO {
  items: IntentResponseDTO[];
  total: number;
}

export interface LinkIntentDTO {
  tenantId: string;
  intentId: string;
}

export interface ExcludeIntentDTO {
  tenantId: string;
  intentId: string;
}
