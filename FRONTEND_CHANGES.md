# Mudanças na API - Intent Manager

## 📋 Resumo das Mudanças

Este documento descreve as mudanças recentes na API do Intent Manager que afetam o frontend.

---

## 🔄 Mudanças Principais

### 1. Porta da API Alterada
- **Antes**: `http://localhost:3001`
- **Agora**: `http://localhost:3010`
- **Ação necessária**: Atualizar a URL base da API no frontend

### 2. Remoção de Versionamento v1
- **Antes**: `/api/v1/intent`
- **Agora**: `/api/intent`
- **Ação necessária**: Remover `/v1` de todas as rotas da API

### 3. Mudança de `clientId` para `tenantId`
- **Antes**: Todos os endpoints usavam `clientId`
- **Agora**: Todos os endpoints usam `tenantId`
- **Ação necessária**: Substituir todas as referências de `clientId` por `tenantId` nas requisições

---

## 📡 Endpoints Atualizados

### Base URL
```
http://localhost:3010/api/intent
```

### Endpoints Disponíveis

#### 1. Criar Intent Default
```http
POST /api/intent/default
Content-Type: application/json

{
  "label": "greeting",
  "description": "Saudação inicial",
  "status": "ACTIVE",
  "synonyms": ["olá", "oi", "bom dia"],
  "examplePhrases": ["Olá, como posso ajudar?", "Bom dia!"]
}
```

#### 2. Criar Intent para Tenant
```http
POST /api/intent/tenant
Content-Type: application/json

{
  "tenantId": "tenant-001",
  "label": "appointment",
  "description": "Agendamento",
  "status": "ACTIVE",
  "synonyms": ["marcar", "agendar", "horário"],
  "examplePhrases": ["Quero marcar um horário", "Posso agendar?"]
}
```

**Mudança**: Endpoint mudou de `/api/intent/client` para `/api/intent/tenant` e agora usa `tenantId` em vez de `clientId`.

#### 3. Listar Intents de um Tenant
```http
GET /api/intent?tenantId=tenant-001
```

**Mudança**: Query parameter mudou de `clientId` para `tenantId`.

#### 4. Listar Todas as Intents
```http
GET /api/intent/all
```
Sem mudanças.

#### 5. Listar Intents Default
```http
GET /api/intent/default
```
Novo endpoint.

#### 6. Buscar Intent por ID
```http
GET /api/intent/:id
```
Sem mudanças.

#### 7. Atualizar Intent
```http
PUT /api/intent/:id
Content-Type: application/json

{
  "label": "updated-label",
  "description": "Nova descrição",
  "status": "ACTIVE",
  "synonyms": ["novo", "sinônimo"],
  "examplePhrases": ["Nova frase de exemplo"]
}
```
Sem mudanças.

#### 8. Deletar Intent
```http
DELETE /api/intent/:id
```
Sem mudanças.

#### 9. Vincular Intent a Tenant
```http
POST /api/intent/:id/link
Content-Type: application/json

{
  "tenantId": "tenant-001"
}
```

**Mudança**: Endpoint mudou de `/api/intent/:id/link` (usando `clientId`) para usar `tenantId`.

#### 10. Excluir Intent Default de Tenant
```http
POST /api/intent/:id/exclude
Content-Type: application/json

{
  "tenantId": "tenant-001"
}
```

**Mudança**: Endpoint mudou de `/api/intent/:id/exclude` (usando `clientId`) para usar `tenantId`.

---

## 📦 Estrutura de Dados

### Request DTOs

#### Criar Intent Default
```typescript
interface CreateDefaultIntentRequest {
  label: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "SUGGESTED";
  synonyms?: string[];
  examplePhrases?: string[];
}
```

#### Criar Intent para Tenant
```typescript
interface CreateTenantIntentRequest {
  tenantId: string;  // Mudou de clientId
  label: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "SUGGESTED";
  synonyms?: string[];
  examplePhrases?: string[];
}
```

#### Atualizar Intent
```typescript
interface UpdateIntentRequest {
  label?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUGGESTED";
  synonyms?: string[];
  examplePhrases?: string[];
}
```

#### Vincular/Excluir Intent
```typescript
interface LinkIntentRequest {
  tenantId: string;  // Mudou de clientId
}

interface ExcludeIntentRequest {
  tenantId: string;  // Mudou de clientId
}
```

### Response DTOs

#### Intent Response
```typescript
interface IntentResponse {
  id: string;
  tenantId?: string;  // Opcional (apenas para intents não-default)
  label: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "SUGGESTED";
  synonyms: string[];
  examplePhrases: string[];
  isDefault: boolean;  // Indica se é uma intent default
  createdAt: string;
  updatedAt?: string;
}
```

#### List Intents Response
```typescript
interface ListIntentsResponse {
  items: IntentResponse[];
  total: number;
}
```

---

## 🔍 Validações e Regras de Negócio

### Validações de Entrada
- `tenantId` é obrigatório para criar intents não-default
- `label` deve ser único globalmente
- `status` deve ser um dos valores: `ACTIVE`, `INACTIVE`, `SUGGESTED`
- `synonyms` e `examplePhrases` são arrays opcionais de strings

### Regras de Negócio
1. **Intents Default**: São compartilhadas entre todos os tenants por padrão
2. **Intents de Tenant**: São específicas de um tenant e precisam ser vinculadas
3. **Exclusão**: Apenas intents default podem ser excluídas de tenants específicos
4. **Vínculo**: Intents não-default precisam ser vinculadas explicitamente aos tenants

---

## ⚠️ Códigos de Erro

### 400 Bad Request
- `tenantId is required` - Quando tenantId não é fornecido
- `Intent id is required` - Quando ID da intent não é fornecido
- `Can only exclude default intents from tenants` - Tentativa de excluir intent não-default

### 404 Not Found
- `Tenant with id {tenantId} not found` - Tenant não existe
- `Intent with id {id} not found` - Intent não existe

### 409 Conflict
- `Intent with label "{label}" already exists` - Label já está em uso
- `Intent is already excluded from this tenant` - Intent já está excluída

---

## 🔄 Exemplo de Migração

### Antes
```typescript
// Criar intent para cliente
POST http://localhost:3001/api/v1/intent/client
{
  "clientId": "client-001",
  "label": "greeting",
  "status": "ACTIVE"
}

// Listar intents de cliente
GET http://localhost:3001/api/v1/intent?clientId=client-001

// Vincular intent
POST http://localhost:3001/api/v1/intent/123/link
{
  "clientId": "client-001"
}
```

### Depois
```typescript
// Criar intent para tenant
POST http://localhost:3010/api/intent/tenant
{
  "tenantId": "tenant-001",
  "label": "greeting",
  "status": "ACTIVE"
}

// Listar intents de tenant
GET http://localhost:3010/api/intent?tenantId=tenant-001

// Vincular intent
POST http://localhost:3010/api/intent/123/link
{
  "tenantId": "tenant-001"
}
```

---

## 📝 Checklist de Migração

- [ ] Atualizar URL base da API de `3001` para `3010`
- [ ] Remover `/v1` de todas as rotas
- [ ] Substituir `clientId` por `tenantId` em todas as requisições
- [ ] Atualizar endpoint de criação de intent: `/api/intent/client` → `/api/intent/tenant`
- [ ] Atualizar query parameter: `?clientId=` → `?tenantId=`
- [ ] Atualizar interfaces TypeScript para usar `tenantId`
- [ ] Testar criação de intents default (`/api/intent/default`)
- [ ] Testar criação de intents para tenant (`/api/intent/tenant`)
- [ ] Testar listagem de intents por tenant
- [ ] Testar vínculo e exclusão de intents

---

## 📞 Suporte

Em caso de dúvidas ou problemas durante a migração, entre em contato com a equipe de backend.

**Última atualização**: 2024-12-19

