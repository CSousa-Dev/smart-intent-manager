/**
 * Tenant Entity
 * Entidade que representa um tenant
 */

export class Tenant {
  private constructor(
    public readonly id: string,
    public readonly name: string
  ) {}

  static create(id: string, name: string): Tenant {
    if (!id || id.trim().length === 0) {
      throw new Error('Tenant id cannot be empty');
    }

    if (!name || name.trim().length === 0) {
      throw new Error('Tenant name cannot be empty');
    }

    return new Tenant(id.trim(), name.trim());
  }

  static reconstitute(id: string, name: string): Tenant {
    return new Tenant(id, name);
  }
}

