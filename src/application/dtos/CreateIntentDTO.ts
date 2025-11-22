/**
 * CreateIntentDTO
 * DTO para criação de intenção
 */

import { IntentStatus } from '../../domain/value-objects/IntentStatus';

export interface CreateIntentDTO {
  clientId: string;
  label: string;
  description: string;
  status: IntentStatus;
}

