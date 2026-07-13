## Sistema de Dois Níveis de Acesso (Admin e Cliente)

Vou implementar autenticação com dois papéis (`admin` e `cliente`), área do cliente com menu próprio, cadastro público, e proteção real via RLS no backend.

---

### 1. Backend (Lovable Cloud / migração SQL)

**Enum `app_role`**: adicionar valor `cliente` (já existe `admin`).

**Tabela `profiles`** (nova):
- `id uuid PK` → `auth.users(id)` ON DELETE CASCADE
- `nome_completo`, `telefone`, `whatsapp`, `email`, `cpf_cnpj`, `cidade`, `estado`, `tipo_cliente` (residencial/empresarial)
- `cliente_id uuid` (FK opcional para `clientes`, preenchido via trigger)
- timestamps
- GRANTs para `authenticated` e `service_role`
- RLS: cada usuário lê/atualiza apenas o próprio perfil; admin lê todos

**Trigger `handle_new_user`** (AFTER INSERT em `auth.users`):
- Cria linha em `profiles` com os metadados do signup
- Insere `('cliente')` em `user_roles` automaticamente (nunca `admin` via signup)
- Cria automaticamente uma linha em `public.clientes` espelhando os dados, e grava o `cliente_id` no `profiles` — assim o cliente já aparece na página **Clientes** do admin

**Tabela `simulacoes`**: adicionar coluna `user_id uuid` (FK `auth.users`) para vincular simulação ao cliente logado.

**Políticas RLS revisadas**:
- `clientes`, `propostas`, `contratos`, `leads_simulacao`, `configuracoes`, `simulacoes` (SELECT/INSERT/UPDATE/DELETE globais): **apenas `has_role(auth.uid(), 'admin')`**
- `simulacoes` ganha política extra: cliente pode `SELECT`/`INSERT` apenas onde `user_id = auth.uid()`
- `profiles`: self-access + admin-read-all
- `configuracoes_publicas`: mantém leitura anônima (usada em `/simular`)

### 2. Frontend — Rotas e Autenticação

**`AuthContext`**: adicionar `role: 'admin' | 'cliente' | null`, carregado de `user_roles` após login. Expor `isAdmin`, `isCliente`.

**Novas rotas públicas**:
- `/cadastro` — página de signup do cliente (nome, telefone, whatsapp, email, senha, cidade, estado, cpf/cnpj, tipo). Passa os campos em `options.data` do `signUp` para o trigger criar `profiles` + `clientes`. Após signup, redireciona para `/app/inicio` (sessão auto se e-mail auto-confirmado; senão manda para `/login` com toast).
- `/simular` — mantido como está.
- `/login` — mantém, mas após login redireciona conforme role: admin → `/dashboard`, cliente → `/app/inicio`.

**Guardas de rota** (`App.tsx`):
- `ProtectedRoute` continua garantindo sessão.
- Novo `AdminRoute`: se `role !== 'admin'` → `Navigate` para `/app/minha-simulacao`.
- Novo `ClienteRoute`: se `role !== 'cliente'` → `Navigate` para `/dashboard`.
- Rotas admin (`/dashboard`, `/clientes`, `/simulador`, `/propostas`, `/leads`, `/contratos`, `/relatorios`, `/configuracoes`) envelopadas por `AdminRoute` + `AppLayout` atual (inalterado visualmente).
- Rotas cliente sob `/app/*` envelopadas por `ClienteRoute` + novo `ClienteLayout`.

### 3. Área do Cliente (novo)

**`ClienteLayout.tsx`**: mesmo estilo visual do `AppLayout` (sidebar `gradient-sidebar`, logo Zap, colapsável, responsivo mobile), com menu:
- Início — `/app/inicio`
- Minha simulação — `/app/minha-simulacao`
- Meu cadastro — `/app/meu-cadastro`
- Sair

**Páginas novas**:
- `ClienteInicioPage` — boas-vindas com nome do cliente, atalho para "Nova simulação" e cards de resumo (última economia estimada).
- `MinhaSimulacaoPage` — reutiliza a lógica de `calcularSimulacao`. Cliente informa valor da conta (e opcionalmente consumo/distribuidora), vê desconto/economia mensal/anual, botão **"Enviar para análise"** grava em `simulacoes` (com `user_id`) e cria uma entrada em `propostas` com status `gerada` associada ao `cliente_id` do próprio usuário. Abaixo, lista somente as próprias simulações.
- `MeuCadastroPage` — form pré-preenchido de `profiles`; permite editar campos pessoais (não altera role nem e-mail de auth). Ao salvar, sincroniza também a linha em `clientes` correspondente (via `cliente_id`) para o admin ver os dados atualizados.

### 4. Segurança adicional

- Zod schemas para o cadastro público (senha ≥ 6, e-mail válido, CPF/CNPJ obrigatório, tipo em enum).
- `signUp` **nunca** envia `role`; role é definido pelo trigger no servidor.
- Toda leitura/escrita passa pela RLS — o front apenas esconde a UI; a proteção real está no banco.

### 5. Fora de escopo (não muda)

- Visual e comportamento das páginas administrativas existentes.
- Fluxo público `/simular` (leads via WhatsApp) permanece funcionando.
- Login admin `tiagotguianet@gmail.com` continua funcionando.

---

### Confirmação necessária

1. **Auto-confirmação de e-mail no signup do cliente?** Se sim, ativo `auto_confirm_email` para que o cliente entre direto após cadastro (sem precisar checar caixa de entrada). Recomendo sim para facilitar o fluxo via WhatsApp. Confirma?
2. **"Enviar simulação para análise"** deve gerar também um registro na tabela `propostas` (visível para o admin em /propostas) ou basta salvar em `simulacoes`? Sugiro criar em ambas para o admin ter o funil completo.
