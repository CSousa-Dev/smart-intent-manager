/**
 * ITenantService Interface
 * Interface de serviço de domínio para acesso a tenants
 * Será implementada na camada de infraestrutura via chamadas de API
 */

import { Tenant } from '../entities/Tenant';
import { TenantId } from '../value-objects/TenantId';

export interface ITenantService {
  /**
   * Busca um tenant por ID
   * @param id ID do tenant
   * @returns Tenant se encontrado, null caso contrário
   */
  findById(id: TenantId): Promise<Tenant | null>;

  /**
   * Verifica se um tenant existe
   * @param id ID do tenant
   * @returns true se o tenant existe, false caso contrário
   */
  exists(id: TenantId): Promise<boolean>;
}

