# Reestruturação do Dashboard - 13/02/2026

## Resumo
O site foi completamente reestruturado para funcionar como um dashboard em tempo real de atendimentos finalizados, conectado a um banco de dados MySQL.

---

## O que foi modificado

### 1. Backend - Banco de Dados (PostgreSQL → MySQL)

**Arquivo:** `server/db.ts`
- Removido: Drizzle ORM + PostgreSQL (`pg`)
- Adicionado: `mysql2/promise` com pool de conexões
- Credenciais lidas do arquivo `.env`

**Variáveis de ambiente (.env):**
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco
DB_TABLE=base_senai
```

### 2. Backend - Novas Rotas API

**Arquivo:** `server/routes.ts`

Removido:
- Rotas de theme rules (CRUD)
- Rota de classificação AI (OpenAI)

Adicionado 3 novos endpoints:
- `GET /api/stats` — Métricas agregadas (totais hoje/semana/mês, duração média, por canal, por casa, por resumo, timeline)
- `GET /api/recentes` — Últimos 50 atendimentos finalizados
- `GET /api/protocolo/:protocolo` — Busca por número de protocolo

### 3. Frontend - Rotas Simplificadas

**Arquivo:** `client/src/App.tsx`

Removido:
- Rotas: `/import`, `/overview`, `/time-analysis`, `/themes`, `/details`
- `ProtectedRoute` e `DashboardProvider`

Adicionado:
- Rota `/` → Visão Geral (Dashboard)
- Rota `/protocolo` → Pesquisar Protocolo

### 4. Frontend - Sidebar Atualizado

**Arquivo:** `client/src/components/layout/Sidebar.tsx`

Removido:
- 5 itens de navegação antigos
- Branding "InsightFlow"

Adicionado:
- 2 itens: "Visão Geral" e "Pesquisar Protocolo"
- Branding "Polo BI - Polo Telecom"
- Indicador de "Dados em tempo real"
- Tema escuro com cor vermelha

### 5. Frontend - Dashboard Visão Geral

**Arquivo:** `client/src/pages/Overview.tsx`

Página completamente reescrita com:
- 4 cards de métricas (hoje, semana, mês, duração média)
- Gráfico de linha: volume de atendimentos nos últimos 30 dias
- Gráfico de barras: atendimentos por canal
- Gráfico de barras: atendimentos por casa
- Gráfico de barras: top assuntos (resumo da conversa)
- Tabela com os últimos 50 atendimentos finalizados
- Polling automático a cada 60 segundos
- Indicador de última atualização e countdown para próximo refresh
- Botão de atualizar manualmente

### 6. Frontend - Pesquisar Protocolo

**Arquivo:** `client/src/pages/SearchProtocol.tsx` (novo)

- Campo de busca para número de protocolo
- Card detalhado com todas as informações do atendimento
- Mensagem de erro quando protocolo não encontrado
- Estado vazio com instrução visual

### 7. Tema Visual

**Arquivo:** `client/src/index.css`
- Dark mode padrão (fundo escuro #0f0f1a)
- Cor primária vermelha (similar ao logo Polo BI)
- Tipografia: Inter (corpo) + Outfit (títulos)

### 8. Arquivos Removidos

- `client/src/pages/Import.tsx`
- `client/src/pages/TimeAnalysis.tsx`
- `client/src/pages/Themes.tsx`
- `client/src/pages/Details.tsx`
- `client/src/store/dashboard-context.tsx`
- `client/src/lib/data-processor.ts`
- `client/src/components/layout/FilterBar.tsx`
- `client/src/hooks/use-theme-rules.ts`
- `client/src/hooks/use-mobile.tsx`
- `server/storage.ts`
- `server/replit_integrations/` (pasta inteira)
- `client/replit_integrations/` (pasta inteira)
- `shared/` (pasta inteira: schema.ts, routes.ts, models/)
- `drizzle.config.ts`
- `components.json`
- `attached_assets/`

### 9. Dependências Alteradas

**Removidas:**
- `drizzle-orm`, `drizzle-zod`, `drizzle-kit`, `pg`, `connect-pg-simple`
- `openai`, `passport`, `passport-local`
- `papaparse`, `@types/papaparse`, `@types/luxon`, `luxon`
- `@replit/*` (plugins Vite)
- Diversos componentes Radix UI não utilizados
- `framer-motion`, `react-hook-form`, `zod`, etc.

**Adicionadas:**
- `mysql2` — Driver MySQL
- `dotenv` — Leitura de variáveis de ambiente

### 10. Configurações

- `.env` adicionado ao `.gitignore`
- `.env.example` criado como template
- `vite.config.ts` simplificado (sem plugins Replit)
- `tsconfig.json` simplificado
- `package.json` limpo com dependências mínimas

---

## Tabela MySQL Esperada

A tabela `base_senai` deve conter as seguintes colunas:

| Coluna | Tipo |
|---|---|
| `id` | INT (PK) |
| `contato` | VARCHAR |
| `identificador` | VARCHAR |
| `protocolo` | VARCHAR |
| `canal` | VARCHAR |
| `data e hora de inicio` | DATETIME |
| `data e hora de fim` | DATETIME |
| `tipo de canal` | VARCHAR |
| `resumo da conversa` | VARCHAR/TEXT |
| `casa` | VARCHAR |

---

## Como Rodar

1. Copie `.env.example` para `.env` e preencha as credenciais do MySQL
2. `npm install`
3. `npm run dev`
4. Acesse `http://localhost:5000`


