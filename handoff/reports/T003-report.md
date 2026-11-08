# T003 — Relatório de Implementação: Persistência e Autenticação (Fase 3)

**Fase:** 3
**Tarefa:** T003 (Persistência e Autenticação)
**Status da Tarefa:** IMPLEMENTADA — AGUARDANDO EXECUÇÃO DOS SCRIPTS SQL NO PAINEL DO SUPABASE
**Data:** 08/11/2026
**Branch:** `feat/T003-persistencia-auth`
**Decisões Aplicadas:** D001, D002, D003, D004, D005, D010, D011, D012, D013, D014, D015

---

## 1. Resumo da Implementação

Em conformidade com a autorização e as diretrizes do plano aprovado, foram implementados os seguintes componentes estruturais:

1. **Migration Inicial DDL (`supabase/migrations/20261108000000_create_initial_schema.sql`):**
   - Criação das tabelas relacionais `profiles`, `questions`, `question_sources` e `question_reviews`.
   - Implementação da trigger `on_auth_user_created` associada à função `public.handle_new_user()` com `SECURITY DEFINER SET search_path = public`, assegurando inserção segura na tabela `profiles` com RLS ativo.
   - Restrições de integridade no PostgreSQL:
     - `check_no_br_in_ufs`: proíbe `"BR"` como sigla de estado (D014).
     - `check_options_length`: valida que `options` é um array JSONB com exatamente 4 elementos.
     - `check_different_models`: valida que o modelo verificador é diferente do gerador (D003).
   - Habilitação de RLS em todas as tabelas públicas e definição de políticas granulares para perfis, questões e auditorias.
   - Criação de índices otimizados para consultas de status, tópico, UFs e categorias.

2. **Carga Inicial de Dados (`supabase/seed.sql`):**
   - Script SQL transacional (`BEGIN ... COMMIT`) populando com integridade referencial as 20 questões homologadas da Fase 2 (T002) nas tabelas `questions`, `question_sources` e `question_reviews`.

3. **Integração do Supabase no Next.js 16 (App Router):**
   - Instalação oficial das dependências `@supabase/supabase-js` e `@supabase/ssr`.
   - Cliente browser em `src/lib/supabase/client.ts`.
   - Cliente servidor em `src/lib/supabase/server.ts` com suporte a `await cookies()` do Next.js 16.
   - Middleware de atualização de sessão e proteção em `src/lib/supabase/middleware.ts` e `src/middleware.ts`.

4. **Camada de Repositório e Anti-Corruption Layer (`src/features/lesson/server/questionRepository.ts`):**
   - Mapeamento e validação estrita dos dados oriundos do PostgreSQL pelo esquema Zod (`questionSchema.parse()`).
   - Mecanismo de fallback transparente que garante resiliência e disponibilidade caso a base de dados ainda não esteja com o schema cache populado.

5. **Telas e Rotas de Autenticação:**
   - Tela de Login acessível (`src/app/login/page.tsx`): formulário semântico com validação, tratamento de erros, live regions com ID exclusivo (`#login-error-alert`) e link para modo visitante.
   - Tela de Cadastro acessível (`src/app/cadastro/page.tsx`): formulário com nome, e-mail, senha (mínimo 6 caracteres), seleção de UF oficial (sem "BR") e categoria CNH.
   - Rotas de infraestrutura de autenticação: `/auth/callback` (troca PKCE) e `/auth/signout` (logout).
   - Cabeçalho global atualizado em `src/app/layout.tsx` com navegação semântica para login e cadastro.

6. **Conexão da Rota da Lição:**
   - A rota `/licao/sinalizacao` consome dinamicamente o repositório `getApprovedQuestionsByTopic('Sinalização de Trânsito')`, mantendo a divisão pedagógica de sessões de 5 questões.

---

## 2. Arquivos Criados e Alterados

- `supabase/migrations/20261108000000_create_initial_schema.sql` (Criado)
- `supabase/seed.sql` (Criado)
- `src/lib/supabase/client.ts` (Criado)
- `src/lib/supabase/server.ts` (Criado)
- `src/lib/supabase/middleware.ts` (Criado)
- `src/middleware.ts` (Criado)
- `src/features/lesson/server/questionRepository.ts` (Criado)
- `src/app/login/page.tsx` (Criado)
- `src/app/cadastro/page.tsx` (Criado)
- `src/app/auth/callback/route.ts` (Criado)
- `src/app/auth/signout/route.ts` (Criado)
- `src/app/licao/sinalizacao/page.tsx` (Atualizado)
- `src/app/layout.tsx` (Atualizado)
- `tests/unit/questionRepository.test.ts` (Criado)
- `tests/components/AuthPages.test.tsx` (Criado)
- `tests/e2e/auth-flow.spec.ts` (Criado)
- `package.json` e `pnpm-lock.yaml` (Atualizados com `@supabase/supabase-js` e `@supabase/ssr`)

---

## 3. Comandos Executados e Resultados Reais de Validação

| Verificação | Comando | Resultado Real |
|---|---|---|
| **Tipagem TypeScript** | `pnpm typecheck` | **0 erros** (`tsc --noEmit`). |
| **Linter** | `pnpm lint` | **0 erros / 0 avisos** (`eslint .`). |
| **Testes Unitários e Componentes** | `pnpm test` | **40 testes aprovados / 0 falhas** (7 suítes em 11.79s). |
| **Build de Produção** | `pnpm build` | **Compilado com sucesso em 2.9s** com Next.js Turbopack. Rotas estáticas e dinâmicas (`/`, `/login`, `/cadastro`, `/auth/*`, `/licao/sinalizacao`) geradas. |
| **Testes Ponta a Ponta** | `pnpm test:e2e` | **10 testes aprovados / 0 falhas** (Playwright Desktop Chrome e Mobile Chrome em 28.0s). |

---

## 4. Orientações para Execução dos Scripts no Painel do Supabase

Para popular as tabelas e o banco de dados no seu projeto Supabase, execute os scripts no **SQL Editor** do painel do Supabase na seguinte ordem:

1. **Executar a Migration Inicial:**
   - Abra o arquivo `supabase/migrations/20261108000000_create_initial_schema.sql` e execute todo o seu conteúdo no SQL Editor.
   - Isso criará as tabelas `profiles`, `questions`, `question_sources`, `question_reviews`, a trigger com `SECURITY DEFINER SET search_path = public`, os índices e as políticas de RLS.
2. **Executar o Seed das 20 Questões Homologadas:**
   - Abra o arquivo `supabase/seed.sql` e execute o script no SQL Editor.
   - Isso inserirá as 20 questões homologadas da T002 diretamente no banco de dados.
