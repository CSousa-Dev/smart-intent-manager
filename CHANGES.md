# Mudanças da Versão Anterior para Versão Atual

Este documento descreve todas as mudanças implementadas na refatoração do Intent Manager, migrando de uma arquitetura simples com intenções vinculadas diretamente a clientes para uma arquitetura mais flexível com intenções compartilhadas e relacionamentos many-to-many.

## 📋 Resumo Executivo

### Versão Anterior
- Intenções vinculadas diretamente a um `clientId`
- Label único por `clientId`
- Estrutura simples: uma intenção = um cliente

### Versão Atual
- Intenções podem ser **default** (compartilhadas) ou **específicas de cliente**
- Label único **globalmente**
- Relacionamento many-to-many entre clientes e intenções
- Suporte a exclusões de intenções default por cliente
- Novos campos: `synonyms` e `examplePhrases`

---

## 🔄 Mudanças na Estrutura de Dados

### Tabela `intents` (Modificada)

#### Campos Removidos
- ❌ `client_id` - Removido (não pertence mais diretamente à intenção)

#### Campos Adicionados
- ✅ `synonyms` (TEXT) - Array JSON de palavras relacionadas
- ✅ `example_phrases` (TEXT) - Array JSON de frases de exemplo
- ✅ `is_default` (BOOLEAN) - Indica se é intenção compartilhada/default

#### Campos Modificados
- 🔄 `label` - Agora é único **globalmente** (não mais por clientId)

### Novas Tabelas

#### `client_intents` (Junction Table)
```sql
CREATE TABLE client_intents (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  intent_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(client_id, intent_id)
);
```
**Propósito:** Vincula intenções específicas a clientes.

#### `client_intent_exclusions` (Exclusões)
```sql
CREATE TABLE client_intent_exclusions (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  intent_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(client_id, intent_id)
);
```
**Propósito:** Permite excluir intenções default de clientes específicos.

---

## 🏗️ Mudanças na Arquitetura

### Domain Layer

#### Entidade `Intent`
**Mudanças:**
- ❌ Removido: `clientId: ClientId`
- ✅ Adicionado: `synonyms: string[]`
- ✅ Adicionado: `examplePhrases: string[]`
- ✅ Adicionado: `isDefault: boolean`

**Novos Métodos:**
- `updateSynonyms(newSynonyms: string[]): Intent`
- `updateExamplePhrases(newExamplePhrases: string[]): Intent`

**Método `create` atualizado:**
```typescript
static create(
  id: string,
  label: string,           // Removido clientId
  description: string,
  status: IntentStatus,
  synonyms: string[] = [],
  examplePhrases: string[] = [],
  isDefault: boolean = false
): Intent
```

#### Novos Serviços de Domínio

**`IntentValidator`** (`src/domain/services/IntentValidator.ts`)
- `validateLabel(label: string): void`
- `validateStatus(status: string): void`
- `validateStatusForCreation(status: IntentStatus): void`
- `validateSynonyms(synonyms: unknown): string[]`
- `validateExamplePhrases(examplePhrases: unknown): string[]`

**`IntentAccessService`** (`src/domain/services/IntentAccessService.ts`)
- `hasAccess(intent, clientId, isLinked, isExcluded): boolean`
- `filterByClientAccess(intents, clientId, linkedIds, excludedIds): Intent[]`

#### Interface `IIntentRepository`
**Métodos Removidos:**
- ❌ `findByClientAndLabel(clientId: ClientId, label: string)`

**Métodos Adicionados:**
- ✅ `findByLabel(label: string): Promise<Intent | null>`
- ✅ `findAllDefault(): Promise<Intent[]>`
- ✅ `linkIntentToClient(intentId: string, clientId: ClientId): Promise<void>`
- ✅ `unlinkIntentFromClient(intentId: string, clientId: ClientId): Promise<void>`
- ✅ `excludeIntentFromClient(intentId: string, clientId: ClientId): Promise<void>`
- ✅ `removeExclusion(intentId: string, clientId: ClientId): Promise<void>`
- ✅ `findIntentsByClient(clientId: ClientId): Promise<Intent[]>`
- ✅ `isIntentLinkedToClient(intentId: string, clientId: ClientId): Promise<boolean>`
- ✅ `isIntentExcludedFromClient(intentId: string, clientId: ClientId): Promise<boolean>`
- ✅ `getLinkedIntentIds(clientId: ClientId): Promise<Set<string>>`
- ✅ `getExcludedIntentIds(clientId: ClientId): Promise<Set<string>>`

---

## 📦 Application Layer

### DTOs

#### `CreateIntentDTO.ts` (Substituído)
**Antes:**
```typescript
interface CreateIntentDTO {
  clientId: string;
  label: string;
  description: string;
  status: IntentStatus;
}
```

**Agora:**
```typescript
interface CreateDefaultIntentDTO {
  label: string;
  description: string;
  status: IntentStatus;
  synonyms?: string[];
  examplePhrases?: string[];
}

interface CreateClientIntentDTO {
  clientId: string;
  label: string;
  description: string;
  status: IntentStatus;
  synonyms?: string[];
  examplePhrases?: string[];
}
```

#### `UpdateIntentDTO.ts` (Atualizado)
**Adicionado:**
- `synonyms?: string[]`
- `examplePhrases?: string[]`

#### `IntentResponseDTO.ts` (Atualizado)
**Mudanças:**
- ❌ Removido: `clientId: string`
- ✅ Adicionado: `synonyms: string[]`
- ✅ Adicionado: `examplePhrases: string[]`
- ✅ Adicionado: `isDefault: boolean`

**Novos DTOs:**
- `LinkIntentDTO`
- `ExcludeIntentDTO`

### Use Cases

#### Use Cases Removidos
- ❌ `CreateIntentUseCase` (substituído por dois novos)

#### Novos Use Cases
- ✅ `CreateDefaultIntentUseCase` - Cria intenção compartilhada/default
- ✅ `CreateClientIntentUseCase` - Cria intenção específica de cliente
- ✅ `LinkIntentToClientUseCase` - Vincula intenção default a cliente
- ✅ `ExcludeIntentFromClientUseCase` - Exclui intenção default de cliente
- ✅ `ListAllDefaultIntentsUseCase` - Lista apenas intenções default

#### Use Cases Atualizados
- 🔄 `UpdateIntentUseCase` - Agora suporta `synonyms` e `examplePhrases`
- 🔄 `ListClientIntentsUseCase` - Agora usa lógica de acesso com relacionamentos

---

## 🌐 Presentation Layer

### Controller (`IntentController.ts`)

#### Métodos Removidos
- ❌ `createIntent()` (substituído por dois novos)

#### Novos Métodos
- ✅ `createDefaultIntent()` - Cria intenção default
- ✅ `createClientIntent()` - Cria intenção para cliente
- ✅ `listAllDefaultIntents()` - Lista intenções default
- ✅ `linkIntentToClient()` - Vincula intenção a cliente
- ✅ `excludeIntentFromClient()` - Exclui intenção de cliente

#### Métodos Atualizados
- 🔄 `getIntent()` - Retorna `isDefault` e novos campos
- 🔄 `updateIntent()` - Aceita `synonyms` e `examplePhrases`
- 🔄 `listClientIntents()` - Usa nova lógica de acesso

### Routes (`intentRoutes.ts`)

#### Rotas Removidas
- ❌ `POST /api/intent` (substituída)

#### Novas Rotas
- ✅ `POST /api/intent/default` - Criar intenção default
- ✅ `POST /api/intent/client` - Criar intenção para cliente
- ✅ `GET /api/intent/default` - Listar intenções default
- ✅ `POST /api/intent/:id/link` - Vincular intenção a cliente
- ✅ `POST /api/intent/:id/exclude` - Excluir intenção de cliente

#### Rotas Mantidas (comportamento atualizado)
- ✅ `GET /api/intent/:id` - Buscar por ID
- ✅ `PUT /api/intent/:id` - Atualizar
- ✅ `DELETE /api/intent/:id` - Excluir
- ✅ `GET /api/intent?clientId=X` - Listar por cliente (lógica atualizada)
- ✅ `GET /api/intent/all` - Listar todas

---

## 🔧 Infrastructure Layer

### Migration (`001_create_intents_tables.sql`)

**Substituição Completa:**
- ❌ Migration antiga removida
- ✅ Nova migration cria 3 tabelas:
  1. `intents` (sem `client_id`, com novos campos)
  2. `client_intents` (junction table)
  3. `client_intent_exclusions` (exclusões)

### Repository (`SQLiteIntentRepository.ts`)

**Reescrito Completamente:**
- Implementa todos os novos métodos da interface
- Armazena `synonyms` e `examplePhrases` como JSON
- Implementa lógica de acesso usando `IntentAccessService`
- Queries SQL atualizadas para novas tabelas

---

## 📝 Regras de Negócio Atualizadas

### Criação de Intenções

**Antes:**
- Todas as intenções eram específicas de um cliente
- `clientId` obrigatório
- Label único por `clientId`

**Agora:**
- Intenções podem ser **default** (compartilhadas) ou **específicas**
- Para default: `clientId` não necessário
- Para específica: `clientId` obrigatório
- Label único **globalmente**

### Acesso a Intenções

**Lógica de Acesso:**
1. **Intenção Default (`isDefault = true`):**
   - Disponível para **todos** os clientes
   - **EXCETO** clientes que estão na tabela `client_intent_exclusions`
   - Não precisa estar em `client_intents`

2. **Intenção Específica (`isDefault = false`):**
   - Disponível **apenas** para clientes que estão em `client_intents`
   - Não aparece para outros clientes

### Validações

**Novas Validações:**
- `synonyms` deve ser array de strings
- `examplePhrases` deve ser array de strings
- Label único globalmente (não mais por cliente)

---

## 🧪 Testes

### Testes Atualizados
- ✅ `Intent.test.ts` - Atualizado para novos campos e remoção de `clientId`
- ✅ `CreateIntentUseCase.test.ts` - Substituído por testes dos novos use cases
- ✅ `UpdateIntentUseCase.test.ts` - Atualizado para novos campos
- ✅ `ListIntentsByClientUseCase.test.ts` - Atualizado para nova lógica

### Novos Testes
- ✅ `IntentValidator.test.ts` - Testes do serviço de validação
- ✅ `IntentAccessService.test.ts` - Testes do serviço de acesso
- ✅ `CreateDefaultIntentUseCase.test.ts`
- ✅ `CreateClientIntentUseCase.test.ts`
- ✅ `LinkIntentToClientUseCase.test.ts`
- ✅ `ExcludeIntentFromClientUseCase.test.ts`
- ✅ `ListAllDefaultIntentsUseCase.test.ts`

---

## 🔌 API Endpoints - Comparação

### Endpoints Removidos
- ❌ `POST /api/intent` (substituído)

### Novos Endpoints
- ✅ `POST /api/intent/default` - Criar intenção default
- ✅ `POST /api/intent/client` - Criar intenção para cliente
- ✅ `GET /api/intent/default` - Listar intenções default
- ✅ `POST /api/intent/:id/link` - Vincular intenção a cliente
- ✅ `POST /api/intent/:id/exclude` - Excluir intenção de cliente

### Endpoints Mantidos (comportamento atualizado)
- ✅ `GET /api/intent/:id` - Retorna `isDefault`, `synonyms`, `examplePhrases`
- ✅ `PUT /api/intent/:id` - Aceita `synonyms` e `examplePhrases`
- ✅ `DELETE /api/intent/:id` - Comportamento mantido
- ✅ `GET /api/intent?clientId=X` - Lógica de acesso atualizada
- ✅ `GET /api/intent/all` - Retorna todas (defaults + específicas)

---

## 📊 Exemplos de Uso

### Criar Intenção Default
```json
POST /api/intent/default
{
  "label": "agendamento",
  "description": "Intenção de agendamento",
  "status": "ACTIVE",
  "synonyms": ["marcar", "agendar", "horário", "consulta"],
  "examplePhrases": [
    "Quero marcar um horário amanhã",
    "Vocês têm horário livre?",
    "Posso agendar atendimento?"
  ]
}
```

### Criar Intenção para Cliente Específico
```json
POST /api/intent/client
{
  "clientId": "client-001",
  "label": "cancelamento-especial",
  "description": "Cancelamento específico deste cliente",
  "status": "ACTIVE",
  "synonyms": ["cancelar", "desmarcar"],
  "examplePhrases": ["Quero cancelar", "Preciso desmarcar"]
}
```

### Vincular Intenção Default a Cliente
```json
POST /api/intent/{intentId}/link
{
  "clientId": "client-001"
}
```

### Excluir Intenção Default de Cliente
```json
POST /api/intent/{intentId}/exclude
{
  "clientId": "client-001"
}
```

### Listar Intenções de um Cliente
```
GET /api/intent?clientId=client-001
```
**Retorna:**
- Todas as intenções default (não excluídas)
- Todas as intenções específicas vinculadas ao cliente

---

## ⚠️ Breaking Changes

### ⚠️ Migração de Dados Necessária

**IMPORTANTE:** Como as tabelas foram recriadas do zero, todos os dados existentes serão perdidos. Se houver dados em produção, será necessário:

1. **Backup dos dados existentes**
2. **Migração manual** para nova estrutura:
   - Converter intenções antigas para intenções específicas de cliente
   - Criar registros em `client_intents` para cada intenção antiga

### ⚠️ Mudanças na API

1. **`POST /api/intent` removido** - Usar `/api/intent/default` ou `/api/intent/client`
2. **Resposta de `GET /api/intent/:id`** - Não retorna mais `clientId`, retorna `isDefault`
3. **Resposta de listagem** - Não retorna mais `clientId` em cada item
4. **Validação de label** - Agora é único globalmente, não por cliente

### ⚠️ Mudanças nos DTOs

- `CreateIntentDTO` substituído por `CreateDefaultIntentDTO` e `CreateClientIntentDTO`
- `IntentResponseDTO` não tem mais `clientId`
- Novos campos obrigatórios: `synonyms` e `examplePhrases` (podem ser arrays vazios)

---

## ✅ Benefícios da Nova Arquitetura

1. **Flexibilidade:** Intenções podem ser compartilhadas ou específicas
2. **Reutilização:** Intenções default podem ser usadas por múltiplos clientes
3. **Granularidade:** Controle fino sobre quais clientes veem quais intenções
4. **Escalabilidade:** Melhor performance com relacionamentos many-to-many
5. **Enriquecimento:** Novos campos `synonyms` e `examplePhrases` melhoram classificação LLM
6. **Separação de Responsabilidades:** Serviços de domínio isolam lógica de negócio

---

## 📚 Arquivos Modificados

### Domain Layer
- `src/domain/entities/Intent.ts` - Reescrito
- `src/domain/repositories/IIntentRepository.ts` - Interface atualizada
- `src/domain/services/IntentValidator.ts` - **NOVO**
- `src/domain/services/IntentAccessService.ts` - **NOVO**

### Application Layer
- `src/application/dtos/CreateIntentDTO.ts` - Substituído por dois DTOs
- `src/application/dtos/UpdateIntentDTO.ts` - Atualizado
- `src/application/dtos/IntentResponseDTO.ts` - Atualizado
- `src/application/use-cases/CreateDefaultIntentUseCase.ts` - **NOVO**
- `src/application/use-cases/CreateClientIntentUseCase.ts` - **NOVO**
- `src/application/use-cases/LinkIntentToClientUseCase.ts` - **NOVO**
- `src/application/use-cases/ExcludeIntentFromClientUseCase.ts` - **NOVO**
- `src/application/use-cases/ListAllDefaultIntentsUseCase.ts` - **NOVO**
- `src/application/use-cases/UpdateIntentUseCase.ts` - Atualizado
- `src/application/use-cases/ListClientIntentsUseCase.ts` - Atualizado

### Infrastructure Layer
- `src/infrastructure/database/migrations/001_create_intents_tables.sql` - Reescrito
- `src/infrastructure/database/migrations/runMigrations.ts` - Atualizado
- `src/infrastructure/repositories/SQLiteIntentRepository.ts` - Reescrito

### Presentation Layer
- `src/presentation/controllers/IntentController.ts` - Reescrito
- `src/presentation/routes/intentRoutes.ts` - Atualizado
- `src/presentation/module.ts` - Atualizado

### Testes
- `tests/unit/domain/entities/Intent.test.ts` - Atualizado
- `tests/unit/domain/services/IntentValidator.test.ts` - **NOVO**
- `tests/unit/domain/services/IntentAccessService.test.ts` - **NOVO**
- Todos os testes de use cases atualizados

---

## 🚀 Próximos Passos Recomendados

1. **Atualizar Frontend** - Usar novos endpoints e DTOs
2. **Migração de Dados** - Se houver dados em produção
3. **Documentação da API** - Atualizar Swagger/OpenAPI se existir
4. **Testes de Integração** - Validar fluxos completos
5. **Monitoramento** - Acompanhar performance das novas queries

---

**Data da Mudança:** 2025-01-22  
**Versão:** 2.0.0 (Breaking Changes)

