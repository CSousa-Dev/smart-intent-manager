/**
 * UpdateIntentDTO
 * DTO para atualização de intenção
 */

import { IntentStatus } from '../../domain/value-objects/IntentStatus';

export interface UpdateIntentDTO {
  label?: string;
  description?: string;
  status?: IntentStatus;
  synonyms?: string[];
  examplePhrases?: string[];
}
