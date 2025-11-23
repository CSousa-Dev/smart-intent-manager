# Atualização de Contratos - Múltiplos Tenants e Atualização de Vínculos

## 📋 Resumo das Mudanças

Este documento descreve as mudanças recentes na API do Intent Manager relacionadas ao suporte a múltiplos tenants na criação e atualização de intents.

---

## 🔄 Mudanças Principais

### 1. Criação de Intent para Tenant - Agora Aceita Array
- **Antes**: `tenantId: string` (único tenant)
- **Agora**: `tenantIds: string[]` (múltiplos tenants)
- **Comportamento**: Remove duplicatas automaticamente e valida existência de todos os tenants

### 2. Atualização de Intent - Novo Campo Opcional
- **Novo campo**: `tenantIds?: string[]` no endpoint de atualização
- **Comportamento**: Compara lista atual com nova lista e atualiza vínculos automaticamente

### 3. Respostas de Intent - Campo tenantIds Sempre Presente
- **Novo campo**: `tenantIds: string[]` em todas as respostas
- **Intents default**: Retorna array vazio `[]`
- **Intents não-default**: Retorna array com IDs dos tenants vinculados

---

## 📡 Endpoints Atualizados

### 1. Criar Intent para Tenant

#### Antes
```http
POST /api/intent/tenant
Content-Type: application/json

{
  "tenantId": "tenant-001",
  "label": "appointment",
  "description": "Agendamento",
  "status": "ACTIVE"
}
```

#### Depois
```http
POST /api/intent/tenant
Content-Type: application/json

{
  "tenantIds": ["tenant-001", "tenant-002", "tenant-003"],
  "label": "appointment",
  "description": "Agendamento",
  "status": "ACTIVE",
  "synonyms": ["marcar", "agendar"],
  "examplePhrases": ["Quero marcar um horário"]
}
```

**Mudanças**:
- `tenantId` → `tenantIds` (agora é um array)
- Array pode conter múltiplos tenantIds
- Duplicatas são removidas automaticamente
- Todos os tenants devem existir (validação)

---

### 2. Atualizar Intent - Novo Campo tenantIds

#### Antes
```http
PUT /api/intent/:id
Content-Type: application/json

{
  "label": "updated-label",
  "description": "Nova descrição",
  "status": "ACTIVE"
}
```

#### Depois
```http
PUT /api/intent/:id
Content-Type: application/json

{
  "label": "updated-label",
  "description": "Nova descrição",
  "status": "ACTIVE",
  "tenantIds": ["tenant-001", "tenant-003"]  // ⬅️ NOVO CAMPO OPCIONAL
}
```

**Comportamento do campo `tenantIds`**:
- **Opcional**: Se não fornecido, não altera os vínculos existentes
- **Comparação inteligente**: Compara lista atual com nova lista
- **Atualização automática**:
  - Remove vínculos com tenants que não estão mais na lista
  - Adiciona vínculos com novos tenants
  - Se a lista for igual, não faz alterações

**Exemplos de uso**:

1. **Adicionar novos tenants** (mantendo os existentes):
```json
PUT /api/intent/intent-123
{
  "tenantIds": ["tenant-001", "tenant-002", "tenant-003"]  // Adiciona tenant-003
}
```

2. **Remover tenants**:
```json
PUT /api/intent/intent-123
{
  "tenantIds": ["tenant-001"]  // Remove tenant-002 e tenant-003
}
```

3. **Substituir completamente**:
```json
PUT /api/intent/intent-123
{
  "tenantIds": ["tenant-004", "tenant-005"]  // Remove todos os anteriores, adiciona novos
}
```

4. **Não alterar vínculos** (atualizar apenas outros campos):
```json
PUT /api/intent/intent-123
{
  "label": "new-label",
  "description": "New description"
  // tenantIds não fornecido = não altera vínculos
}
```

---

## 📦 Estrutura de Dados Atualizada

### Request DTOs

#### Criar Intent para Tenant
```typescript
interface CreateTenantIntentRequest {
  tenantIds: string[];  // ⬅️ Mudou de tenantId: string para tenantIds: string[]
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
  tenantIds?: string[];  // ⬅️ NOVO CAMPO OPCIONAL
}
```

### Response DTOs

#### Intent Response
```typescript
interface IntentResponse {
  id: string;
  label: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "SUGGESTED";
  synonyms: string[];
  examplePhrases: string[];
  isDefault: boolean;
  tenantIds: string[];  // ⬅️ SEMPRE PRESENTE (array vazio para intents default)
  createdAt: string;
  updatedAt?: string;
}
```

---

## 🔍 Exemplos de Respostas

### Intent Default (tenantIds vazio)
```json
{
  "success": true,
  "data": {
    "id": "intent-default-123",
    "label": "greeting",
    "description": "Saudação inicial",
    "status": "ACTIVE",
    "synonyms": ["olá", "oi"],
    "examplePhrases": ["Olá, como posso ajudar?"],
    "isDefault": true,
    "tenantIds": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Intent Não-Default (um tenant)
```json
{
  "success": true,
  "data": {
    "id": "intent-tenant-456",
    "label": "appointment",
    "description": "Agendamento",
    "status": "ACTIVE",
    "synonyms": ["marcar", "agendar"],
    "examplePhrases": ["Quero marcar um horário"],
    "isDefault": false,
    "tenantIds": ["tenant-001"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Intent Não-Default (múltiplos tenants)
```json
{
  "success": true,
  "data": {
    "id": "intent-shared-789",
    "label": "support",
    "description": "Suporte",
    "status": "ACTIVE",
    "synonyms": ["ajuda", "suporte"],
    "examplePhrases": ["Preciso de ajuda"],
    "isDefault": false,
    "tenantIds": ["tenant-001", "tenant-002", "tenant-003"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🔄 Lógica de Atualização de Tenants

### Como Funciona

Quando você atualiza uma intent fornecendo `tenantIds`, o sistema:

1. **Busca tenantIds atuais** vinculados à intent
2. **Compara** a lista atual com a nova lista
3. **Se forem iguais**: Não faz alterações
4. **Se forem diferentes**:
   - **Remove** vínculos com tenants que não estão mais na nova lista
   - **Adiciona** vínculos com tenants novos
   - **Valida** que todos os novos tenants existem (apenas para intents não-default)

### Exemplo Prático

**Estado atual**: Intent vinculada a `["tenant-001", "tenant-002"]`

**Requisição**:
```json
PUT /api/intent/intent-123
{
  "tenantIds": ["tenant-002", "tenant-003"]
}
```

**Resultado**:
- ✅ Mantém: `tenant-002` (estava na lista atual e está na nova)
- ❌ Remove: `tenant-001` (estava na lista atual mas não está na nova)
- ➕ Adiciona: `tenant-003` (não estava na lista atual mas está na nova)

**Estado final**: Intent vinculada a `["tenant-002", "tenant-003"]`

---

## ⚠️ Validações e Regras

### Validações de Entrada

#### Criar Intent (`POST /api/intent/tenant`)
- ✅ `tenantIds` é obrigatório e deve ser um array não-vazio
- ✅ Cada `tenantId` no array deve ser uma string não-vazia
- ✅ Todos os tenants devem existir (validação via API de tenant)
- ✅ Duplicatas são removidas automaticamente

#### Atualizar Intent (`PUT /api/intent/:id`)
- ✅ `tenantIds` é opcional
- ✅ Se fornecido, deve ser um array
- ✅ Cada `tenantId` no array deve ser uma string não-vazia
- ✅ Para intents não-default, todos os novos tenants devem existir
- ✅ Para intents default, não valida existência de tenants

### Regras de Negócio

1. **Intents Default**: Não podem ter vínculos diretos com tenants (sempre `tenantIds: []`)
2. **Intents Não-Default**: Devem estar vinculadas a pelo menos um tenant
3. **Validação de Existência**: Todos os tenants fornecidos devem existir antes de criar/atualizar
4. **Duplicatas**: São removidas automaticamente (não causa erro)

---

## 💻 Ações Necessárias no Frontend

### 1. Atualizar Interface TypeScript

```typescript
// Criar Intent para Tenant
interface CreateTenantIntentRequest {
  tenantIds: string[];  // ⬅️ Mudou de tenantId para tenantIds (array)
  label: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "SUGGESTED";
  synonyms?: string[];
  examplePhrases?: string[];
}

// Atualizar Intent
interface UpdateIntentRequest {
  label?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUGGESTED";
  synonyms?: string[];
  examplePhrases?: string[];
  tenantIds?: string[];  // ⬅️ NOVO CAMPO OPCIONAL
}

// Response
interface IntentResponse {
  id: string;
  label: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "SUGGESTED";
  synonyms: string[];
  examplePhrases: string[];
  isDefault: boolean;
  tenantIds: string[];  // ⬅️ SEMPRE PRESENTE
  createdAt: string;
  updatedAt?: string;
}
```

### 2. Atualizar Formulários de Criação

```typescript
// Exemplo: Formulário de criação com múltiplos tenants
const CreateIntentForm = () => {
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);

  const handleSubmit = async (data: CreateTenantIntentRequest) => {
    await createIntent({
      ...data,
      tenantIds: selectedTenantIds,  // Array de IDs selecionados
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Multi-select de tenants */}
      <MultiSelect
        options={tenants}
        selected={selectedTenantIds}
        onChange={setSelectedTenantIds}
        placeholder="Selecione um ou mais tenants"
      />
      {/* Outros campos... */}
    </form>
  );
};
```

### 3. Atualizar Formulários de Edição

```typescript
// Exemplo: Formulário de edição com atualização de tenants
const EditIntentForm = ({ intent }: { intent: IntentResponse }) => {
  const [tenantIds, setTenantIds] = useState<string[]>(intent.tenantIds);

  const handleSubmit = async (data: UpdateIntentRequest) => {
    await updateIntent(intent.id, {
      ...data,
      tenantIds: tenantIds,  // Opcional: atualiza vínculos
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Multi-select de tenants */}
      <MultiSelect
        options={tenants}
        selected={tenantIds}
        onChange={setTenantIds}
        placeholder="Selecione tenants vinculados"
      />
      {/* Outros campos... */}
    </form>
  );
};
```

### 4. Atualizar Validações (Zod)

```typescript
import { z } from 'zod';

const CreateTenantIntentSchema = z.object({
  tenantIds: z.array(z.string().min(1)).min(1, 'Pelo menos um tenant é obrigatório'),
  label: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUGGESTED"]),
  synonyms: z.array(z.string()).optional(),
  examplePhrases: z.array(z.string()).optional(),
});

const UpdateIntentSchema = z.object({
  label: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUGGESTED"]).optional(),
  synonyms: z.array(z.string()).optional(),
  examplePhrases: z.array(z.string()).optional(),
  tenantIds: z.array(z.string().min(1)).optional(),  // ⬅️ OPCIONAL
});
```

### 5. Atualizar Componentes de Exibição

```typescript
// Exemplo: Exibir lista de tenants vinculados
const IntentCard = ({ intent }: { intent: IntentResponse }) => {
  return (
    <div>
      <h3>{intent.label}</h3>
      <p>{intent.description}</p>
      
      {/* Mostrar tenants vinculados */}
      {intent.tenantIds.length > 0 && (
        <div>
          <strong>Tenants vinculados:</strong>
          <ul>
            {intent.tenantIds.map(tenantId => (
              <li key={tenantId}>{tenantId}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Mostrar se é default */}
      {intent.isDefault && (
        <span>Intent Default (compartilhada globalmente)</span>
      )}
    </div>
  );
};
```

---

## 🔄 Exemplos de Migração

### Migração: Criar Intent

#### Antes
```typescript
// Criar intent para um tenant
const response = await fetch('/api/intent/tenant', {
  method: 'POST',
  body: JSON.stringify({
    tenantId: 'tenant-001',  // ⬅️ String única
    label: 'greeting',
    status: 'ACTIVE',
  }),
});
```

#### Depois
```typescript
// Criar intent para múltiplos tenants
const response = await fetch('/api/intent/tenant', {
  method: 'POST',
  body: JSON.stringify({
    tenantIds: ['tenant-001', 'tenant-002'],  // ⬅️ Array de strings
    label: 'greeting',
    status: 'ACTIVE',
  }),
});
```

### Migração: Atualizar Intent

#### Antes
```typescript
// Atualizar apenas campos da intent
const response = await fetch(`/api/intent/${intentId}`, {
  method: 'PUT',
  body: JSON.stringify({
    label: 'new-label',
    description: 'New description',
    // Não havia como atualizar tenants
  }),
});
```

#### Depois
```typescript
// Atualizar campos e vínculos com tenants
const response = await fetch(`/api/intent/${intentId}`, {
  method: 'PUT',
  body: JSON.stringify({
    label: 'new-label',
    description: 'New description',
    tenantIds: ['tenant-001', 'tenant-003'],  // ⬅️ NOVO: Atualiza vínculos
  }),
});
```

---

## ⚠️ Breaking Changes

⚠️ **ATENÇÃO**: Esta é uma mudança **BREAKING** para o endpoint de criação:

### Endpoint de Criação (`POST /api/intent/tenant`)
- ❌ **Removido**: `tenantId: string`
- ✅ **Adicionado**: `tenantIds: string[]` (obrigatório)
- **Ação necessária**: Atualizar todas as chamadas de criação para usar array

### Endpoint de Atualização (`PUT /api/intent/:id`)
- ✅ **Adicionado**: `tenantIds?: string[]` (opcional)
- **Não-breaking**: Se não fornecido, comportamento permanece igual

### Respostas
- ✅ **Adicionado**: `tenantIds: string[]` (sempre presente)
- **Não-breaking**: Campo novo, não afeta código existente (mas deve ser tratado)

---

## 📝 Checklist de Migração

### Endpoint de Criação
- [ ] Substituir `tenantId: string` por `tenantIds: string[]` em todas as chamadas
- [ ] Atualizar formulários para permitir seleção múltipla de tenants
- [ ] Atualizar validações para aceitar array
- [ ] Atualizar interfaces TypeScript
- [ ] Testar criação com múltiplos tenants

### Endpoint de Atualização
- [ ] Adicionar campo opcional `tenantIds` nas interfaces
- [ ] Implementar UI para seleção múltipla de tenants na edição
- [ ] Testar atualização de vínculos (adicionar/remover tenants)
- [ ] Testar atualização sem alterar vínculos (não fornecer tenantIds)

### Respostas
- [ ] Atualizar interfaces para incluir `tenantIds: string[]`
- [ ] Atualizar componentes que exibem informações de intent
- [ ] Atualizar validações de schema (Zod/Yup)
- [ ] Testar exibição de lista de tenants vinculados

### Testes
- [ ] Atualizar testes unitários
- [ ] Atualizar testes de integração
- [ ] Testar criação com múltiplos tenants
- [ ] Testar atualização de vínculos
- [ ] Testar remoção de tenants
- [ ] Testar adição de tenants

---

## 🔗 Informações Adicionais

### Comportamento de Duplicatas
- Duplicatas no array `tenantIds` são removidas automaticamente
- Exemplo: `["tenant-001", "tenant-001", "tenant-002"]` → `["tenant-001", "tenant-002"]`

### Validação de Tenants
- Todos os tenants fornecidos devem existir antes de criar/atualizar
- Se algum tenant não existir, retorna erro 404
- Para intents default, não valida existência de tenants (mas não vincula)

### Performance
- A atualização de vínculos é feita de forma eficiente:
  - Compara listas antes de fazer alterações
  - Só executa operações necessárias (add/remove)
  - Se a lista for igual, não faz nenhuma operação

---

**Data da atualização**: 2024-12-19  
**Versão da API**: Sem versionamento (sem v1)

