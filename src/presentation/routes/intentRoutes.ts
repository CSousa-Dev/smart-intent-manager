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

// Rotas
router.post('/', (req: Request, res: Response) => intentController.createIntent(req, res));

router.get('/all', (req: Request, res: Response) => intentController.listAllIntents(req, res));

router.get('/', (req: Request, res: Response) => intentController.listIntents(req, res));

router.get('/:id', (req: Request, res: Response) => intentController.getIntent(req, res));

router.put('/:id', (req: Request, res: Response) => intentController.updateIntent(req, res));

router.delete('/:id', (req: Request, res: Response) => intentController.deleteIntent(req, res));

export { router };

