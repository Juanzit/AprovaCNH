# Relatório de Auditoria, Aceite Editorial e Homologação Técnica — Fase 6 (T006 P0)
- **Data:** 09/11/2026
- **Tarefa:** T006 — Simulado Configurável (Saneamento P0 de Publicação, Blindagem RLS, Integridade de Migrations e Auditoria Normativa)
- **Branch de Trabalho:** `fix/T006-publicacao-segura-pos-merge`
- **Base da Main:** `b31937f2755d98c9f6dd7eb72d1bc22121d9307a`
- **Commits Homologados na CI GitHub Actions:**
  - `4ff16fbd4e827175dcecd5e3f63b5c6633f3885a` (Run #42665123282)
  - `351ef309b4707c32a993c91af35404ae41ea475a` (Run #42692927783)
- **Commit Atual da Branch:** `63a95d275eda2467c6240db8319f73e7545904c6`
- **Repositório:** Juanzit/AprovaCNH
- **Responsável Técnico / Auditor:** Antigravity (Senior Software Engineer / Pair Programming)
- **Status do Merge na Main:** **NÃO MERGEADO** (Branch isolada estritamente preservada)
- **Status de Criação do PR:** **NÃO CRIADO** (Aguardando autorização expressa do Tech Lead)
- **Status da Fase 7 (Tutor de IA), T007 (Dark Mode) e BNQ:** **BLOQUEADAS / NÃO INICIADAS**
- **Status da CI GitHub Actions:** **APROVADO (100% Green nos Runs #42665123282 e #42692927783)**

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

## 2. P0 — Auditoria e Blindagem das Políticas RLS do Supabase

### 2.1 Diagnóstico da Exposição nas Políticas da Migration 000000
A inspeção da migration inicial [`supabase/migrations/20261108000000_create_initial_schema.sql`](file:///c:/Projetos/AprovaCNH/supabase/migrations/20261108000000_create_initial_schema.sql) revelou que as políticas de leitura discente (`questions_select_student`, `sources_select_student` e `reviews_select_student`) utilizavam a cláusula permissiva:
```sql
status = 'aprovada' OR (is_example = true AND status = 'rascunho')
```
Como o banco de dados concede `GRANT SELECT` aos papéis `anon` e `authenticated`, essa política permitia que qualquer cliente consultando a API PostgREST diretamente (sem passar pelos filtros de repositório da aplicação) obtivesse:
1. Questões marcadas como `status = 'rascunho'` desde que possuíssem `is_example = true`.
2. Questões marcadas como `status = 'aprovada'` mesmo quando marcadas como `is_example = true` (questões demonstrativas).
3. Fontes e revisões associadas a essas questões em `question_sources` e `question_reviews`.

### 2.2 Campos Expostos em Consultas Diretas
- **`public.questions`:** `id`, `version`, `statement`, `options` (incluindo texto das alternativas), `correct_option_id` (gabarito), `explanation`, `topic`, `subtopic`, `ufs`, `categories`, `status`, `is_example`, `created_at`, `updated_at`.
- **`public.question_sources`:** `question_id`, `kind`, `document`, `provision`, `url`, `checked_at`, `effective_from`, `effective_until`, `source_version`, `license_note`, `verification_status`.
- **`public.question_reviews`:** `question_id`, `generator_model`, `verifier_model`, `verification_notes`, `approved_by`, `approved_at`.

### 2.3 Proposta de Migration Incremental Corretiva (000008)
Foi criada a migration incremental [`supabase/migrations/20261109000008_harden_rls_student_eligibility.sql`](file:///c:/Projetos/AprovaCNH/supabase/migrations/20261109000008_harden_rls_student_eligibility.sql), **sem alterar retroativamente a migration inicial da main** e **sem execução remota**:
1. **`questions_select_student`:** Exige estritamente `status = 'aprovada' AND is_example = false`.
2. **`sources_select_student`:** Condicionada a `EXISTS (SELECT 1 FROM questions WHERE id = question_sources.question_id AND status = 'aprovada' AND is_example = false)`.
3. **`reviews_select_student`:** Condicionada a `EXISTS (SELECT 1 FROM questions WHERE id = question_reviews.question_id AND status = 'aprovada' AND is_example = false)`.

---

## 3. Gestão e Histórico das Migrations (000006 e 000007)

### 3.1 Situação da Migration 000006
- **Arquivo:** [`supabase/migrations/20261108000006_add_questions_sin_021_to_030.sql`](file:///c:/Projetos/AprovaCNH/supabase/migrations/20261108000006_add_questions_sin_021_to_030.sql)
- **Investigação de Histórico no Git:**
  - Versão inicial (`03926a2`): continha `status = 'aprovada'`, `approved_by = 'Tech Lead / Responsável pelo Produto'` e `ON CONFLICT DO UPDATE`.
  - Versão do PR #1 (`041fd43`): ajustada para `status = 'em_revisao'` e `approved_by = NULL`, mantendo `ON CONFLICT DO UPDATE`. Essa versão foi incorporada à `main` no commit `b31937f`.
  - No banco remoto, as questões constam com `status = 'aprovada'` e aprovador fictício, indicando alta probabilidade de aplicação manual da versão do commit `03926a2`.
  - Tentativa de consulta via CLI: `pnpm dlx supabase migration list --project-ref vhciqawgrnlnouhvvrer` falhou com `DbConfigIpv6Error: IPv6 is not supported on your current network`.
  - Conforme orientação de governança, o registro formal é:
    > **VERSÃO EXECUTADA NO SUPABASE: NÃO VERIFICADA**
  - **Preservação Histórica:** O arquivo foi restaurado na branch para corresponder byte a byte à versão presente na `main`, não inventando reconciliações retroativas no histórico compartilhado.

### 3.2 Situação da Migration Corretiva Incremental 000007
- **Arquivo:** [`supabase/migrations/20261109000007_remediate_sin_021_to_030_editorial_safety.sql`](file:///c:/Projetos/AprovaCNH/supabase/migrations/20261109000007_remediate_sin_021_to_030_editorial_safety.sql)
- **Saneamento Cirúrgico (Atendimento Integral aos 9 Critérios):**
  1. NÃO sobrescreve enunciado, alternativas, gabarito ou explicação.
  2. NÃO altera metadados de fontes, documentos ou URLs em `public.question_sources`.
  3. NÃO altera nem sobrescreve `verification_notes` em `public.question_reviews`.
  4. Preserva integralmente aprovadores humanos legítimos nominais.
  5. Não infere aprovação editorial a partir de `verification_status = 'verified'`.
  6. Remove exclusivamente aprovadores fictícios explícitos (`'Tech Lead / Responsável pelo Produto'`, `'Antigravity'`).
  7. Atualiza `status = 'em_revisao'` apenas quando a questão estiver como `'aprovada'` e não possuir aprovador humano legítimo em `question_reviews`.
  8. É transacionada com `BEGIN...COMMIT` e estritamente idempotente.
  9. **NÃO EXECUTADA NO SUPABASE**, aguardando aprovação humana formal.

---

## 4. Avaliação e Testes de Integridade PostgreSQL

- **Infraestrutura Local:** O ambiente operacional Windows da máquina de desenvolvimento **não dispõe de Docker instalado nem de serviço local de PostgreSQL / psql**.
- **Supabase Remoto:** O banco na nuvem (`vhciqawgrnlnouhvvrer`) é o ambiente de produção/homologação e foi preservado contra comandos arbitrários de DDL/DML.
- **Classificação:** Conforme orientação do Tech Lead, a integridade da migration contra uma engine PostgreSQL real com conflitos simulados é classificada honestamente como:
  > `🟡 IMPLEMENTADO, MAS NÃO COMPROVADO`
- **Validação Estrutural:** O arquivo de teste unitário `tests/unit/migrationIntegrity.test.ts` valida estaticamente que as migrations 000007 e 000008 não contêm cláusulas de sobrescrita de conteúdo (`statement =`, `options =`, etc.), não alteram `question_sources`, não alteram `verification_notes` e aplicam as regras estritas de RLS. Nenhuma simulação em JavaScript é apresentada como evidência de execução em banco real.

---

## 5. Revisão de Fontes Normativas e Identificação da Unidade

### 5.1 Distinção Editorial entre MBST e MBFT na Interface
- **Diagnóstico:** A tela inicial identificava a Unidade 1 como *"Manual Brasileiro de Fiscalização de Trânsito — MBFT (Resolução CONTRAN nº 985/2022)"*, embora o conteúdo seja de *"Sinalização de Trânsito"*.
- **Correção Aplicada (`TrackUnitCard.tsx`):**
  - O conteúdo da Unidade 1 corresponde ao **Manual Brasileiro de Sinalização de Trânsito — MBST (aprovado e consolidado pela Resolução CONTRAN nº 973/2022)**, em seus volumes pertinentes:
    - **Volume I** — Sinalização Vertical de Regulamentação (Anexo I da Res. 973/2022);
    - **Volume II** — Sinalização Vertical de Advertência (Anexo II da Res. 973/2022).
  - A menção ao **MBFT (Resolução CONTRAN nº 985/2022, com atualização pelo art. 14 da Resolução nº 1.031/2026, cuja vigência do anexo ocorre 60 dias após a publicação)** foi esclarecida como **fonte complementar infracional**, utilizada unicamente para fundamentar o enquadramento de autuações por desobediência à sinalização (arts. 195, 208, 209 do CTB).
  - O subtítulo da Unidade 1 foi ajustado para:
    > *Manual Brasileiro de Sinalização de Trânsito — MBST (Resolução CONTRAN nº 973/2022: Vol. I Regulamentação e Vol. II Advertência) • Fichas infracionais complementares do MBFT (Resoluções CONTRAN nº 985/2022 e nº 1.031/2026)*

### 5.2 Auditoria Específica das Questões Normativas
1. **`sin-021` (Distância de Segurança):**
   - Removida a atribuição da regra dos dois segundos à Resolução CONTRAN nº 1.020/2025.
   - A questão e sua explicação didática estão fundamentadas **estrita e exclusivamente na Lei Federal nº 9.503/1997 (CTB), Art. 29, inciso II**, com URL oficial do Planalto, eliminando qualquer afirmação didática apresentada como dispositivo normativo.
2. **`sin-023` (Uso da Buzina e Placa R-20):**
   - Confirmada a distinção técnica entre o **Art. 227, IV do CTB** (infração leve por buzinar em local/horário proibido pela sinalização regulamentar — Placa R-20 do MBST Vol. I) e o **Art. 227, V do CTB** (infração média por buzina em desacordo com padrões e frequências fixados pelo CONTRAN).
3. **`sin-026` (Transporte de Crianças em Veículos):**
   - Confirmada a fundamentação legal: **Art. 64 do CTB (redação da Lei nº 14.071/2020)** e **Resolução CONTRAN nº 819/2021** (dispositivos de retenção adequados a peso, altura e idade até 10 anos ou 1,45m de altura).

---

## 6. Fluxo de Início do Simulado na Interface (Validação E2E)

A experiência discente e as travas de segurança foram verificadas de ponta a ponta na suíte Playwright (`tests/e2e/simulado-flow.spec.ts`):

1. **Tela Inicial (`/`):** O botão `Acessar Simulado Temático →` permanece ativo e navegável, permitindo ao aluno acessar a página de orientações do simulado.
2. **Lobby do Simulado (`/simulado`):** Exibe as regras oficiais (30 questões, 60/120 min, meta de 20 acertos), a nota de transparência editorial e o alerta acessível `simulado-insufficient-alert` (*"Simulado indisponível no momento: o acervo possui 20 questões aprovadas, sendo necessárias 30"*).
3. **CTA Bloqueado no Lobby:** O botão `data-testid="start-simulado-cta"` permanece desabilitado (`Simulado Indisponível (20/30 questões aprovadas)`), impedindo o disparo da prova.
4. **Bloqueio de Rota Direta (`/simulado/prova`):** Tentativas de navegação direta para a rota da prova são interceptadas pelo servidor, que renderiza a tela de contingência explicativa (*"Simulado Completo Temporariamente Indisponível"*) com `data-testid="return-simulado-lobby-btn"` funcional.
5. **Seletor de Duração PCD/TEA (Art. 33, § 2º):** Permite alternar para 120 minutos, mantendo a proteção contra início prematuro.

---

## 7. Evidências Reais dos Testes Locais e Remotos da CI

### 7.1 Testes Locais
| Gate / Suíte | Comando | Resultado | Tempo | Detalhes |
|---|---|---|---|---|
| **Typecheck** | `pnpm typecheck` | **APROVADO (Exit Code 0)** | 2.5s | 0 erros de tipagem estrita no TypeScript. |
| **Lint** | `pnpm lint` | **APROVADO (Exit Code 0)** | 6.5s | 0 erros, 0 avisos no ESLint 10. |
| **Testes Unitários & Integração** | `pnpm test` | **APROVADO (Exit Code 0)** | 46.33s | **22 arquivos de teste aprovados, 125 testes aprovados (100%)**. |
| **Testes E2E (Playwright)** | `pnpm test:e2e` | **APROVADO (Exit Code 0)** | 25.0s | **30 testes aprovados** (15 Desktop Chrome + 15 Mobile Chrome Pixel 5). |
| **Build Next.js** | `pnpm build` | **APROVADO (Exit Code 0)** | 4.8s | 10 páginas estáticas compiladas com sucesso via Turbopack. |

### 7.2 Execução Remota da CI GitHub Actions
- **Execuções Homologadas com 100% de Sucesso:**
  - [Run #42665123282](https://github.com/Juanzit/AprovaCNH/actions/runs/42665123282) (commit `4ff16fbd4e827175dcecd5e3f63b5c6633f3885a`)
  - [Run #42692927783](https://github.com/Juanzit/AprovaCNH/actions/runs/42692927783) (commit `351ef309b4707c32a993c91af35404ae41ea475a`)
- **Separação de Resultados:**
  - A CI executou com sucesso os gates: `Install pnpm 12.18.0`, `Setup Node.js 24`, `Install dependencies`, `Typecheck`, `Lint`, `Vitest (125 testes)` e `Build Next.js`.
  - A CI **não executa Playwright/E2E** (os 30 testes E2E são testes locais relatados).
  - Avisos `TypeError: fetch failed` decorrentes da URL mock do Supabase nos runners foram observados e tratados. A CI verde atesta a solidez do código e da compilação hermética, mas **não atesta** a disponibilidade nem a integridade do banco de produção.

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
| **Interface: acesso navegável ao lobby e CTA de início desabilitado** | `✅ COMPROVADO` | Playwright E2E (`simulado-flow.spec.ts`) valida Home -> Lobby -> CTA desabilitado com alerta 20/30. |
| **Interface: bloqueio de rota direta e retorno seguro ao lobby** | `✅ COMPROVADO` | Playwright E2E (`simulado-flow.spec.ts`) valida `/simulado/prova` -> contingência -> retorno ao lobby. |
| **Coerência e exatidão normativa de `sin-021` a `sin-030` (JSON)** | `✅ COMPROVADO` | URLs do Planalto conferidas; vigências e distinções normativas ajustadas; didática não normativa de `sin-021` removida. |
| **Distinção entre MBST (sinalização) e MBFT (fiscalização complementar)** | `✅ COMPROVADO` | Subtítulo e identificação corrigidos em `TrackUnitCard.tsx`. |
| **Execução dos 5 gates de CI no GitHub Actions com pnpm 12** | `✅ COMPROVADO` | Runs [#42665123282](https://github.com/Juanzit/AprovaCNH/actions/runs/42665123282) e [#42692927783](https://github.com/Juanzit/AprovaCNH/actions/runs/42692927783) com 100% de sucesso. |
| **Proposta cirúrgica da migration 000007 sem sobrescrita de conteúdo** | `🟡 IMPLEMENTADO, MAS NÃO COMPROVADO` | Validada estruturalmente em `migrationIntegrity.test.ts`, porém sem execução em banco PostgreSQL real. |
| **Alinhamento e blindagem das políticas RLS à regra discente (000008)** | `🟡 IMPLEMENTADO, MAS NÃO COMPROVADO` | Migration 000008 criada e validada estruturalmente em testes unitários, porém sem execução em PostgreSQL real. |
| **Execução de migration contra PostgreSQL real com conflitos simulados** | `🟡 IMPLEMENTADO, MAS NÃO COMPROVADO` | Sem Docker ou PostgreSQL local disponível no ambiente; Supabase remoto protegido contra comandos de escrita. |
| **Aplicação das migrations corretivas (000007 e 000008) no Supabase remoto** | `🟡 IMPLEMENTADO, MAS NÃO COMPROVADO` | Scripts gerados e versionados, mantidos sem execução no banco em nuvem por governança. |
| **Registro de histórico na tabela `supabase_migrations` remota** | `⚪ NÃO VERIFICADO` | Restrição de rede IPv6 na CLI (`DbConfigIpv6Error`) e PostgREST sem acesso ao schema interno. |
| **Versão da migration 000006 executada no Supabase** | `⚪ NÃO VERIFICADO` | Registrado formalmente como: `VERSÃO EXECUTADA NO SUPABASE: NÃO VERIFICADA`. |
| **Homologação editorial final das 10 questões complementares** | `❌ BLOQUEADO` | Depende exclusivamente da aprovação humana individual do Tech Lead. |

---

## 9. Bloqueadores Ainda Abertos

1. **Homologação Editorial Humana das 10 Questões Complementares (`sin-021` a `sin-030`):** O acervo discente local permanece rigorosamente com 20 questões aprovadas e 10 em revisão até a aprovação nominal humana do Tech Lead.
2. **Indisponibilidade Discente do Simulado Completo:** Como o simulado de 30 questões exige 30 questões aprovadas, a prova permanece indisponível por design, protegida por alertas acessíveis e bloqueio de rota direta.
3. **Execução das Migrations Corretivas no Supabase (000007 e 000008):** Os scripts cirúrgicos aguardam aprovação humana formal para serem rodados no console web do Supabase.

---

## 10. Parecer do Engenheiro

A branch `fix/T006-publicacao-segura-pos-merge` cumpriu todos os requisitos técnicos de segurança de publicação, blindagem das políticas RLS, integridade de migration, alinhamento normativo com o MBST/CTB e correção de gates da CI.

O Pull Request **não foi aberto** e a branch **não foi mergeada na main**. O trabalho permanece isolado e protegido na branch corretiva, aguardando a revisão técnica do Tech Lead.
