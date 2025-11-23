/**
 * Intent Manager Module
 * Registra o módulo intent-manager na aplicação
 */

import { Application } from 'express';
import { router, setIntentController } from './routes/intentRoutes';
import { IntentController } from './controllers/IntentController';
import { CreateDefaultIntentUseCase } from '../application/use-cases/CreateDefaultIntentUseCase';
import { CreateClientIntentUseCase } from '../application/use-cases/CreateClientIntentUseCase';
import { GetIntentUseCase } from '../application/use-cases/GetIntentUseCase';
import { UpdateIntentUseCase } from '../application/use-cases/UpdateIntentUseCase';
import { DeleteIntentUseCase } from '../application/use-cases/DeleteIntentUseCase';
import { ListClientIntentsUseCase } from '../application/use-cases/ListClientIntentsUseCase';
import { ListAllIntentsUseCase } from '../application/use-cases/ListAllIntentsUseCase';
import { ListAllDefaultIntentsUseCase } from '../application/use-cases/ListAllDefaultIntentsUseCase';
import { LinkIntentToClientUseCase } from '../application/use-cases/LinkIntentToClientUseCase';
import { ExcludeIntentFromClientUseCase } from '../application/use-cases/ExcludeIntentFromClientUseCase';
import { SQLiteIntentRepository } from '../infrastructure/repositories/SQLiteIntentRepository';
import { runMigrations } from '../infrastructure/database/migrations/runMigrations';
import { config } from '../config/environment';

export function registerModule(app: Application): void {
  // Executa migrations
  runMigrations();

  // Inicializa repositório
  const repository = new SQLiteIntentRepository();

  // Inicializa use cases
  const createDefaultIntentUseCase = new CreateDefaultIntentUseCase(repository);
  const createClientIntentUseCase = new CreateClientIntentUseCase(repository);
  const getIntentUseCase = new GetIntentUseCase(repository);
  const updateIntentUseCase = new UpdateIntentUseCase(repository);
  const deleteIntentUseCase = new DeleteIntentUseCase(repository);
  const listClientIntentsUseCase = new ListClientIntentsUseCase(repository);
  const listAllIntentsUseCase = new ListAllIntentsUseCase(repository);
  const listAllDefaultIntentsUseCase = new ListAllDefaultIntentsUseCase(repository);
  const linkIntentToClientUseCase = new LinkIntentToClientUseCase(repository);
  const excludeIntentFromClientUseCase = new ExcludeIntentFromClientUseCase(repository);

  // Inicializa controller
  const intentController = new IntentController(
    createDefaultIntentUseCase,
    createClientIntentUseCase,
    getIntentUseCase,
    updateIntentUseCase,
    deleteIntentUseCase,
    listClientIntentsUseCase,
    listAllIntentsUseCase,
    listAllDefaultIntentsUseCase,
    linkIntentToClientUseCase,
    excludeIntentFromClientUseCase
  );

  // Configura controller nas rotas
  setIntentController(intentController);

  // Registra rotas
  const apiPrefix = config.apiPrefix || '/api';
  app.use(`${apiPrefix}/intent`, router);
}
