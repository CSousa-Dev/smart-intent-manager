/**
 * Intent Routes
 * Define as rotas REST para intenções
 */

import { Router, Request, Response } from 'express';
import { IntentController } from '../controllers/IntentController';

const router = Router();

// Inicializa controller (será injetado via módulo)
let intentController: IntentController;

export function setIntentController(controller: IntentController): void {
  intentController = controller;
}

// Rotas de criação
router.post('/default', (req: Request, res: Response) =>
  intentController.createDefaultIntent(req, res)
);

router.post('/client', (req: Request, res: Response) =>
  intentController.createClientIntent(req, res)
);

// Rotas de listagem
router.get('/default', (req: Request, res: Response) =>
  intentController.listAllDefaultIntents(req, res)
);

router.get('/all', (req: Request, res: Response) => intentController.listAllIntents(req, res));

router.get('/', (req: Request, res: Response) => intentController.listClientIntents(req, res));

// Rotas de relacionamento
router.post('/:id/link', (req: Request, res: Response) =>
  intentController.linkIntentToClient(req, res)
);

router.post('/:id/exclude', (req: Request, res: Response) =>
  intentController.excludeIntentFromClient(req, res)
);

// Rotas CRUD básico
router.get('/:id', (req: Request, res: Response) => intentController.getIntent(req, res));

router.put('/:id', (req: Request, res: Response) => intentController.updateIntent(req, res));

router.delete('/:id', (req: Request, res: Response) => intentController.deleteIntent(req, res));

export { router };
