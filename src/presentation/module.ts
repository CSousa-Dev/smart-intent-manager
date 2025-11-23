/**
 * Intent Manager Module
 * Registra o módulo intent-manager na aplicação
 */

import { Application } from 'express';
import { router, setIntentController } from './routes/intentRoutes';
import { IntentController } from './controllers/IntentController';
import { CreateDefaultIntentUseCase } from '../application/use-cases/CreateDefaultIntentUseCase';
import { CreateTenantIntentUseCase } from '../application/use-cases/CreateTenantIntentUseCase';
import { GetIntentUseCase } from '../application/use-cases/GetIntentUseCase';
import { UpdateIntentUseCase } from '../application/use-cases/UpdateIntentUseCase';
import { DeleteIntentUseCase } from '../application/use-cases/DeleteIntentUseCase';
import { ListTenantIntentsUseCase } from '../application/use-cases/ListTenantIntentsUseCase';
import { ListAllIntentsUseCase } from '../application/use-cases/ListAllIntentsUseCase';
import { ListAllDefaultIntentsUseCase } from '../application/use-cases/ListAllDefaultIntentsUseCase';
import { LinkIntentToTenantUseCase } from '../application/use-cases/LinkIntentToTenantUseCase';
import { ExcludeIntentFromTenantUseCase } from '../application/use-cases/ExcludeIntentFromTenantUseCase';
import { SQLiteIntentRepository } from '../infrastructure/repositories/SQLiteIntentRepository';
import { TenantApiService } from '../infrastructure/services/TenantApiService';
import { runMigrations } from '../infrastructure/database/migrations/runMigrations';
import { config } from '../config/environment';

export function registerModule(app: Application): void {
  // Executa migrations
  runMigrations();

  // Inicializa repositório
  const repository = new SQLiteIntentRepository();

  // Inicializa serviço de tenant (API externa)
  const tenantService = new TenantApiService();

  // Inicializa use cases
  const createDefaultIntentUseCase = new CreateDefaultIntentUseCase(repository);
  const createTenantIntentUseCase = new CreateTenantIntentUseCase(repository, tenantService);
  const getIntentUseCase = new GetIntentUseCase(repository);
  const updateIntentUseCase = new UpdateIntentUseCase(repository);
  const deleteIntentUseCase = new DeleteIntentUseCase(repository);
  const listTenantIntentsUseCase = new ListTenantIntentsUseCase(repository);
  const listAllIntentsUseCase = new ListAllIntentsUseCase(repository);
  const listAllDefaultIntentsUseCase = new ListAllDefaultIntentsUseCase(repository);
  const linkIntentToTenantUseCase = new LinkIntentToTenantUseCase(repository);
  const excludeIntentFromTenantUseCase = new ExcludeIntentFromTenantUseCase(repository);

  // Inicializa controller
  const intentController = new IntentController(
    createDefaultIntentUseCase,
    createTenantIntentUseCase,
    getIntentUseCase,
    updateIntentUseCase,
    deleteIntentUseCase,
    listTenantIntentsUseCase,
    listAllIntentsUseCase,
    listAllDefaultIntentsUseCase,
    linkIntentToTenantUseCase,
    excludeIntentFromTenantUseCase
  );

  // Configura controller nas rotas
  setIntentController(intentController);

  // Registra rotas
  const apiPrefix = config.apiPrefix || '/api';
  app.use(`${apiPrefix}/intent`, router);
}
