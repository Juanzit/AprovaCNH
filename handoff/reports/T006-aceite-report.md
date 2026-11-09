# Relatório de Auditoria, Aceite Editorial e Homologação Técnica — Fase 6 (T006 P0)
- **Data:** 09/11/2026
- **Tarefa:** T006 — Simulado Configurável (Saneamento P0 de Publicação, Integridade de Migrations e Auditoria Normativa)
- **Branch de Trabalho:** `fix/T006-publicacao-segura-pos-merge`
- **Base da Main:** `b31937f2755d98c9f6dd7eb72d1bc22121d9307a`
- **Commit Homologado na CI:** `4ff16fbd4e827175dcecd5e3f63b5c6633f3885a`
- **Commit Atual da Branch:** `a ser registrado após o commit das correções`
- **Repositório:** Juanzit/AprovaCNH
- **Responsável Técnico / Auditor:** Antigravity (Senior Software Engineer / Pair Programming)
- **Status do Merge na Main:** **NÃO MERGEADO** (Branch isolada estritamente preservada)
- **Status de Criação do PR:** **NÃO CRIADO** (Aguardando autorização expressa do Tech Lead)
- **Status da Fase 7 (Tutor de IA) e T007 (Dark Mode):** **BLOQUEADAS / NÃO INICIADAS**
- **Status da CI GitHub Actions:** **APROVADO (100% Green no Run #42665123282 sobre o commit 4ff16fb)**

---

## 1. Resumo Executivo e Diagnóstico de Prontidão

### 1.1 Diagnóstico de Prontidão da T006
- **A T006 está pronta ou ainda não está pronta para homologação em produção?**
  **A T006 NÃO ESTÁ FORMALMENTE HOMOLOGADA PARA PRODUÇÃO**, pois persistem bloqueadores editoriais humanos inegociáveis:
  1. **Estoque de Conteúdo Elegível:** O acervo da aplicação dispõe de **20 questões aprovadas** (`sin-001` a `sin-020`) e **10 questões em revisão** (`sin-021` a `sin-030`).
  2. **Regra de Segurança de Publicação (D010 e AGENTS.md):** Questões em revisão ou exemplos jamais são disponibilizadas para estudantes. O gerador de simulado temático recusa-se a iniciar provas com estoque inferior a 30 questões aprovadas (`InsufficientApprovedQuestionsError`).
  3. **Interface e Contingência Segura:** A tela inicial mantém o botão `Acessar Simulado Temático →` ativo para conduzir o estudante ao lobby informativo (`/simulado`). No lobby, o sistema exibe o alerta `simulado-insufficient-alert` ("20/30 questões aprovadas") com o botão de início desabilitado (`Simulado Indisponível`). Qualquer tentativa de acesso direto a `/simulado/prova` é bloqueada com mensagem clara de acervo em homologação e botão de retorno seguro ao lobby.
  4. **Banco Remoto:** No Supabase em nuvem (`vhciqawgrnlnouhvvrer`), as 10 questões complementares continuam com `status = 'aprovada'` e aprovador genérico fictício herdados da carga inicial. A migration corretiva `20261109000007_remediate_sin_021_to_030_editorial_safety.sql` foi reescrita de forma estritamente cirúrgica, mas **não foi aplicada remotamente**, preservando a governança do banco.

---

## 2. Documentação da CI GitHub Actions e Gates de Qualidade

### 2.1 Execução Remota Homologada (#42665123282)
- **URL da Execução:** [https://github.com/Juanzit/AprovaCNH/actions/runs/42665123282](https://github.com/Juanzit/AprovaCNH/actions/runs/42665123282)
- **Status:** `completed` | **Conclusion:** `success`
- **Commit Efetivamente Testado:** `4ff16fbd4e827175dcecd5e3f63b5c6633f3885a`
  *(Nota: O commit subsequente `3d56ca78b3a5498498666beee5392d641b696ee7` atualizou apenas documentação).*
- **Ambiente de Execução da CI:**
  - Runtime Node da aplicação: `22.23.4` (runner executou em contêiner com Node 24 forçado pela action depreciada).
  - Gerenciador de pacotes: `pnpm@12.18.0` (configurado via `pnpm/action-setup@v4`).
- **Gates Executados e Aprovados no GitHub Actions:**
  1. `Set up job`: **success**
  2. `Checkout repository`: **success**
  3. `Install pnpm`: **success** (`12.18.0`)
  4. `Setup Node.js`: **success**
  5. `Install dependencies`: **success** (`pnpm install --frozen-lockfile`)
  6. `Typecheck`: **success** (`pnpm typecheck` / `tsc --noEmit`, 0 erros)
  7. `Lint`: **success** (`pnpm lint` / `eslint .`, 0 erros, 0 avisos)
  8. `Unit & Integration Tests (Vitest)`: **success** (`pnpm test`, 22 arquivos, 123 testes aprovados)
  9. `Build Application (Next.js)`: **success** (`pnpm build`, 10 páginas estáticas geradas com sucesso)
  10. `Complete job`: **success**

### 2.2 Ressalvas Técnicas Obrigatórias sobre a CI
1. **Ausência de E2E no Pipeline da CI:** O workflow do GitHub Actions (`.github/workflows/ci.yml`) **não executa testes E2E/Playwright**. Os testes Playwright (30 testes aprovados) foram executados localmente e são resultados locais relatados, não evidência de execução remota da CI.
2. **Avisos de Conexão com URL Mock:** Durante o passo de Vitest na CI, os logs registram avisos `TypeError: fetch failed` decorrentes da tentativa de conexão com a URL mock do Supabase (`mock.supabase.co`). O teste de integração `tests/integration/supabase-live.test.ts` foi projetado para ignorar conexões ao vivo quando detecta credenciais de mock.
3. **Escopo da Comprovação:** A CI verde comprova estritamente a conformidade dos gates estáticos, testes unitários herméticos e build do Next.js. Ela **não comprova** a disponibilidade, integridade ou performance do banco de dados Supabase remoto.

---

## 3. Gestão e Histórico das Migrations

### 3.1 Situação da Migration 000006 e Investigação Git
- **Arquivo:** [`supabase/migrations/20261108000006_add_questions_sin_021_to_030.sql`](file:///c:/Projetos/AprovaCNH/supabase/migrations/20261108000006_add_questions_sin_021_to_030.sql)
- **Investigação de Histórico:**
  1. No commit `03926a2` (primeira entrega do simulado), a migration continha `status = 'aprovada'`, `approved_by = 'Tech Lead / Responsável pelo Produto'` e `ON CONFLICT DO UPDATE`.
  2. No commit `041fd43` (PR #1), o status foi alterado no script para `'em_revisao'` e `approved_by` para `NULL`, preservando `ON CONFLICT DO UPDATE`. Essa versão foi incorporada à `main` no commit `b31937f`.
  3. No banco de dados Supabase remoto, a inspeção somente leitura confirmou que as questões estão com `status = 'aprovada'` e `approved_by = 'Tech Lead / Responsável pelo Produto'`. Isso indica forte probabilidade de que a versão executada manualmente pelo responsável no SQL Editor foi a do commit `03926a2`.
  4. Contudo, como a tabela interna `supabase_migrations` não pôde ser lida por limitações de acesso PostgREST e rede IPv6, o registro de governança é:
     > **VERSÃO EXECUTADA NO SUPABASE: NÃO VERIFICADA**
  5. **Preservação Histórica:** Para não reescrever o histórico compartilhado já mergeado na `main`, a migration `20261108000006_add_questions_sin_021_to_030.sql` foi restaurada para a versão exata presente na `main`. Nenhuma reconciliação retroativa fictícia foi realizada.

### 3.2 Situação da Migration Corretiva Incremental 000007
- **Arquivo:** [`supabase/migrations/20261109000007_remediate_sin_021_to_030_editorial_safety.sql`](file:///c:/Projetos/AprovaCNH/supabase/migrations/20261109000007_remediate_sin_021_to_030_editorial_safety.sql)
- **Reescrita Cirúrgica de Saneamento Editorial (Conformidade com os 9 Critérios):**
  1. **Conteúdo Preservado:** NÃO sobrescreve enunciado (`statement`), alternativas (`options`), gabarito (`correct_option_id`) ou explicação (`explanation`).
  2. **Fontes Preservadas:** NÃO altera metadados de fontes, documentos, dispositivos, URLs ou `verification_status` em `public.question_sources`.
  3. **Notas de Revisão Preservadas:** NÃO altera nem sobrescreve `verification_notes` em `public.question_reviews`.
  4. **Proteção a Aprovadores Humanos:** NÃO apaga responsável nem data de aprovação caso exista curadoria nominal humana legítima.
  5. **Separação de Papéis:** NÃO infere aprovação editorial a partir de `verification_status = 'verified'`. A verificação documental permanece estritamente desvinculada do aceite pedagógico do Tech Lead.
  6. **Critério Explícito de Remoção:** Remove exclusivamente valores que correspondam aos aprovadores automatizados fictícios: `'Tech Lead / Responsável pelo Produto'` e `'Antigravity'`.
  7. **Preservação de Registros Ambíguos:** Se uma questão possuir aprovador que não seja nulo e não esteja na lista explícita de valores fictícios, ela é deixada 100% intocada.
  8. **Idempotência:** O script é transacionado (`BEGIN...COMMIT`) e idempotente.
  9. **Estado no Banco Remoto:** **NÃO EXECUTADA NO SUPABASE**, aguardando decisão humana formal.

---

## 4. Avaliação e Testes de Integridade PostgreSQL

- **Infraestrutura Local:** O ambiente operacional Windows da máquina de desenvolvimento não dispõe de Docker instalado nem de instância local de PostgreSQL / psql.
- **Banco Remoto:** O Supabase de nuvem é o ambiente de produção/homologação e está protegido contra comandos arbitrários de escrita ou DDL.
- **Classificação:** Conforme orientação do Tech Lead, a integridade da migration contra uma engine PostgreSQL real com conflitos simulados é classificada como:
  > `🟡 IMPLEMENTADO, MAS NÃO COMPROVADO`
- **Validação Estrutural:** O arquivo de teste unitário `tests/unit/migrationIntegrity.test.ts` valida estaticamente que a migration 000007 não contém cláusulas de sobrescrita de conteúdo (`statement =`, `options =`, etc.), não altera `question_sources`, não altera `verification_notes` e condiciona estritamente a limpeza aos aprovadores fictícios conhecidos. Nenhuma simulação em JavaScript é apresentada como substituto de execução em banco real.

---

## 5. Revisão de Fontes Normativas e Identificação da Unidade

### 5.1 Distinção Editorial entre MBST e MBFT na Interface
- **Diagnóstico:** A tela inicial identificava a Unidade 1 como *"Manual Brasileiro de Fiscalização de Trânsito — MBFT (Resolução CONTRAN nº 985/2022)"*, embora o conteúdo seja de *"Sinalização de Trânsito"*.
- **Correção Aplicada (`TrackUnitCard.tsx`):**
  - O conteúdo da Unidade 1 corresponde ao **Manual Brasileiro de Sinalização de Trânsito — MBST (aprovado e consolidado pela Resolução CONTRAN nº 973/2022)**, em seus volumes pertinentes:
    - **Volume I** — Sinalização Vertical de Regulamentação (Anexo I da Res. 973/2022);
    - **Volume II** — Sinalização Vertical de Advertência (Anexo II da Res. 973/2022).
  - A menção ao **MBFT (Resolução CONTRAN nº 985/2022, com atualização pela Resolução nº 1.031/2026)** foi esclarecida como **fonte complementar infracional**, utilizada unicamente para fundamentar o enquadramento de autuações por desobediência à sinalização (arts. 195, 208, 209 do CTB).
  - O subtítulo da Unidade 1 foi ajustado para:
    > *Manual Brasileiro de Sinalização de Trânsito — MBST (Resolução CONTRAN nº 973/2022: Vol. I Regulamentação e Vol. II Advertência) • Fichas infracionais complementares do MBFT (Resoluções CONTRAN nº 985/2022 e nº 1.031/2026)*

### 5.2 Auditoria Específica das Questões Normativas
1. **`sin-021` (Distância de Segurança e Regra dos 2 Segundos):**
   - A atribuição genérica à cartilha digital da SENATRAN foi removida do campo `source`.
   - A questão está fundamentada estritamente no dispositivo positivo: **Lei Federal nº 9.503/1997 (CTB), Art. 29, inciso II**, com URL oficial do Planalto (`https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm`).
   - A menção didática à "regra dos dois segundos" foi mantida na explicação pedagógica como método consagrado nos cursos de formação de condutores regulamentados pela Resolução CONTRAN nº 1.020/2025.
2. **`sin-023` (Uso da Buzina e Placa R-20):**
   - Confirmada a distinção técnica:
     - **Art. 227, inciso IV do CTB:** Infração leve por usar buzina em locais e horários proibidos pela sinalização regulamentar (Placa R-20 do MBST Vol. I).
     - **Art. 227, inciso V do CTB:** Infração média por usar buzina em desacordo com padrões e frequências fixados pelo CONTRAN (decibéis do equipamento).
   - O enunciado, alternativas e explicação refletem estritamente essa diferenciação legal.
3. **`sin-026` (Transporte de Crianças em Veículos):**
   - Confirmada a fundamentação: **Art. 64 do CTB (redação da Lei Federal nº 14.071/2020)** c/c **Resolução CONTRAN nº 819/2021** (dispositivos de retenção adequados a peso, altura e idade até 10 anos ou 1,45m de altura).

---

## 6. Fluxo de Início do Simulado na Interface (Validação E2E)

A experiência discente e as travas de segurança foram verificadas de ponta a ponta na suíte Playwright (`tests/e2e/simulado-flow.spec.ts`):

1. **Tela Inicial (`/`):** O botão `Acessar Simulado Temático →` permanece ativo e navegável, permitindo ao aluno acessar a página de orientações do simulado.
2. **Lobby do Simulado (`/simulado`):** Exibe as regras oficiais (30 questões, 60/120 min, meta de 20 acertos), a nota de transparência editorial e o alerta acessível `simulado-insufficient-alert` (*"Simulado indisponível no momento: o acervo possui 20 questões aprovadas, sendo necessárias 30"*).
3. **CTA Bloqueado no Lobby:** O botão `data-testid="start-simulado-cta"` permanece desabilitado (`Simulado Indisponível (20/30 questões aprovadas)`), impedindo o disparo da prova.
4. **Bloqueio de Rota Direta (`/simulado/prova`):** Tentativas de navegação direta para a rota da prova são interceptadas pelo servidor, que renderiza a tela de contingência explicativa (*"Simulado Completo Temporariamente Indisponível"*) com `data-testid="return-simulado-lobby-btn"` funcional.
5. **Seletor de Duração PCD/TEA (Art. 33, § 2º):** Permite alternar para 120 minutos, mantendo a proteção contra início prematuro.

---

## 7. Evidências Reais dos Testes Locais

| Gate / Suíte | Comando | Resultado | Tempo | Detalhes |
|---|---|---|---|---|
| **Typecheck** | `pnpm typecheck` | **APROVADO (Exit Code 0)** | 2.6s | 0 erros de tipagem estrita no TypeScript. |
| **Lint** | `pnpm lint` | **APROVADO (Exit Code 0)** | 6.5s | 0 erros, 0 avisos no ESLint 10. |
| **Testes Unitários & Integração** | `pnpm test` | **APROVADO (Exit Code 0)** | 18.11s | **22 arquivos de teste aprovados, 123 testes aprovados (100%)**. |
| **Testes E2E (Playwright)** | `pnpm test:e2e` | **APROVADO (Exit Code 0)** | 25.0s | **30 testes aprovados** (15 Desktop Chrome + 15 Mobile Chrome). |
| **Build Next.js** | `pnpm build` | **APROVADO (Exit Code 0)** | 4.8s | 10 páginas estáticas compiladas com sucesso via Turbopack. |

---

## 8. Matriz de Aceite Técnica e Editorial (Classificação Estrita)

| Critério de Homologação | Categoria | Evidência Comprobatória |
|---|---|---|
| **Regra central de elegibilidade discente (`status === 'aprovada' && !isExample`)** | `✅ COMPROVADO` | Validado em `questionSchema.test.ts`, `publicationSecurity.test.ts` e repositórios. |
| **Proteção de Lições contra questões não aprovadas** | `✅ COMPROVADO` | Validado em `publicationSecurity.test.ts` e `questionRepository.test.ts`. |
| **Proteção do SRS contra questões não aprovadas** | `✅ COMPROVADO` | Validado em `publicationSecurity.test.ts` e `reviewRepository.test.ts`. |
| **Proteção do Fallback local contra vazamento de `em_revisao`** | `✅ COMPROVADO` | `getFallbackApprovedQuestions()` retorna rigorosamente as 20 aprovadas e zero em revisão. |
| **Gerador de Simulado: erro controlado se $< 30$ aprovadas** | `✅ COMPROVADO` | `simuladoGenerator.test.ts` (Cenários 2 e 7) valida `InsufficientApprovedQuestionsError`. |
| **Gerador de Simulado: deduplicação por ID e exclusão de pendentes/exemplos** | `✅ COMPROVADO` | `simuladoGenerator.test.ts` (Cenários 3, 4, 5 e 6). |
| **Interface: acesso navegável ao lobby e CTA de início desabilitado** | `✅ COMPROVADO` | Validado em `simulado-flow.spec.ts` (Home -> Lobby -> CTA desabilitado). |
| **Interface: bloqueio de rota direta e retorno seguro ao lobby** | `✅ COMPROVADO` | Validado em `simulado-flow.spec.ts` (`/simulado/prova` -> contingência -> retorno ao lobby). |
| **Coerência e exatidão normativa de `sin-021` a `sin-030` (JSON)** | `✅ COMPROVADO` | URLs oficiais do Planalto/CONTRAN conferidas; vigências e artigos CTB/CONTRAN checados. |
| **Distinção entre MBST (sinalização) e MBFT (fiscalização complementar)** | `✅ COMPROVADO` | Subtítulo e identificação corrigidos em `TrackUnitCard.tsx`. |
| **Execução dos 5 gates de CI no GitHub Actions com pnpm 12** | `✅ COMPROVADO` | [Run #42665123282](https://github.com/Juanzit/AprovaCNH/actions/runs/42665123282) executou com 100% de sucesso sobre o commit `4ff16fb`. |
| **Proposta cirúrgica da migration 000007 sem sobrescrita de conteúdo** | `✅ COMPROVADO` | Validado estruturalmente em `migrationIntegrity.test.ts` (sem UPDATE em conteúdo, fontes ou notas). |
| **Execução de migration contra PostgreSQL real com conflitos simulados** | `🟡 IMPLEMENTADO, MAS NÃO COMPROVADO` | Sem Docker ou PostgreSQL local disponível no ambiente; Supabase remoto protegido contra comandos de escrita. |
| **Aplicação da migration corretiva 000007 no Supabase remoto** | `🟡 IMPLEMENTADO, MAS NÃO COMPROVADO` | Script gerado e versionado, mantido sem execução no banco em nuvem por governança. |
| **Registro de histórico na tabela `supabase_migrations` remota** | `⚪ NÃO VERIFICADO` | Restrição de rede IPv6 na CLI e PostgREST sem acesso ao schema interno. |
| **Versão da migration 000006 executada no Supabase** | `⚪ NÃO VERIFICADO` | Registrado formalmente como: `VERSÃO EXECUTADA NO SUPABASE: NÃO VERIFICADA`. |
| **Homologação editorial final das 10 questões complementares** | `❌ BLOQUEADO` | Depende exclusivamente da aprovação humana individual do Tech Lead. |

---

## 9. Bloqueadores Ainda Abertos

1. **Aprovação Editorial Humana das Questões `sin-021` a `sin-030`:** O acervo da aplicação permanecerá com 20 questões aprovadas e 10 em revisão até que o Tech Lead aprove individualmente cada uma das questões complementares.
2. **Indisponibilidade Funcional do Simulado Completo:** Como consequência direta da regra P0, o simulado de 30 questões permanece intencionalmente indisponível para os alunos.
3. **Saneamento do Banco Supabase Remoto:** A migration `20261109000007_remediate_sin_021_to_030_editorial_safety.sql` aguarda revisão técnica e autorização humana expressa para ser aplicada no SQL Editor do Supabase.

---

## 10. Parecer do Engenheiro

A branch `fix/T006-publicacao-segura-pos-merge` cumpriu todos os requisitos técnicos de segurança de publicação, integridade de migration, alinhamento normativo com o MBST/CTB e correção de gates da CI.

O Pull Request **não foi aberto** e a branch **não foi mergeada na main**. O trabalho permanece isolado e protegido na branch corretiva, aguardando a revisão técnica do Tech Lead.
