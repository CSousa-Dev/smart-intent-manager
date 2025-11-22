/**
 * IntentResponseDTO
 * DTO para resposta de intenção
 */

import { IntentStatus } from '../../domain/value-objects/IntentStatus';

export interface IntentResponseDTO {
  id: string;
  clientId: string;
  label: string;
  description: string;
  status: IntentStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ListIntentsResponseDTO {
  items: IntentResponseDTO[];
  total: number;
}

