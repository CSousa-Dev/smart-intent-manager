/**
 * TenantId Value Object
 * Representa o identificador do tenant
 */

export class TenantId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('TenantId cannot be empty');
    }
  }

  static create(value: string): TenantId {
    return new TenantId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TenantId): boolean {
    return this.value === other.value;
  }
}

