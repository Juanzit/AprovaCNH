# Relatório de Entrega — Fase 6 (T006: Simulado Configurável)

- **Data:** 2026-11-08
- **Tarefa:** T006 — Simulado Configurável (Resolução CONTRAN nº 1.020/2025 — Regra D007: 30 questões, 60 minutos, nota de corte de 20 acertos)
- **Branch de Entrega:** `feat/T006-simulado`
- **Base:** `main` (`eae90fe`)

---

## 1. Arquivos Criados e Alterados

### 1.1. Banco de Dados e Configuração Regulatória (Supabase)
- `supabase/migrations/20261108000005_create_simulado_schema.sql` *(criado — Migration SQL que cria as tabelas `public.exam_configs`, `public.simulado_sessions` e `public.simulado_answers`, aplica políticas restritivas de Row Level Security [RLS], concede permissões PostgREST e insere a configuração oficial padrão `'detran-mg-default'` com `total_questions = 30`, `duration_minutes = 60`, `passing_score = 20` e `normative_act = 'Resolução CONTRAN nº 1.020/2025 e Banco Nacional de Questões (SENATRAN)'`)*

### 1.2. Domínio, Repositório, Gerador e Server Actions (`src/features/simulado/`)
- `src/features/simulado/types/simulado.ts` *(criado — Schemas Zod e tipos TypeScript para `ExamConfig`, `SimuladoQuestionItem`, `SimuladoAnswerState`, `SimuladoSubmissionPayload`, `SimuladoResult` e `SimuladoHistorySummary`, além de `DEFAULT_EXAM_CONFIG`)*
- `src/features/simulado/utils/simuladoGenerator.ts` *(criado — `generateSimuladoQuestions` com amostragem Fisher-Yates e suporte a semente determinística para 30 questões, `evaluateSimuladoSubmission` para cálculo autoritativo da nota de corte de 20 acertos e XP, e formatadores `formatDurationMmSs` / `formatDurationHuman`)*
- `src/features/simulado/utils/simuladoStorage.ts` *(criado — Persistência transparente em `sessionStorage` para visitantes e cache imediato de gabarito/histórico)*
- `src/features/simulado/server/simuladoRepository.ts` *(criado — Repositório no servidor que consulta `exam_configs`, inicializa sessões em `simulado_sessions` e `simulado_answers`, avalia submissões atualizando `user_answers`, `xp_transactions` e `profiles` [streak diário + XP], e recupera resultados/histórico)*
- `src/features/simulado/server/simuladoActions.ts` *(criado — Server Action `submitSimuladoAction` com revalidação de rotas)*

### 1.3. Componentes de Interface e Rotas (`src/features/simulado/components/` e `src/app/simulado/`)
- `src/features/simulado/components/SimuladoTimer.tsx` *(criado — Cronômetro regressivo de 60 minutos resiliente a abas inativas com recálculo baseado em timestamp absoluto `startedAt`, estados semânticos de urgência normal/alerta/crítico e anúncio `aria-live="polite"` debounced nos marcos de 5 min e 1 min)*
- `src/features/simulado/components/SimuladoNavDrawer.tsx` *(criado — Gaveta/Mapa da Prova de 1 a 30 com `aria-expanded`, indicadores de questão respondida, em branco e marcada para revisão `🚩`)*
- `src/features/simulado/components/SimuladoQuestionCard.tsx` *(criado — Exibição da questão sem feedback imediato usando `<fieldset>`/`<legend>` e `<input type="radio">` nativos sem listas redundantes, mais botão `Marcar para revisar` com `aria-pressed`)*
- `src/features/simulado/components/SimuladoFinishModal.tsx` *(criado — Modal nativo `<dialog>` aberto via `showModal()` com `autofocus` na ação segura quando há questões em branco e alerta explícito de itens não respondidos)*
- `src/features/simulado/components/SimuladoContainer.tsx` *(criado — Orquestrador completo da prova real em `/simulado/prova` com atalhos de teclado, barra de progresso, gaveta de navegação e auto-submissão por tempo esgotado)*
- `src/features/simulado/components/SimuladoResultSummary.tsx` e `src/features/simulado/components/SimuladoReviewList.tsx` *(criados — Painel de status `APROVADO NO SIMULADO!` vs. `NÃO ATINGIU O CORTE` e Gabarito Oficial Comentado com filtros `Todas`, `Apenas Erros` e `Apenas Acertos`)*
- `src/features/simulado/components/SimuladoResultClient.tsx` e `src/features/simulado/components/SimuladoHistoryList.tsx` *(criados — Visualização híbrida servidor + `sessionStorage` para suportar tanto alunos autenticados quanto visitantes)*
- `src/app/simulado/page.tsx`, `src/app/simulado/prova/page.tsx`, `src/app/simulado/resultado/[id]/page.tsx`, `src/app/simulado/historico/page.tsx` *(criados — Rotas do App Router para Lobby de Regras, Execução da Prova, Resultado/Gabarito e Histórico)*
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` *(modificados — Link `Simulado` na barra de navegação global, card de acesso rápido ao Simulado no Dashboard e regras `overscroll-behavior: contain` para `<dialog>` nativo)*

### 1.4. Suíte de Testes e Documentação
- `tests/unit/simuladoGenerator.test.ts` *(criado — 7 testes unitários cobrindo `examConfigSchema`, regra D014, sorteio de 30 questões, aprovação com $\ge 20$ acertos, reprovação com $\le 19$ acertos e formatação de tempo)*
- `tests/components/SimuladoComponents.test.tsx` *(criado — 5 testes de componentes cobrindo `SimuladoTimer`, `SimuladoNavDrawer`, `SimuladoQuestionCard`, `SimuladoFinishModal`, `SimuladoResultSummary` e `SimuladoReviewList`)*
- `tests/e2e/simulado-flow.spec.ts` *(criado — Testes E2E em Desktop Chrome e Mobile Chrome validando lobby `/simulado`, prova `/simulado/prova`, cronômetro, mapa 1..30, alerta de questões em branco e gabarito comentado `/simulado/resultado/[id]`)*
- `handoff/decisions.md` e `handoff/reports/T006-plan.md` *(atualizados na etapa de planejamento)*
- `handoff/reports/T006-report.md` *(criado)*

---

## 2. Comandos Executados e Resultados Reais

| Comando | Resultado | Observação |
| :--- | :--- | :--- |
| `pnpm typecheck` (`tsc --noEmit`) | `exit code 0` | Zero erros de tipagem TypeScript strict |
| `pnpm lint` (`eslint .`) | `exit code 0` | Zero erros e zero warnings no ESLint |
| `pnpm test` (`vitest run`) | `exit code 0` | **20 suítes aprovadas / 107 testes passando** (4,30s) |
| `pnpm build` (`next build`) | `exit code 0` | Todas as rotas compiladas com sucesso (`/simulado`, `/simulado/prova`, `/simulado/resultado/[id]`, `/simulado/historico`) |
| `pnpm test:e2e` (`playwright test`) | `exit code 0` | **26 testes E2E passando** (13 Desktop Chrome + 13 Mobile Chrome) |

---

## 3. Testes Executados (Aprovação / Motivo)

1. **Testes Unitários, de Componentes e de Integração (`pnpm test` — 20 arquivos / 107 testes — APROVADOS):**
   - `tests/unit/simuladoGenerator.test.ts` (7 testes): valida a configuração oficial da Resolução CONTRAN nº 1.020/2025 (30 questões, 60 min, corte 20), bloqueio de `'BR'` como UF (D014), geração determinística de 30 questões cobrindo todas as 20 questões únicas da base, aprovação com 20 acertos (+100 XP) e reprovação com 19 acertos (+30 XP).
   - `tests/components/SimuladoComponents.test.tsx` (5 testes): valida os 3 estados de urgência do `SimuladoTimer`, alternância `aria-expanded` e flags `🚩` no `SimuladoNavDrawer`, `aria-pressed` no `SimuladoQuestionCard`, alerta de questões em branco no `SimuladoFinishModal` e filtros do gabarito comentado no `SimuladoReviewList`.
   - Demais 18 suítes (95 testes das Fases 1 a 5.1, incluindo integração ao vivo com o Supabase): 100% aprovadas.
2. **Testes End-to-End (`pnpm test:e2e` — 26 testes — APROVADOS):**
   - `tests/e2e/simulado-flow.spec.ts` (4 execuções: 2 Desktop Chrome + 2 Mobile Chrome): valida exibição das regras D007 em `/simulado`, início da prova em `/simulado/prova`, funcionamento do cronômetro regressivo, marcação de questão para revisão, navegação pelo mapa de 30 questões, modal de confirmação com alerta de questões em branco e redirecionamento para o gabarito comentado em `/simulado/resultado/[id]`.
   - Demais 22 testes E2E (`auth-flow`, `lesson-flow`, `progress-and-streak`, `spaced-repetition`): 100% aprovados.

---

## 4. Status de Entrega (Separado por Categoria)

- **Implementado:**
  - Migration SQL `20261108000005_create_simulado_schema.sql` (`exam_configs`, `simulado_sessions`, `simulado_answers`, RLS, Grants e seed da configuração oficial D007).
  - Gerador de 30 questões, avaliador autoritativo de nota de corte (20 acertos), integração com XP/Streak e suporte completo ao modo visitante via `sessionStorage`.
  - Rotas `/simulado`, `/simulado/prova`, `/simulado/resultado/[id]` e `/simulado/historico`, além de atalhos no cabeçalho global e no Dashboard.
- **Testado:**
  - 107 testes no Vitest (`exit code 0`), 26 testes E2E no Playwright (`exit code 0`), Typecheck (`exit code 0`), Lint (`exit code 0`) e Build de produção (`exit code 0`).
- **Parcial:** Nenhum.
- **Pendente:**
  1. Execução pelo responsável do script `supabase/migrations/20261108000005_create_simulado_schema.sql` no SQL Editor do Supabase para criar as tabelas `exam_configs`, `simulado_sessions` e `simulado_answers` na nuvem (o aplicativo já opera imediatamente com fallback seguro para `DEFAULT_EXAM_CONFIG` e `sessionStorage`).
  2. Aprovação para merge da branch `feat/T006-simulado` na `main`.

---

## 5. Limitações Conhecidas

- Como o banco homologado atual conta com as 20 questões da Unidade 1 (Sinalização e Normas de Circulação), o gerador de 30 questões inclui obrigatoriamente todas as 20 questões únicas e complementa as 10 vagas restantes com uma segunda passagem embaralhada; à medida que novas unidades temáticas forem homologadas no banco, o mesmo gerador preencherá as 30 vagas sem qualquer repetição.
