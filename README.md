# EnergiaSub — Energia por Assinatura

Plataforma para gestão de energia por assinatura: simulação de economia, propostas comerciais, contratos e captura de leads via link público.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (Auth, PostgreSQL, RLS)
- TanStack React Query
- Vitest

## Configuração

1. Copie `.env.example` para `.env` e preencha:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-anon
```

2. Aplique as migrations no Supabase (SQL Editor ou CLI):

```bash
supabase db push
```

3. Crie um usuário admin no Supabase Auth (Authentication → Users → Add user).

4. Instale e rode:

```bash
npm install
npm run dev
```

## Rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/simular` | Público | Simulação e captura de leads |
| `/login` | Público | Login do painel |
| `/dashboard` | Autenticado | Visão geral |
| `/clientes` | Autenticado | CRM de clientes |
| `/simulador` | Autenticado | Simulador interno |
| `/propostas` | Autenticado | Propostas comerciais |
| `/contratos` | Autenticado | Contratos |
| `/leads` | Autenticado | Leads do link público |
| `/relatorios` | Autenticado | Métricas |
| `/configuracoes` | Autenticado | Taxas padrão e comissão |

## Segurança (RLS)

- **Leads**: INSERT público (anon); SELECT/UPDATE apenas autenticados
- **Demais tabelas**: CRUD apenas do usuário autenticado (`user_id = auth.uid()`)
- **Config pública**: leitura anônima (taxas do simulador público)

## Scripts

```bash
npm run dev       # desenvolvimento
npm run build     # build produção
npm run test      # testes unitários
npm run lint      # ESLint
```

## Fluxo de negócio

1. Lead preenche `/simular` e aceita proposta → salvo em `leads_simulacao`
2. Admin converte lead em cliente na tela Leads
3. Simulador gera proposta → contrato → acompanhamento no dashboard
