# Relatório de Aceite Editorial, Pedagógico e Técnico — Fase 6 (T006)
**Data:** 08/11/2026
**Tarefa:** T006 — Simulado Configurável (Ajustes Finais de Aceite Editorial, Pedagógico e Integração)
**Branch de Trabalho:** `fix/T006-aceite-simulado-ajustes`
**Branch Base:** `main` (commit intacto: `b69b7b69e2183ca1d4cc843c524a303c7aad487d`)
**Responsável Técnico / Auditor:** Antigravity (Auditor Editorial, Pedagógico e de Software)
**Status do Merge:** **NÃO MERGEADO** (Branch preservada conforme determinação expressa do Tech Lead)
**Status da Fase 7 (Tutor de IA):** **NÃO INICIADA / BLOQUEADA**
---
## 1. Resumo Executivo e Atendimento às Diretrizes do Tech Lead
Em atendimento direto à ordem de serviço do Tech Lead, a branch `fix/T006-aceite-simulado-ajustes` foi mantida isolada sem merge na `main`. Foram implementadas integralmente as correções editoriais, o alinhamento pedagógico, a revisão de acessibilidade com TEA, o registro de limitação do acervo e as instruções para migração no Supabase:
1. **T001 — Nomenclatura Editorial e Transparência:**
   - Denominação padronizada em toda a aplicação como **"Simulado Temático — Sinalização de Trânsito"**.
   - Adicionada nota destacada em caixa âmbar no lobby (`/simulado`) e nota de esclarecimento na tela de resultados (`/simulado/resultado/[id]`), explicitando que a plataforma AprovaCNH é uma ferramenta independente de estudo e não reproduz necessariamente a distribuição multidisciplinar nem o conjunto de questões do exame oficial.
   - Expressões indutoras de erro ("Simulado Oficial", "Gabarito Oficial", "Aprovado no Exame") foram totalmente removidas ou substituídas por termos transparentes como *"Gabarito Comentado da Plataforma"*, *"Resposta Correta (CTB / CONTRAN)"* e *"Treino Temático de Sinalização"*.
2. **T002 — Alinhamento Pedagógico das Mensagens de Resultado:**
   - Mensagem binária oficial ("Aprovado / Reprovado") substituída pela avaliação formativa da plataforma:
     - **$\ge 20$ acertos:** *"✓ META DE ESTUDO ALCANÇADA"* (+100 XP), com esclarecimento de que os 20 acertos são uma meta de referência pedagógica interna e não asseguram aprovação no exame oficial do DETRAN.
     - **$\le 19$ acertos:** *"⚠ CONTINUE PRATICANDO"* (+30 XP), com recomendação didática para revisão dos itens através das micro-aulas comentadas e fundamentação legal.
3. **T003 — Acessibilidade e Nomenclatura do Tempo Estendido (TEA e Res. 1.020/2025):**
   - Configuração clara no lobby:
     - **60 minutos (Configuração padrão):** Tempo regulamentar para resolução das 30 questões temáticas.
     - **120 minutos (Tempo estendido):** Tempo dobrado conforme previsto no **Art. 33, § 2º da Resolução CONTRAN nº 1.020/2025** para candidatos com dislexia, TDAH ou **TEA (Transtorno do Espectro Autista)**.
   - Inclusão expressa do termo **TEA** na interface e no seletor, sem exigir qualquer tipo de laudo ou diagnóstico médico para sua ativação.
4. **T004 — Registro Explícito da Limitação do Acervo Atual:**
   - O banco de questões possui atualmente **exatamente 30 questões temáticas** (`sin-001` a `sin-030`), concentradas no módulo de Sinalização de Trânsito e Normas de Circulação.
   - Cada tentativa consome integralmente os 30 itens sem duplicação interna, aplicando embaralhamento aleatório (Fisher-Yates) tanto na ordem das 30 questões quanto na ordem das alternativas (A, B, C, D).
   - Entre diferentes tentativas, os mesmos 30 IDs são reutilizados sob novas permutações aleatórias, não havendo questões sobressalentes até a futura expansão do banco.
   - O simulado atual não reflete a proporcionalidade multidisciplinar do exame oficial do DETRAN (Direção Defensiva, Primeiros Socorros, Mecânica Básica e Meio Ambiente).
   - Registrada no backlog a necessidade prioritária de expansão multidisciplinar do acervo antes do lançamento comercial.
5. **T005 — Instruções Detalhadas para Migração no Supabase:**
   - O status da migration de expansão de questões está documentado de forma transparente (detalhes na Seção 4 deste relatório), com passo a passo seguro para aplicação no SQL Editor e consulta de verificação `SELECT count(*) FROM questions;`.
6. **T006 — Testes Automatizados:**
   - Suíte técnica 100% verde: TypeScript strict (0 erros), ESLint (0 avisos), Vitest (108 testes em 20 arquivos), Next.js Turbopack Build (sucesso) e Playwright E2E (30 testes em Desktop e Mobile Chrome).
7. **T007 — Pull Request:**
   - Branch publicada no GitHub (`origin/fix/T006-aceite-simulado-ajustes`), pronta para revisão em Pull Request direcionado para `main`, com histórico limpo e preservado.
8. **T008 — Documentação e Google Drive:**
   - Arquivo sincronizado com o espelho local e pronto para upload no Google Drive.
---
## 2. Resultados Reais das Verificações Automatizadas
Todas as verificações foram executadas no ambiente local do repositório, com os seguintes resultados literais:
### 2.1 Verificação de Tipos TypeScript (`pnpm typecheck`)
- **Comando:** `pnpm typecheck` (`tsc --noEmit`)
- **Resultado:** **APROVADO (Código 0)**
- **Tempo:** ~4.5s
- **Saída:**
  ```text
  $ tsc --noEmit
  ```
### 2.2 Análise Estática de Código (`pnpm lint`)
- **Comando:** `pnpm lint` (`eslint .`)
- **Resultado:** **APROVADO (Código 0, 0 erros, 0 avisos)**
- **Tempo:** ~14s
- **Saída:**
  ```text
  $ eslint .
  ```
### 2.3 Testes Unitários e de Componentes (`pnpm test`)
- **Comando:** `pnpm test` (`vitest run`)
- **Resultado:** **APROVADO (Código 0 — 20 arquivos de teste, 108 testes aprovados)**
- **Duração:** 9.71s
- **Detalhamento dos Testes Executados:**
  - `tests/components/SimuladoComponents.test.tsx`: 5 testes aprovados (cronômetro, gaveta de mapa 1..30, rádio sem feedback imediato, modal de entrega e resumo com badge "META DE ESTUDO ALCANÇADA").
  - `tests/unit/simuladoGenerator.test.ts`: 8 testes aprovados (incluindo teste T004 de integridade das 30 questões com sementes distintas, corte de 20 acertos, 19 acertos abaixo da meta, e cálculo de XP).
  - `tests/unit/questionRepository.test.ts`: 6 testes aprovados (Anti-Corruption Layer, busca por 30 questões e fallback).
  - `tests/integration/supabase-live.test.ts`: 1 teste aprovado (comunicação em nuvem com o Supabase).
  - `tests/unit/questionSchema.test.ts`: 13 testes aprovados (Zod strict, 4 alternativas, 1 correta).
  - `tests/unit/srsAlgorithm.test.ts`: 13 testes aprovados (algoritmo Leitner determinístico).
  - `tests/unit/masteryCalculator.test.ts`: 11 testes aprovados (domínio por dispositivo legal).
  - `tests/unit/streakCalculator.test.ts`: 7 testes aprovados.
  - `tests/components/AuthPages.test.tsx`: 4 testes aprovados.
  - Demais arquivos de componentes e repositórios: 40 testes aprovados.
### 2.4 Compilação de Produção Turbopack (`pnpm build`)
- **Comando:** `pnpm build` (`next build`)
- **Resultado:** **APROVADO (Código 0)**
- **Duração:** 2.9s (compilação) + 4.6s (typecheck) + 0.9s (páginas estáticas)
- **Saída do Build:**
  ```text
  ▲ Next.js 16.4.5 (Turbopack)
  - Environments: .env.local
  ✓ Running next.config.ts took 209ms
  ✓ Compiled successfully in 2.9s
  ✓ Generating static pages using 3 workers (10/10) in 910ms
  Route (app)
  ┌ ƒ /
  ├ ○ /_not-found
  ├ ƒ /auth/callback
  ├ ƒ /auth/signout
  ├ ○ /cadastro
  ├ ƒ /licao/sinalizacao
  ├ ○ /login
  ├ ƒ /revisao
  ├ ƒ /revisao/pratica
  ├ ƒ /simulado
  ├ ƒ /simulado/historico
  ├ ƒ /simulado/prova
  └ ƒ /simulado/resultado/[id]
  ```
### 2.5 Testes de Ponta a Ponta Playwright (`pnpm test:e2e`)
- **Comando:** `pnpm test:e2e` (`playwright test`)
- **Resultado:** **APROVADO (Código 0 — 30 testes aprovados, 0 falhas)**
- **Duração:** 50.0s (execução paralela com 2 workers)
- **Cobertura de Dispositivos:**
  - 15 testes em `Desktop Chrome` (1280x720)
  - 15 testes em `Mobile Chrome` (Pixel 5 / 393x851)
- **Cenários do Simulado Validados:**
  1. `lobby /simulado`: regras regulamentares exibidas com nova nomenclatura (30 questões, 60 min, corte 20) e aviso de ferramenta independente.
  2. `fluxo de prova`: cronômetro regressivo, questão 1 a 30, seleção de alternativa, marcação de flag `🚩`, drawer com salto direto para questão 5, modal de confirmação com aviso de questões em branco e redirecionamento para o gabarito comentado.
  3. `tempo estendido 120 min PCD/TEA`: seleção no lobby comprovando texto com **TEA** e **Art. 33, § 2º**, navegação com `?tempo=120` e cronômetro regressivo operando a partir de 120 minutos.
  4. `resiliência a reload (F5)`: seleção na questão 1, flag `🚩`, F5 / reload e verificação de integridade do estado e cronômetro.
---
## 3. Matriz de Validação dos Ajustes de Aceite (T001 a T004)
| Requisito | Descrição do Ajuste | Arquivos Alterados | Evidência de Validação | Status |
|---|---|---|---|---|
| **T001 — Nomenclatura** | Substituição por "Simulado Temático — Sinalização de Trânsito", nota de ferramenta independente e remoção de termos como "Oficial". | `src/app/page.tsx`, `src/app/simulado/page.tsx`, `src/app/simulado/historico/page.tsx`, `SimuladoContainer.tsx`, `SimuladoResultSummary.tsx`, `simulado.ts`. | Validação visual no lobby e na home; assertions em `simulado-flow.spec.ts` aprovadas. | **Implementado e Testado** |
| **T002 — Resultado Pedagógico** | Troca de status Aprovado/Reprovado por "Meta de estudo alcançada" ($\ge 20$) e "Continue praticando" ($\le 19$); nota de referência de estudo; XP mantido (100 / 30). | `SimuladoResultSummary.tsx`, `SimuladoHistoryList.tsx`, `simuladoGenerator.ts`, `SimuladoComponents.test.tsx`. | Testes unitários com corte em 20 acertos (+100 XP) e 19 acertos (+30 XP) aprovados; badge visível no E2E. | **Implementado e Testado** |
| **T003 — Tempo Estendido TEA** | Inclusão de 120 min com citação ao Art. 33, § 2º da Res. 1.020/2025 para dislexia, TDAH ou TEA, sem solicitação de laudo. | `SimuladoDurationSelector.tsx`, `simulado-flow.spec.ts`. | Teste E2E checa presença do texto 'TEA' e 'Art. 33, § 2º' no label e inicialização do cronômetro em 120:00. | **Implementado e Testado** |
| **T004 — Limitação do Acervo** | Documentação inequívoca de que o acervo tem exatamente 30 questões de Sinalização, sorteadas sem repetição interna, reutilizadas entre tentativas com randomização. | `src/app/simulado/page.tsx`, `simuladoGenerator.ts`, `simuladoGenerator.test.ts`. | Caixa âmbar explicativa no lobby; teste unitário validando que tentativas usam os 30 IDs sob permutações distintas. | **Implementado e Testado** |
---
## 4. Instruções para Execução da Migração no Supabase (T005)
### 4.1 Status Real da Integração
- As primeiras 20 questões (`sin-001` a `sin-020`) já foram aplicadas na nuvem via migration `20261108000004_update_questions_detran_mg_style.sql`.
- As 10 questões complementares (`sin-021` a `sin-030`) estão preparadas no repositório no arquivo `supabase/migrations/20261108000006_add_questions_sin_021_to_030.sql`.
- O Anti-Corruption Layer do AprovaCNH (`src/features/lesson/server/questionRepository.ts`) possui fallback automático com o arquivo local `src/data/questions-sinalizacao.json`, assegurando que o simulado funciona imediatamente com as 30 questões mesmo antes da migração na nuvem.
### 4.2 Passo a Passo para Aplicação no Supabase SQL Editor
Para persistir as 10 questões complementares no banco gerenciado:
1. Acesse o painel do Supabase do projeto AprovaCNH: [https://supabase.com/dashboard/project/vhciqawgrnlnouhvvrer](https://supabase.com/dashboard/project/vhciqawgrnlnouhvvrer)
2. No menu lateral esquerdo, clique em **SQL Editor**.
3. Clique em **+ New query**.
4. Copie integralmente o conteúdo do arquivo local:
   `supabase/migrations/20261108000006_add_questions_sin_021_to_030.sql`
5. Cole no editor e clique no botão **Run** (ou pressione `Ctrl + Enter`).
6. Verifique o resultado no painel: a mensagem de sucesso deve indicar `Success. No rows returned` (ou inserção concluída).
### 4.3 Verificação Pós-Execução
No mesmo SQL Editor, abra uma nova consulta e execute:
```sql
SELECT count(*) AS total_questoes FROM questions;
```
- **Resultado Esperado:** O valor retornado deve ser exatamente `30`.
- Para inspecionar as novas questões adicionadas:
  ```sql
  SELECT id, code, device, status FROM questions WHERE id BETWEEN 'sin-021' AND 'sin-030' ORDER BY id;
  ```
---
## 5. Estado do Repositório Git e Pull Request (T007)
- **Branch de Trabalho:** `fix/T006-aceite-simulado-ajustes`
- **Branch Alvo:** `main`
- **Merge Realizado:** **NÃO** (a branch `main` permanece intacta no commit `b69b7b69e2183ca1d4cc843c524a303c7aad487d`).
- **Repositório Remoto:** `origin` (`https://github.com/Juanzit/AprovaCNH.git`)
- **Link para Abertura do Pull Request:**
  [https://github.com/Juanzit/AprovaCNH/pull/new/fix/T006-aceite-simulado-ajustes](https://github.com/Juanzit/AprovaCNH/pull/new/fix/T006-aceite-simulado-ajustes)
---
## 6. Registro de Backlog e Limitações Conhecidas
1. **Expansão Multidisciplinar do Banco de Questões (Alta Prioridade):**
   - O acervo atual possui 30 questões exclusivamente do tema de Sinalização de Trânsito e Normas de Circulação.
   - Antes do lançamento comercial/oficial da plataforma, o banco deve ser expandido para contemplar os demais módulos regulamentares da prova teórica: Direção Defensiva, Primeiros Socorros, Mecânica Básica de Veículos e Cidadania/Meio Ambiente, mantendo o mesmo padrão editorial e fundamentação legal estrita.
2. **Histórico Local vs Remoto para Visitantes:**
   - Usuários não logados têm seu histórico gravado em `sessionStorage` (até 25 registros). Ao fechar a aba em modo anônimo ou limpar os dados de navegação, esse histórico local é redefinido.
---
## 7. Status Consolidado das Entregas
- **Implementado:** Nomenclatura editorial transparente (T001); mensagens de resultado pedagógico (T002); tempo estendido com menção a TEA sem exigência de laudo (T003); documentação e aviso de limitação do acervo (T004); instruções passo a passo para Supabase (T005); decisão D019 formalizada em `handoff/decisions.md`.
- **Testado:** 100% aprovado em `typecheck` (0 erros), `lint` (0 problemas), `test` (108 unitários/componentes), `build` (compilação Turbopack) e `test:e2e` (30 testes Playwright Desktop e Mobile).
- **Parcial:** N/A.
- **Pendente:** Execução manual do script SQL `20261108000006_add_questions_sin_021_to_030.sql` pelo responsável no console do Supabase; autorização do Tech Lead para merge na `main`; autorização para início da Fase 7 (Tutor de IA).