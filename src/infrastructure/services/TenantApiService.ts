/**
 * TenantApiService
 * Implementação do ITenantService usando chamadas HTTP para API externa
 */

import { ITenantService } from '../../domain/services/ITenantService';
import { Tenant } from '../../domain/entities/Tenant';
import { TenantId } from '../../domain/value-objects/TenantId';
import { config } from '../../config/environment';
import { getLogger } from '../../shared/logger';

const logger = getLogger();

export class TenantApiService implements ITenantService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.tenantService.url;
  }

  async findById(id: TenantId): Promise<Tenant | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id.getValue()}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        logger.error(`Error fetching tenant ${id.getValue()}: ${response.statusText}`);
        throw new Error(`Failed to fetch tenant: ${response.statusText}`);
      }

      const data = await response.json() as {
        success: boolean;
        data?: {
          id: string;
          name: string;
        };
      };

      // Formato da resposta: { success: true, data: { id: string, name: string } }
      if (!data.success || !data.data) {
        return null;
      }

      // Garante que temos id e name
      if (!data.data.id || !data.data.name) {
        logger.warn(`Invalid tenant data format for ${id.getValue()}:`, data);
        return null;
      }

      return Tenant.reconstitute(data.data.id, data.data.name);
    } catch (error) {
      logger.error(`Error in TenantApiService.findById: ${error}`);
      throw error;
    }
  }

  async exists(id: TenantId): Promise<boolean> {
    try {
      const tenant = await this.findById(id);
      return tenant !== null;
    } catch (error) {
      logger.error(`Error in TenantApiService.exists: ${error}`);
      // Em caso de erro na API, retorna false para não bloquear o fluxo
      // ou pode lançar erro dependendo da estratégia de negócio
      return false;
    }
  }
}

