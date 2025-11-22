# Criação de Interface React para Intent Manager - Gerenciamento de Intenções

## Contexto

Preciso criar uma interface completa em React (TypeScript) para gerenciar intenções do Intent Manager. Esta é uma aplicação frontend nova que precisa ser criada do zero para interagir com a API REST do microserviço de intenções.

## API Base URL

A API está rodando em: `http://localhost:3001/api` (ou configurável via variável de ambiente `VITE_API_URL` ou `REACT_APP_API_URL`)

## Estrutura de Resposta Padrão da API

Todas as respostas seguem este formato:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}
```

## Endpoints Disponíveis

### 1. Criar Intenção

**POST `/api/intent`**

Cria uma nova intenção.

**Body:**
```typescript
{
  clientId: string;        // Obrigatório
  label: string;           // Obrigatório - Deve ser único por clientId
  description: string;      // Obrigatório (pode ser string vazia)
  status: 'ACTIVE' | 'SUGGESTED';  // Obrigatório - Apenas ACTIVE ou SUGGESTED na criação
}
```

**Resposta (201):**
```typescript
{
  success: true,
  data: {
    id: string;
    clientId: string;
    label: string;
    description: string;
    status: 'ACTIVE' | 'SUGGESTED';
    createdAt: string;  // ISO 8601
  }
}
```

**Erros possíveis:**
- `400`: Campos obrigatórios faltando ou status inválido
- `409`: Intenção com mesmo label já existe para o clientId

### 2. Buscar Intenção por ID

**GET `/api/intent/:id`**

Busca uma intenção específica pelo ID.

**Resposta (200):**
```typescript
{
  success: true,
  data: {
    id: string;
    clientId: string;
    label: string;
    description: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUGGESTED';
    createdAt: string;
    updatedAt: string;
  }
}
```

**Erros possíveis:**
- `404`: Intenção não encontrada

### 3. Atualizar Intenção

**PUT `/api/intent/:id`**

Atualiza uma intenção existente.

**Body (todos opcionais):**
```typescript
{
  label?: string;          // Deve ser único por clientId se alterado
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUGGESTED';  // Permite promover SUGGESTED para ACTIVE
}
```

**Resposta (200):**
```typescript
{
  success: true,
  data: {
    id: string;
    clientId: string;
    label: string;
    description: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUGGESTED';
    createdAt: string;
    updatedAt: string;
  }
}
```

**Erros possíveis:**
- `400`: Validação de campos
- `404`: Intenção não encontrada
- `409`: Label duplicado para o mesmo clientId

### 4. Excluir Intenção

**DELETE `/api/intent/:id`**

Exclui uma intenção (delete físico - remove do banco).

**Resposta (200):**
```typescript
{
  success: true,
  data: {
    message: "Intent deleted successfully"
  }
}
```

**Erros possíveis:**
- `404`: Intenção não encontrada

### 5. Listar Intenções por Cliente

**GET `/api/intent?clientId=xxx`**

Lista todas as intenções de um cliente específico.

**Query Parameters:**
- `clientId` (obrigatório): ID do cliente

**Resposta (200):**
```typescript
{
  success: true,
  data: {
    items: Array<{
      id: string;
      clientId: string;
      label: string;
      description: string;
      status: 'ACTIVE' | 'INACTIVE' | 'SUGGESTED';
      createdAt: string;
      updatedAt: string;
    }>;
    total: number;
  }
}
```

**Erros possíveis:**
- `400`: clientId não fornecido

### 6. Listar Todas as Intenções

**GET `/api/intent/all`**

Lista todas as intenções do sistema, independentemente do cliente.

**Resposta (200):**
```typescript
{
  success: true,
  data: {
    items: Array<{
      id: string;
      clientId: string;
      label: string;
      description: string;
      status: 'ACTIVE' | 'INACTIVE' | 'SUGGESTED';
      createdAt: string;
      updatedAt: string;
    }>;
    total: number;
  }
}
```

## Tipos TypeScript Necessários

```typescript
// Intent Types
interface Intent {
  id: string;
  clientId: string;
  label: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUGGESTED';
  createdAt: string;
  updatedAt: string;
}

// Request Types
interface CreateIntentRequest {
  clientId: string;
  label: string;
  description: string;
  status: 'ACTIVE' | 'SUGGESTED';  // Apenas estes dois na criação
}

interface UpdateIntentRequest {
  label?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUGGESTED';
}

// Response Types
interface IntentResponse {
  id: string;
  clientId: string;
  label: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUGGESTED';
  createdAt: string;
  updatedAt?: string;
}

interface ListIntentsResponse {
  items: IntentResponse[];
  total: number;
}

// API Response Wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}
```

## Funcionalidades Requeridas

### 1. Listagem de Intenções

**Funcionalidades:**
- Tabela/listagem mostrando todas as intenções
- Dois modos de visualização:
  - **Por Cliente**: Filtro por `clientId` usando query parameter
  - **Todas**: Listar todas as intenções do sistema usando `/api/intent/all`
- Colunas na tabela:
  - ID (pode ser truncado com tooltip)
  - Client ID
  - Label
  - Description (preview truncado)
  - Status (badge colorido: ACTIVE=verde, INACTIVE=cinza, SUGGESTED=amarelo)
  - Created At (formatado)
  - Updated At (formatado)
  - Actions (View/Edit/Delete)
- Filtros:
  - Toggle entre "Por Cliente" e "Todas"
  - Input para clientId quando no modo "Por Cliente"
  - Filtro por status (dropdown: All/ACTIVE/INACTIVE/SUGGESTED)
  - Busca por label ou description
- Ordenação:
  - Por data de criação (mais recente primeiro - padrão)
  - Por label (A-Z)
  - Por status
- Paginação (se necessário para grandes volumes)

### 2. Criação de Intenção

**Formulário com campos:**
- `clientId` (text input, obrigatório)
- `label` (text input, obrigatório)
  - Validação: não pode estar vazio
  - Aviso: deve ser único por clientId
- `description` (textarea, obrigatório mas pode ser vazio)
- `status` (radio buttons ou select, obrigatório)
  - Opções: ACTIVE ou SUGGESTED
  - Default: ACTIVE
  - Explicação: "INACTIVE não pode ser usado na criação"

**Validações:**
- Todos os campos obrigatórios preenchidos
- Label não vazio
- Status válido (ACTIVE ou SUGGESTED)
- Verificar conflito de label+clientId antes de submeter (opcional mas recomendado)

**Comportamento:**
- Loading state durante criação
- Mensagem de sucesso após criação
- Redirecionar para detalhes ou atualizar lista
- Tratamento de erro 409 (conflito) com mensagem clara

### 3. Edição de Intenção

**Formulário pré-preenchido:**
- Mesmos campos da criação, mas todos opcionais
- `status` agora permite ACTIVE, INACTIVE ou SUGGESTED
- Checkbox ou toggle para "Promover SUGGESTED para ACTIVE" (se status atual for SUGGESTED)

**Validações:**
- Se label for alterado, verificar unicidade
- Status válido

**Comportamento:**
- Mostrar dados atuais
- Permitir atualizar campos individualmente
- Loading state durante atualização
- Mensagem de sucesso
- Tratamento de erro 409 se label duplicado

### 4. Visualização de Detalhes

**Modal ou página de detalhes:**
- Mostrar todos os campos da intenção
- Histórico:
  - Created At (formatado)
  - Updated At (formatado)
- Status badge colorido
- Botões de ação:
  - Editar
  - Excluir
  - Voltar para lista

**Informações adicionais:**
- Mostrar se é possível promover SUGGESTED para ACTIVE
- Mostrar aviso se status for INACTIVE

### 5. Exclusão de Intenção

**Confirmação obrigatória:**
- Modal de confirmação antes de excluir
- Mostrar informações da intenção que será excluída
- Aviso: "Esta ação não pode ser desfeita" (delete físico)
- Botões: "Cancelar" e "Excluir"

**Comportamento:**
- Loading state durante exclusão
- Mensagem de sucesso
- Atualizar lista após exclusão
- Tratamento de erro 404

### 6. Filtros e Busca

**Filtros disponíveis:**
- **Modo de visualização**: Toggle "Por Cliente" / "Todas"
- **Client ID**: Input quando no modo "Por Cliente"
- **Status**: Dropdown (All, ACTIVE, INACTIVE, SUGGESTED)
- **Busca**: Input de texto para buscar em label ou description

**Comportamento:**
- Filtros aplicados em tempo real ou com botão "Aplicar"
- Mostrar contador de resultados filtrados
- Botão "Limpar filtros"

## Requisitos de UI/UX

### 1. Design Moderno e Responsivo
- Use um design system moderno (Material-UI, Ant Design, Chakra UI, Tailwind CSS, ou similar)
- Layout responsivo para mobile e desktop
- Cores e tipografia consistentes
- Tema claro/escuro (opcional mas desejável)

### 2. Feedback Visual
- Loading states em todas as operações assíncronas
- Skeleton loaders para listagem
- Mensagens de sucesso/erro claras
- Toasts/notifications para feedback de ações
- Confirmações visuais para ações destrutivas

### 3. Status Badges
- **ACTIVE**: Badge verde
- **INACTIVE**: Badge cinza
- **SUGGESTED**: Badge amarelo/laranja
- Ícones opcionais para cada status

### 4. Validação de Formulários
- Validação em tempo real
- Mensagens de erro claras e específicas
- Campos obrigatórios marcados com asterisco (*)
- Highlight de campos com erro

### 5. Tabela/Listagem
- Design limpo e organizado
- Hover states nas linhas
- Ações rápidas (ícones de ação)
- Paginação se necessário
- Ordenação clicável nas colunas

### 6. Modais
- Modais para criação/edição
- Modal de confirmação para exclusão
- Modal de detalhes
- Fechar com ESC ou clique fora
- Foco automático no primeiro campo

### 7. Gerenciamento de Estado
- Use Context API, Redux, Zustand, ou React Query para gerenciar estado
- Cache de intenções para evitar chamadas desnecessárias
- Estado de loading/error para cada operação
- Otimistic updates (opcional)

## Estrutura de Componentes Sugerida

```
src/
├── components/
│   ├── intents/
│   │   ├── IntentList.tsx          // Listagem principal
│   │   ├── IntentTable.tsx         // Tabela de intenções
│   │   ├── IntentForm.tsx          // Formulário de criação/edição
│   │   ├── IntentCard.tsx          // Card para visualização alternativa
│   │   ├── IntentDetail.tsx        // Modal/página de detalhes
│   │   ├── IntentFilters.tsx       // Componente de filtros
│   │   ├── IntentStatusBadge.tsx   // Badge de status
│   │   └── DeleteConfirmModal.tsx  // Modal de confirmação
│   ├── shared/
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── SuccessMessage.tsx
│   │   ├── EmptyState.tsx          // Estado vazio da lista
│   │   └── SearchInput.tsx
├── services/
│   ├── api.ts              // Configuração axios/fetch
│   └── intents.ts          // Funções de API para intenções
├── hooks/
│   ├── useIntents.ts       // Hook para listar intenções
│   ├── useIntent.ts        // Hook para buscar uma intenção
│   ├── useCreateIntent.ts  // Hook para criar
│   ├── useUpdateIntent.ts  // Hook para atualizar
│   └── useDeleteIntent.ts  // Hook para excluir
├── types/
│   └── intents.ts          // Todos os tipos TypeScript
├── utils/
│   ├── formatters.ts       // Formatação de datas, etc
│   └── validators.ts       // Validações de formulário
└── pages/
    ├── IntentsPage.tsx     // Página principal
    └── IntentDetailPage.tsx // Página de detalhes (opcional)
```

## Validações Importantes

### Criação
1. **clientId**: Não pode estar vazio
2. **label**: Não pode estar vazio, deve ser único por clientId
3. **description**: Obrigatório mas pode ser string vazia
4. **status**: Deve ser 'ACTIVE' ou 'SUGGESTED' (não permite 'INACTIVE')

### Atualização
1. **label**: Se fornecido, não pode estar vazio e deve ser único por clientId
2. **description**: Se fornecido, pode ser string vazia
3. **status**: Deve ser 'ACTIVE', 'INACTIVE' ou 'SUGGESTED'

### Listagem
1. **clientId**: Obrigatório quando usando modo "Por Cliente"
2. Validação de filtros antes de fazer requisição

## Tratamento de Erros

### Códigos de Erro Comuns

- **400 Bad Request**: Validação de campos
  - Exibir mensagem de erro específica
  - Destacar campos com erro no formulário

- **404 Not Found**: Intenção não encontrada
  - Mensagem: "Intenção não encontrada"
  - Botão para voltar à lista

- **409 Conflict**: Label duplicado
  - Mensagem: "Uma intenção com este label já existe para este cliente"
  - Sugerir alterar o label

- **500 Internal Server Error**: Erro do servidor
  - Mensagem genérica de erro
  - Opção de tentar novamente

### Mensagens de Erro Amigáveis

```typescript
const getErrorMessage = (error: ApiResponse['error']): string => {
  if (!error) return 'Ocorreu um erro desconhecido';
  
  switch (error.code) {
    case 'BAD_REQUEST':
      return error.message || 'Dados inválidos. Verifique os campos preenchidos.';
    case 'NOT_FOUND':
      return 'Intenção não encontrada.';
    case 'CONFLICT':
      return error.message || 'Já existe uma intenção com este label para este cliente.';
    case 'INTERNAL_ERROR':
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    default:
      return error.message || 'Ocorreu um erro ao processar sua solicitação.';
  }
};
```

## Regras de Negócio Importantes

1. **Unicidade**: Label deve ser único por clientId
   - Validar antes de submeter formulário (opcional)
   - Tratar erro 409 se ocorrer

2. **Status na Criação**: Apenas ACTIVE ou SUGGESTED
   - Não permitir selecionar INACTIVE no formulário de criação
   - Explicar ao usuário: "Intenções inativas devem ser criadas como ACTIVE e depois alteradas"

3. **Promoção de SUGGESTED**: Pode ser promovida para ACTIVE via update
   - Mostrar opção clara quando status for SUGGESTED
   - Botão "Aprovar" ou "Promover para ACTIVE"

4. **Delete Físico**: Exclusão remove permanentemente
   - Aviso claro na confirmação
   - Não há como recuperar após exclusão

5. **Filtros**: 
   - Modo "Por Cliente" requer clientId
   - Modo "Todas" lista tudo sem filtro de cliente

## Funcionalidades Extras (Opcionais mas Desejáveis)

1. **Export/Import**: Exportar intenções como JSON e importar
2. **Duplicar Intenção**: Criar cópia de intenção existente
3. **Bulk Actions**: Selecionar múltiplas intenções para ações em massa (ativar/desativar/excluir)
4. **Histórico de Alterações**: Mostrar quando foi criada/atualizada
5. **Busca Avançada**: Buscar por múltiplos critérios simultaneamente
6. **Filtros Salvos**: Salvar combinações de filtros favoritas
7. **Estatísticas**: Dashboard com contadores por status
8. **Validação em Tempo Real**: Verificar disponibilidade de label enquanto digita

## Exemplos de Uso

### Criar Intenção
```typescript
const createIntent = async (data: CreateIntentRequest) => {
  const response = await fetch('/api/intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const result: ApiResponse<IntentResponse> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Erro ao criar intenção');
  }
  
  return result.data;
};
```

### Listar por Cliente
```typescript
const listIntentsByClient = async (clientId: string) => {
  const response = await fetch(`/api/intent?clientId=${encodeURIComponent(clientId)}`);
  const result: ApiResponse<ListIntentsResponse> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Erro ao listar intenções');
  }
  
  return result.data;
};
```

### Listar Todas
```typescript
const listAllIntents = async () => {
  const response = await fetch('/api/intent/all');
  const result: ApiResponse<ListIntentsResponse> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Erro ao listar intenções');
  }
  
  return result.data;
};
```

### Atualizar Intenção
```typescript
const updateIntent = async (id: string, data: UpdateIntentRequest) => {
  const response = await fetch(`/api/intent/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const result: ApiResponse<IntentResponse> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Erro ao atualizar intenção');
  }
  
  return result.data;
};
```

### Excluir Intenção
```typescript
const deleteIntent = async (id: string) => {
  const response = await fetch(`/api/intent/${id}`, {
    method: 'DELETE'
  });
  
  const result: ApiResponse<{ message: string }> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Erro ao excluir intenção');
  }
  
  return result.data;
};
```

## Observações Importantes

1. **API Response Format**: Todas as respostas seguem o formato `ApiResponse<T>` com `success`, `data`, `error` e `meta`
2. **Status Codes**: A API retorna códigos HTTP apropriados (200, 201, 400, 404, 409, 500)
3. **Timestamps**: Todas as datas vêm em formato ISO 8601 e devem ser formatadas para exibição
4. **Validação**: A validação é feita tanto no frontend quanto no backend
5. **Error Handling**: Sempre verificar `success` antes de acessar `data`
6. **Loading States**: Sempre mostrar loading durante requisições assíncronas
7. **Optimistic Updates**: Considerar atualização otimista para melhor UX (opcional)

## Checklist de Implementação

- [ ] Configurar projeto React com TypeScript
- [ ] Configurar roteamento (React Router)
- [ ] Configurar biblioteca de UI (Material-UI, Ant Design, etc)
- [ ] Criar tipos TypeScript baseados na API
- [ ] Criar serviço de API (axios/fetch wrapper)
- [ ] Criar hooks customizados para operações CRUD
- [ ] Implementar página de listagem com filtros
- [ ] Implementar formulário de criação
- [ ] Implementar formulário de edição
- [ ] Implementar modal de detalhes
- [ ] Implementar modal de confirmação de exclusão
- [ ] Implementar tratamento de erros
- [ ] Implementar loading states
- [ ] Implementar validações de formulário
- [ ] Implementar badges de status
- [ ] Adicionar formatação de datas
- [ ] Testar todos os fluxos (criar, editar, excluir, listar)
- [ ] Adicionar responsividade mobile
- [ ] Adicionar testes (opcional mas recomendado)

---

Por favor, crie uma interface completa, moderna e funcional seguindo estes requisitos. Use TypeScript, componentes reutilizáveis, hooks customizados, e siga as melhores práticas do React. A interface deve ser intuitiva, responsiva e fornecer feedback claro ao usuário em todas as operações.

