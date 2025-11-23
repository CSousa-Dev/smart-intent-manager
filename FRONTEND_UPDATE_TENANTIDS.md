# Atualização de Contratos - TenantIds nas Respostas de Intent

## 📋 Resumo da Mudança

As respostas de Intent agora incluem o campo `tenantIds` (array de strings) contendo todos os IDs dos tenants vinculados à intent.

---

## 🔄 Mudança no Contrato de Resposta

### Antes
```typescript
interface IntentResponse {
  id: string;
  label: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "SUGGESTED";
  synonyms: string[];
  examplePhrases: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}
```

### Depois
```typescript
interface IntentResponse {
  id: string;
  label: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "SUGGESTED";
  synonyms: string[];
  examplePhrases: string[];
  isDefault: boolean;
  tenantIds: string[];  // ⬅️ NOVO CAMPO
  createdAt: string;
  updatedAt?: string;
}
```

---

## 📦 Comportamento do Campo `tenantIds`

### Intents Default
- **Valor**: Array vazio `[]`
- **Motivo**: Intents default não estão vinculadas diretamente a tenants específicos (são compartilhadas globalmente)

### Intents Não-Default
- **Valor**: Array com os IDs dos tenants vinculados
- **Exemplo**: `["tenant-001", "tenant-002"]`
- **Motivo**: Intents não-default podem estar vinculadas a múltiplos tenants

---

## 📡 Exemplos de Respostas

### Intent Default
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

### Intent Não-Default (Vinculada a um Tenant)
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
    "tenantIds": ["b601b100-cd4b-4703-ab4a-dce2d35fea1e"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Intent Não-Default (Vinculada a Múltiplos Tenants)
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

## 🔍 Endpoints Afetados

Todos os endpoints que retornam `IntentResponse` foram atualizados:

1. ✅ `POST /api/intent/default` - Criar intent default
2. ✅ `POST /api/intent/tenant` - Criar intent para tenant
3. ✅ `GET /api/intent/:id` - Buscar intent por ID
4. ✅ `PUT /api/intent/:id` - Atualizar intent
5. ✅ `GET /api/intent?tenantId=X` - Listar intents de um tenant
6. ✅ `GET /api/intent/all` - Listar todas as intents
7. ✅ `GET /api/intent/default` - Listar intents default

---

## 💻 Ações Necessárias no Frontend

### 1. Atualizar Interface TypeScript

```typescript
// Atualizar a interface IntentResponse
interface IntentResponse {
  id: string;
  label: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "SUGGESTED";
  synonyms: string[];
  examplePhrases: string[];
  isDefault: boolean;
  tenantIds: string[];  // ⬅️ ADICIONAR ESTE CAMPO
  createdAt: string;
  updatedAt?: string;
}
```

### 2. Atualizar Componentes que Usam Intent

Se você tem componentes que exibem informações de intent, pode querer mostrar os tenantIds:

```typescript
// Exemplo de uso
const IntentCard = ({ intent }: { intent: IntentResponse }) => {
  return (
    <div>
      <h3>{intent.label}</h3>
      <p>{intent.description}</p>
      
      {/* Mostrar tenantIds se não for default */}
      {!intent.isDefault && intent.tenantIds.length > 0 && (
        <div>
          <strong>Vinculado a:</strong>
          <ul>
            {intent.tenantIds.map(tenantId => (
              <li key={tenantId}>{tenantId}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Mostrar se é default */}
      {intent.isDefault && (
        <span>Intent Default (compartilhada)</span>
      )}
    </div>
  );
};
```

### 3. Validação de Dados

Se você tem validações de schema (Zod, Yup, etc.), atualize:

```typescript
// Exemplo com Zod
import { z } from 'zod';

const IntentResponseSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUGGESTED"]),
  synonyms: z.array(z.string()),
  examplePhrases: z.array(z.string()),
  isDefault: z.boolean(),
  tenantIds: z.array(z.string()),  // ⬅️ ADICIONAR
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
```

### 4. Filtros e Buscas

Se você filtra intents por tenant, pode usar o campo `tenantIds`:

```typescript
// Filtrar intents vinculadas a um tenant específico
const filterIntentsByTenant = (intents: IntentResponse[], tenantId: string) => {
  return intents.filter(intent => 
    intent.tenantIds.includes(tenantId) || intent.isDefault
  );
};
```

---

## ⚠️ Breaking Changes

⚠️ **ATENÇÃO**: Esta é uma mudança **não-breaking** se você estiver usando TypeScript com tipos opcionais ou validação flexível. No entanto:

- Se você tem código que assume que `tenantIds` não existe, pode precisar de ajustes
- Se você tem validações rígidas de schema, precisa atualizá-las
- Se você tem testes que verificam a estrutura exata da resposta, precisam ser atualizados

---

## 📝 Checklist de Migração

- [ ] Atualizar interface `IntentResponse` para incluir `tenantIds: string[]`
- [ ] Atualizar schemas de validação (Zod, Yup, etc.) se aplicável
- [ ] Atualizar componentes que exibem informações de intent
- [ ] Atualizar testes que verificam a estrutura de resposta
- [ ] Verificar filtros e buscas que podem usar `tenantIds`
- [ ] Atualizar documentação interna do frontend

---

## 🔗 Informações Adicionais

- **Tipo**: Array de strings (`string[]`)
- **Sempre presente**: Sim (nunca será `undefined` ou `null`)
- **Valor mínimo**: Array vazio `[]` (para intents default)
- **Valor máximo**: Sem limite (intents podem estar vinculadas a quantos tenants forem necessários)

---

**Data da atualização**: 2024-12-19  
**Versão da API**: Sem versionamento (sem v1)

