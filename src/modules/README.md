# Módulos
Esta pasta contém os módulos da aplicação. Cada módulo deve seguir a estrutura abaixo:

## Estrutura de um Módulo

```
meu-modulo/
├── domain/              # Camada de domínio
│   ├── entities/        # Entidades de negócio
│   ├── repositories/    # Interfaces de repositórios
│   └── services/        # Serviços de domínio
├── infrastructure/      # Camada de infraestrutura
│   └── repositories/    # Implementações de repositórios
├── presentation/        # Camada de apresentação
│   ├── controllers/     # Controllers
│   ├── dtos/            # Data Transfer Objects
│   └── routes/          # Rotas do Express
└── module.ts            # Arquivo de registro do módulo
```

## Exemplo de module.ts

```typescript
import { Application } from 'express';
import { router } from './presentation/routes';

export function registerModule(app: Application): void {
  app.use('/api/v1/meu-modulo', router);
}
```

## Exemplo de routes

```typescript
import { Router } from 'express';
import { MeuController } from '../controllers/MeuController';

export const router = Router();
const controller = new MeuController();

router.get('/', controller.list.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
```

## Registrando o Módulo

No arquivo `src/app.ts`, importe e registre o módulo:

```typescript
import { registerModule } from './modules/meu-modulo/module';

// Dentro de createApp()
registerModule(app);
```

