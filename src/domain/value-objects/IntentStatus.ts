/**
 * IntentStatus Enum
 * Status permitidos para uma intenção
 */

export enum IntentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUGGESTED = 'SUGGESTED',
}

export function isValidIntentStatus(value: string): value is IntentStatus {
  return Object.values(IntentStatus).includes(value as IntentStatus);
}

