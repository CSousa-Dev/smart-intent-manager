/**
 * Intent Manager Module
 * Registra o módulo intent-manager na aplicação
 */

import { Application } from 'express';
import { router, setIntentController } from './routes/intentRoutes';
import { IntentController } from './controllers/IntentController';
import { CreateIntentUseCase } from '../application/use-cases/CreateIntentUseCase';
import { GetIntentUseCase } from '../application/use-cases/GetIntentUseCase';
import { UpdateIntentUseCase } from '../application/use-cases/UpdateIntentUseCase';
import { DeleteIntentUseCase } from '../application/use-cases/DeleteIntentUseCase';
import { ListIntentsByClientUseCase } from '../application/use-cases/ListIntentsByClientUseCase';
import { ListAllIntentsUseCase } from '../application/use-cases/ListAllIntentsUseCase';
import { SQLiteIntentRepository } from '../infrastructure/repositories/SQLiteIntentRepository';
import { runMigrations } from '../infrastructure/database/migrations/runMigrations';
import { config } from '../config/environment';

export function registerModule(app: Application): void {
  // Executa migrations
  runMigrations();

  // Inicializa repositório
  const repository = new SQLiteIntentRepository();

  // Inicializa use cases
  const createIntentUseCase = new CreateIntentUseCase(repository);
  const getIntentUseCase = new GetIntentUseCase(repository);
  const updateIntentUseCase = new UpdateIntentUseCase(repository);
  const deleteIntentUseCase = new DeleteIntentUseCase(repository);
  const listIntentsByClientUseCase = new ListIntentsByClientUseCase(repository);
  const listAllIntentsUseCase = new ListAllIntentsUseCase(repository);

  // Inicializa controller
  const intentController = new IntentController(
    createIntentUseCase,
    getIntentUseCase,
    updateIntentUseCase,
    deleteIntentUseCase,
    listIntentsByClientUseCase,
    listAllIntentsUseCase
  );

  // Configura controller nas rotas
  setIntentController(intentController);

  // Registra rotas
  const apiPrefix = config.apiPrefix || '/api';
  app.use(`${apiPrefix}/intent`, router);
}

