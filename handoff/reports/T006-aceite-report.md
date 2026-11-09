# Relatório de Auditoria, Aceite Editorial e Homologação Técnica — Fase 6 (T006 P0)
- **Data:** 09/11/2026
- **Tarefa:** T006 — Simulado Configurável (Saneamento P0 de Publicação, Integridade de Migrations e Auditoria Normativa)
- **Branch de Trabalho:** `fix/T006-publicacao-segura-pos-merge`
- **Base da Main:** `b31937f2755d98c9f6dd7eb72d1bc22121d9307a`
- **Commit Publicado Anterior:** `e379c834199ae3366d3fd34f31f738f491e7920f`
- **Repositório:** Juanzit/AprovaCNH
- **Responsável Técnico / Auditor:** Antigravity (Senior Software Engineer / Pair Programming)
- **Status do Merge na Main:** **NÃO MERGEADO** (Branch isolada preservada)
- **Status de Criação do PR:** **NÃO CRIADO** (Aguardando autorização explícita do Tech Lead)
- **Status da Fase 7 (Tutor de IA) e T007 (Dark Mode):** **BLOQUEADAS / NÃO INICIADAS**

---

## 1. Resumo Executivo e Estado Geral da T006

A presente auditoria técnica e saneamento de engenharia responde diretamente à revisão do Tech Lead sobre os bloqueadores identificados no commit `e379c83` e na execução da CI `42650237408`.

### A. Diagnóstico de Prontidão da T006
- **A T006 está pronta ou ainda não está pronta para homologação?**
  **A T006 está TECNICAMENTE PRONTA NO CÓDIGO E NA SUÍTE DE TESTES LOCAL**, porém **NÃO ESTÁ FORMALMENTE HOMOLOGADA PARA PRODUÇÃO**, pois existem bloqueadores editoriais de conteúdo que dependem de decisão humana do Tech Lead:
  1. O acervo possui atualmente **20 questões aprovadas** (`sin-001` a `sin-020`) e **10 questões em revisão** (`sin-021` a `sin-030`).
  2. Conforme as regras intransponíveis de segurança editorial (D010 e AGENTS.md), o sistema **recusa-se a gerar um simulado de 30 questões** enquanto não houver 30 questões aprovadas por humanos.
  3. Portanto, a aplicação apresenta corretamente o estado de **Indisponibilidade do Simulado Completo**, com o botão de início desabilitado e alertas acessíveis no lobby e na rota de prova.
  4. No banco de dados Supabase em nuvem, as questões `sin-021`..`sin-030` continuam registradas com `status = 'aprovada'` decorrente da carga manual inicial. Foi elaborada a migration incremental corretiva `20261109000007_remediate_sin_021_to_030_editorial_safety.sql`, mantida **estritamente sem execução remota**, aguardando aprovação humana.

---

## 2. P0 — Investigação e Correção Real da CI GitHub Actions

### 2.1 Causa Raiz da Falha na Execução #42650237408
- **URL da Execução:** [https://github.com/Juanzit/AprovaCNH/actions/runs/42650237408](https://github.com/Juanzit/AprovaCNH/actions/runs/42650237408)
- **Job ID:** `129274329516` ("Typecheck, Lint, Test & Build")
- **Passo Falho:** Passo 5 (`Install dependencies`) falhou em apenas 1 segundo, fazendo com que Typecheck, Lint, Testes e Build fossem ignorados (`skipped`).
- **Diagnóstico Técnico:**
  O arquivo `.github/workflows/ci.yml` utilizava a action `pnpm/action-setup@v3` com o parâmetro `version: 9`. Entretanto, o arquivo `package.json` declara explicitamente `"packageManager": "pnpm@12.18.0"` e o arquivo `pnpm-lock.yaml` foi gerado no formato do pnpm v12 (`lockfileVersion: '9.0'`, `pnpm: 12.18.0`). Ao executar `pnpm install --frozen-lockfile` com o pnpm 9 sobre um lockfile do pnpm 12, o gerenciador falhou imediatamente por incompatibilidade de versão do packageManager e do lockfile.

### 2.2 Correção Implementada no Workflow
No arquivo [`.github/workflows/ci.yml`](file:///c:/Projetos/AprovaCNH/.github/workflows/ci.yml):
1. Atualizada a action de setup para `pnpm/action-setup@v4`.
2. Definida a versão exata do pnpm para `12.18.0`, em total harmonia com o `package.json` e o ambiente de desenvolvimento local.
3. Protegido o teste de integração em nuvem `tests/integration/supabase-live.test.ts` para ignorar graciosamente conexões ao vivo quando executado em forks ou PRs que utilizam mock credentials (`mock.supabase.co`).

---

## 3. P0 — Inspeção Somente Leitura do Supabase Remoto e Gestão de Migrations

Conforme determinação expressa da Ordem de Serviço, **nenhuma migration foi executada remotamente**, **nenhum comando de escrita foi disparado** no Supabase e a inspeção foi realizada exclusivamente em modo somente leitura via API PostgREST:

### 3.1 Registro Separado dos Quatro Pontos de Auditoria
1. **Execução Manual Relatada:** O responsável pelo produto informou ter executado manualmente o script `20261108000006_add_questions_sin_021_to_030.sql` no SQL Editor do painel web do Supabase.
2. **Execução Exitosa Comprovada:** **COMPROVADA** no nível de dados. A consulta somente leitura retornou 30 registros na tabela `public.questions`, demonstrando que a inserção física das 10 linhas complementares ocorreu.
3. **Estado Atual das Dez Questões no Banco Remoto:**
   - As 10 questões (`sin-021` a `sin-030`) encontram-se atualmente com `status = 'aprovada'`, `is_example = false`.
   - Na tabela `question_sources`, todas as 10 possuem `verification_status = 'verified'`.
   - Na tabela `question_reviews`, todas as 10 possuem `approved_by = 'Tech Lead / Responsável pelo Produto'`.
   - *Nota de Auditoria:* Este estado é a aprovação automatizada que o Tech Lead não homologou individualmente. O banco remoto **não** reflete o saneamento para `em_revisao`.
4. **Registro no Histórico de Migrations (`supabase_migrations`):**
   - **`⚪ NÃO VERIFICADO`**. A tabela interna de controle de migrations não é exposta pelo schema PostgREST público (`Could not find the table 'public.supabase_migrations' in the schema cache`), e a CLI do Supabase local não conseguiu conectar diretamente à porta do Postgres devido à indisponibilidade de IPv6 na rede local (`DbConfigIpv6Error`). Portanto, não há comprovação verificável de registro na tabela de histórico de migrations.

### 3.2 Correção de Idempotência no SQL da Migration 000006
O arquivo [`supabase/migrations/20261108000006_add_questions_sin_021_to_030.sql`](file:///c:/Projetos/AprovaCNH/supabase/migrations/20261108000006_add_questions_sin_021_to_030.sql) foi reescrito adotando a **estratégia estritamente conservadora `ON CONFLICT DO NOTHING`** em todas as tabelas (`questions`, `question_sources`, `question_reviews`).
- Com `ON CONFLICT DO NOTHING`, uma reexecução acidental **jamais sobrescreverá** enunciados, alternativas, explicações, status, notas de revisão ou homologações humanas já existentes.

### 3.3 Nova Migration Corretiva Incremental Proposta (Não Aplicada)
Foi gerado o arquivo [`supabase/migrations/20261109000007_remediate_sin_021_to_030_editorial_safety.sql`](file:///c:/Projetos/AprovaCNH/supabase/migrations/20261109000007_remediate_sin_021_to_030_editorial_safety.sql) como proposta formal para aplicação futura.
- O script atualiza as 10 questões no banco com os textos e fontes normativas corrigidas e reverte o status para `em_revisao` e `approved_by = NULL`, **preservando qualquer aprovação humana real** que porventura já tenha sido registrada por credencial nominal diferente do texto fictício.
- O arquivo permanece no repositório **sem execução no Supabase**, aguardando autorização.

---

## 4. P0 — Elegibilidade de Publicação e Proteção de Todos os Caminhos

A regra inviolável de elegibilidade discente (`status === 'aprovada' && !isExample`) foi verificada e coberta por testes automatizados em todos os caminhos do software:

1. **Lições Interativas (`/licao/sinalizacao`):**
   - [`src/features/lesson/server/questionRepository.ts`](file:///c:/Projetos/AprovaCNH/src/features/lesson/server/questionRepository.ts) filtra no SQL por `.eq('status', 'aprovada').eq('is_example', false)` e aplica `isQuestionEligibleForStudents` em memória. Questões em revisão ou exemplos nunca são entregues à lição.
2. **Centro de Revisão Espaçada (SRS / `/revisao`):**
   - [`src/features/review/server/reviewRepository.ts`](file:///c:/Projetos/AprovaCNH/src/features/review/server/reviewRepository.ts) alimenta a fila diária e os diagnósticos de domínio exclusivamente a partir de questões retornadas por `getApprovedQuestionsByTopic()`. Itens em revisão não entram na fila de repetição espaçada.
3. **Fallback Local (`getFallbackApprovedQuestions`):**
   - Filtra o arquivo `questions-sinalizacao.json` com `isQuestionEligibleForStudents()`. Como as questões `sin-021`..`sin-030` possuem `status = 'em_revisao'`, o fallback entrega rigorosamente **apenas as 20 questões aprovadas** (`sin-001`..`sin-020`).
4. **Gerador de Simulado (`generateSimuladoQuestions`):**
   - Requer 30 questões aprovadas distintas. Se o acervo elegível tiver menos de 30 itens, lança `InsufficientApprovedQuestionsError`. Não há degradação permissiva para questões pendentes.
5. **Interface do Simulado (`/simulado` e `/simulado/prova`):**
   - O lobby consulta a contagem de aprovadas: se for inferior a 30, exibe o alerta acessível (`role="alert"`, `data-testid="simulado-insufficient-alert"`) e desabilita o CTA com `aria-disabled="true"`.
   - A rota de prova `/simulado/prova` intercepta `InsufficientApprovedQuestionsError` e renderiza tela explicativa de contingência com link de retorno ao lobby, sem tela branca nem crash.

---

## 5. P0 — Bateria de Testes do Gerador de Simulado (Os 7 Cenários)

A suíte [`tests/unit/simuladoGenerator.test.ts`](file:///c:/Projetos/AprovaCNH/tests/unit/simuladoGenerator.test.ts) implementa testes nominais para cada um dos 7 cenários exigidos:

| Cenário | Descrição do Teste | Comportamento Verificado | Status |
|---|---|---|---|
| **Cenário 1** | Pool com $\ge 30$ aprovadas distintas | Gera exatamente 30 itens únicos ordenados de 1 a 30, 100% aprovados e sem exemplos. | `✅ COMPROVADO` |
| **Cenário 2** | Pool com $< 30$ aprovadas | Lança `InsufficientApprovedQuestionsError` indicando exatamente `availableCount` e `requiredCount`. | `✅ COMPROVADO` |
| **Cenário 3** | Presença de questões pendentes | Pool com 29 aprovadas + pendentes (`em_revisao`/`rascunho`) recusa início e lança erro sem completar com pendentes. | `✅ COMPROVADO` |
| **Cenário 4** | Presença de suspensas ou rejeitadas | Questões com status `suspensa` ou `obsoleta` são descartadas pela filtragem de elegibilidade. | `✅ COMPROVADO` |
| **Cenário 5** | Presença de questões de exemplo | Questão com `status = 'aprovada'` mas `isExample = true` é estritamente excluída do pool. | `✅ COMPROVADO` |
| **Cenário 6** | IDs duplicados no pool de entrada | Pool de 35 itens contendo duplicatas é deduplicado, gerando 30 questões estritamente distintas. | `✅ COMPROVADO` |
| **Cenário 7** | Pool insuficiente pós-deduplicação | Pool com 35 itens brutos mas apenas 28 IDs distintos lança `InsufficientApprovedQuestionsError` (available: 28, required: 30). | `✅ COMPROVADO` |

---

## 6. P0 — Auditoria Normativa Individualizada e Coerência Total (JSON, SQL e Relatório)

Foi realizada a auditoria normativa das 10 questões complementares no arquivo [`src/data/questions-sinalizacao.json`](file:///c:/Projetos/AprovaCNH/src/data/questions-sinalizacao.json), eliminando todas as divergências históricas e contradições:

### Confronto Meticuloso das Questões `sin-021` a `sin-030`

#### Questão `sin-021`
- **Tópico:** Normas de Circulação | **Subtópico:** Distância de Segurança (CTB Art. 29, II)
- **Status:** `em_revisao` | **isExample:** `false` | **Gabarito:** `a`
- **Enunciado:** Ao transitar por qualquer via aberta à circulação, qual é o dever geral do condutor em relação à distância de segurança lateral e frontal e ao bordo da pista, segundo o Art. 29, II do CTB?
- **Fundamentação Normativa:** CTB Art. 29, II c/c Cartilha de Direção Defensiva da SENATRAN ("Trânsito seguro é um direito de todos" — Regra prática dos 2 segundos em piso seco).
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-e-cartilhas](https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-e-cartilhas)
- **Licença/Proveniência:** Dispositivos legais e materiais institucionais oficiais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.

#### Questão `sin-022`
- **Tópico:** Normas de Circulação | **Subtópico:** Uso de Luzes e Faróis Baixos (CTB Art. 40 • Lei nº 14.071/2020)
- **Status:** `em_revisao` | **isExample:** `false` | **Gabarito:** `c`
- **Enunciado:** De acordo com as normas atuais do CTB (alteradas pela Lei Federal nº 14.071/2020), em quais situações o uso de farol baixo aceso durante o dia é obrigatório para veículos que NÃO possuam luz de rodagem diurna (DRL)?
- **Fundamentação Normativa:** CTB Art. 40, I e § 2º (rodovias de pista simples fora de perímetro urbano, túneis e sob chuva, neblina ou cerração).
- **URL Oficial:** [https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm](https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm)

#### Questão `sin-023`
- **Tópico:** Normas de Circulação | **Subtópico:** Uso da Buzina e Sinalização R-20 (CTB Arts. 41 e 227, IV • Res. CONTRAN nº 973/2022)
- **Status:** `em_revisao` | **isExample:** `false` | **Gabarito:** `a`
- **Enunciado:** Em vias urbanas, em que condições o condutor pode fazer uso da buzina e quais restrições legais devem ser obrigatoriamente observadas (Arts. 41 e 227, IV do CTB e placa R-20 do MBST)?
- **Correção Normativa:** Corrigido expressamente do inciso V (padrões e frequências) para o **Art. 227, inciso IV** (locais e horários proibidos pela sinalização) c/c Sinal R-20 do MBST Volume I (Resolução CONTRAN nº 973/2022).
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito](https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito)

#### Questão `sin-024`
- **Tópico:** Sinalização Vertical | **Subtópico:** Placas de Regulamentação e Movimentos Proibidos (R-4a e R-5a / MBST Vol. I)
- **Status:** `em_revisao` | **isExample:** `false` | **Gabarito:** `a`
- **Enunciado:** Ao avistar a placa de regulamentação R-4a (Proibido Virar à Esquerda), qual é a regra técnica correta segundo o Volume I do Manual Brasileiro de Sinalização de Trânsito (MBST / Resolução CONTRAN nº 973/2022)?
- **Correção Normativa:** Distinção técnica exata: R-4a proíbe conversão à esquerda para outra via ou lote lindeiro, NÃO proibindo retorno (que exige sinal R-5a). Fonte: MBST Volume I, Anexo I da Resolução CONTRAN nº 973/2022.
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito](https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito)

#### Questão `sin-025`
- **Tópico:** Normas de Circulação | **Subtópico:** Velocidades Máximas em Vias Urbanas (CTB Art. 61, § 1º, I, 'b')
- **Status:** `em_revisao` | **isExample:** `false` | **Gabarito:** `b` (60 km/h)
- **Enunciado:** Em uma via arterial urbana onde NÃO existe sinalização regulamentadora de velocidade, qual é a velocidade máxima permitida pelo Código de Trânsito Brasileiro?
- **Fundamentação Normativa:** CTB Art. 61, § 1º, I, "b" (trânsito rápido: 80 km/h; arterial: 60 km/h; coletora: 40 km/h; local: 30 km/h).
- **URL Oficial:** [https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm](https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm)

#### Questão `sin-026`
- **Tópico:** Segurança e Transporte de Passageiros | **Subtópico:** Dispositivos de Retenção para Crianças (CTB Art. 64 • Res. CONTRAN nº 819/2021)
- **Status:** `em_revisao` | **isExample:** `false` | **Gabarito:** `a`
- **Enunciado:** Segundo o Art. 64 do CTB (com a redação da Lei Federal nº 14.071/2020) e a Resolução CONTRAN nº 819/2021, qual é a regra obrigatória para o transporte de crianças no banco traseiro em veículos automotores?
- **Correção Normativa:** Substituída a citação incorreta à Res. 938/2022 (cronotacógrafo) pela norma efetiva: **Resolução CONTRAN nº 819/2021** (dispositivos de retenção DRC para crianças menores de 10 anos que não tenham atingido 1,45m) c/c CTB Art. 64.
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/resolucoes-contran](https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/resolucoes-contran)

#### Questão `sin-027`
- **Tópico:** Segurança e Transporte de Passageiros | **Subtópico:** Transporte de Menores em Motocicletas (CTB Art. 244, V)
- **Status:** `em_revisao` | **isExample:** `false` | **Gabarito:** `a`
- **Enunciado:** Segundo o Art. 244, inciso V do CTB (com a redação dada pela Lei Federal nº 14.071/2020), qual é a regra para o transporte de crianças na garupa de motocicletas, motonetas ou ciclomotores?
- **Fundamentação Normativa:** CTB Art. 244, V (infração gravíssima transportar criança menor de 10 anos ou que não tenha condições de cuidar da própria segurança).
- **URL Oficial:** [https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm](https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm)

#### Questão `sin-028`
- **Tópico:** Sinalização Vertical | **Subtópico:** Conceito e Finalidade da Sinalização de Advertência (CTB Anexo II • MBST Vol. II)
- **Status:** `em_revisao` | **isExample:** `false` | **Gabarito:** `a`
- **Enunciado:** Qual é a finalidade principal das placas de sinalização de ADVERTÊNCIA (formato quadrado com diagonal vertical, fundo amarelo e orla/símbolo pretos) conforme o CTB e o Manual Brasileiro de Sinalização de Trânsito?
- **Fundamentação Normativa:** CTB Anexo II (item 1.2) c/c Manual Brasileiro de Sinalização de Trânsito — Volume II (Sinalização Vertical de Advertência / Resolução CONTRAN nº 973/2022).
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito](https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito)

#### Questão `sin-029`
- **Tópico:** Infrações e Medidas Administrativas | **Subtópico:** Diferença entre Penalidades e Medidas Administrativas (CTB Arts. 256 e 269)
- **Status:** `em_revisao` | **isExample:** `false` | **Gabarito:** `b`
- **Enunciado:** No âmbito do Código de Trânsito Brasileiro, qual é a diferença fundamental entre uma Penalidade e uma Medida Administrativa?
- **Fundamentação Normativa:** CTB Art. 256 (penalidades aplicadas pela autoridade de trânsito em processo administrativo) vs CTB Art. 269 (medidas administrativas de caráter imediato/preventivo aplicadas pelo agente na via).
- **URL Oficial:** [https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm](https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm)

#### Questão `sin-030`
- **Tópico:** Normas de Circulação | **Subtópico:** Prioridade de Passagem e Veículos de Emergência (CTB Art. 29, VII)
- **Status:** `em_revisao` | **isExample:** `false` | **Gabarito:** `a`
- **Enunciado:** Ao perceber a aproximação de veículo de socorro de incêndio, polícia ou ambulância em serviço de urgência com dispositivos sonoros (sirene) e luminosos intermitentes acionados, qual conduta deve ser adotada por condutores e pedestres segundo o Art. 29, VII do CTB?
- **Fundamentação Normativa:** CTB Art. 29, VII (livre passagem pela faixa da esquerda, deslocamento para a direita e parada se necessário; pedestres aguardam no passeio).
- **URL Oficial:** [https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm](https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm)

---

## 7. Resultados Reais dos Testes e Comandos Locais

Todos os comandos foram executados no repositório local e obtiveram os seguintes resultados literais:

### 7.1 `pnpm typecheck`
- **Comando:** `pnpm typecheck` (`tsc --noEmit`)
- **Resultado:** **APROVADO (Exit Code 0)**
- **Tempo:** 3.1s | **Erros:** 0

### 7.2 `pnpm lint`
- **Comando:** `pnpm lint` (`eslint .`)
- **Resultado:** **APROVADO (Exit Code 0)**
- **Tempo:** 6.8s | **Problemas:** 0 erros, 0 avisos

### 7.3 `pnpm test` (Vitest Unit & Integration)
- **Comando:** `pnpm test` (`vitest run`)
- **Resultado:** **APROVADO (Exit Code 0)**
- **Tempo:** 19.43s
- **Estatística Real:** **22 arquivos de teste aprovados, 125 testes aprovados (100%)**
- **Cobertura Comprovada:**
  - `tests/unit/simuladoGenerator.test.ts` (13 testes): cobre os 7 cenários obrigatórios de elegibilidade, deduplicação, erro de acervo e avaliação pedagógica D007.
  - `tests/unit/publicationSecurity.test.ts` (7 testes): comprova a regra de elegibilidade nos caminhos de Lições, Revisão SRS, Fallback e Simulado.
  - `tests/unit/migrationIntegrity.test.ts` (4 testes): valida `ON CONFLICT DO NOTHING`, transação `BEGIN...COMMIT` e ausência de dados fictícios.
  - `tests/integration/supabase-live.test.ts` (1 teste): auditoria ao vivo da base Supabase em nuvem.
  - Demais suítes de componentes e algoritmos (100 testes): 100% aprovados.

### 7.4 `pnpm test:e2e` (Playwright End-to-End)
- **Comando:** `pnpm test:e2e` (`playwright test`)
- **Resultado:** **APROVADO (Exit Code 0)**
- **Tempo:** 25.3s (2 workers paralelos)
- **Estatística Real:** **28 testes aprovados (14 Desktop Chrome + 14 Mobile Chrome Pixel 5)**
- **Cenários do Simulado Validados na UI Real:**
  1. `lobby /simulado`: exibe regras e renderiza alerta `data-testid="simulado-insufficient-alert"` com botão `start-simulado-cta` desabilitado ("Simulado Indisponível (20/30 questões aprovadas)").
  2. `rota /simulado/prova`: bloqueia prova sem estoque e renderiza alerta explicativo de acervo em homologação com link funcional de retorno ao lobby.
  3. `tempo estendido PCD/TEA`: seleção de 120 minutos (Art. 33, § 2º) com o botão devidamente protegido contra disparo prematuro.

### 7.5 `pnpm build` (Next.js Turbopack)
- **Comando:** `pnpm build` (`next build`)
- **Resultado:** **APROVADO (Exit Code 0)**
- **Tempo:** 1.06s compilação + 2.8s TypeScript + 874ms estáticos | **Páginas:** 10/10 geradas.

---

## 8. Matriz de Aceite Técnica e Editorial (Classificação Estrita)

Conforme orientação do Tech Lead, cada critério é avaliado sob categorias estritas:

| Critério de Homologação | Categoria | Evidência Comprobatória |
|---|---|---|
| **Regra central de elegibilidade discente (`status === 'aprovada' && !isExample`)** | `✅ COMPROVADO` | Validado em `questionSchema.test.ts`, `publicationSecurity.test.ts` e repositórios. |
| **Proteção de Lições contra questões não aprovadas** | `✅ COMPROVADO` | Validado em `publicationSecurity.test.ts` e `questionRepository.test.ts`. |
| **Proteção do SRS contra questões não aprovadas** | `✅ COMPROVADO` | Validado em `publicationSecurity.test.ts` e `reviewRepository.test.ts`. |
| **Proteção do Fallback local contra vazamento de `em_revisao`** | `✅ COMPROVADO` | `getFallbackApprovedQuestions()` retorna exatamente 20 aprovadas e zero em revisão. |
| **Gerador de Simulado: erro controlado se $< 30$ aprovadas** | `✅ COMPROVADO` | `simuladoGenerator.test.ts` (Cenários 2 e 7) valida `InsufficientApprovedQuestionsError`. |
| **Gerador de Simulado: deduplicação por ID e exclusão de pendentes/exemplos** | `✅ COMPROVADO` | `simuladoGenerator.test.ts` (Cenários 3, 4, 5 e 6). |
| **Interface do Simulado: apresentação clara de indisponibilidade** | `✅ COMPROVADO` | Playwright E2E Desktop e Mobile validam alerta no lobby, CTA desabilitado e tela de contingência. |
| **Coerência e exatidão normativa de `sin-021` a `sin-030` (JSON e SQL)** | `✅ COMPROVADO` | Correções efetuadas no JSON e no SQL; URLs específicas e vigências verificadas. |
| **Coerência entre Relatório, JSON e SQL** | `✅ COMPROVADO` | Tabela reconstruída 100% alinhada com os dados reais do acervo. |
| **Estratégia não destrutiva `ON CONFLICT DO NOTHING` na migration 000006** | `✅ COMPROVADO` | Validado em `migrationIntegrity.test.ts`; impossibilidade matemática de sobrescrita. |
| **Execução de migration contra PostgreSQL real com conflitos simulados** | `🟡 IMPLEMENTADO, MAS NÃO COMPROVADO` | A infraestrutura local não dispõe de PostgreSQL local ou Docker; Supabase remoto protegido contra escrita. |
| **Registro de histórico na tabela `supabase_migrations` remota** | `⚪ NÃO VERIFICADO` | Falha de conectividade IPv6 direta da CLI e tabela interna não exposta no PostgREST. |
| **Aplicação da migration corretiva 000007 no Supabase remoto** | `🟡 IMPLEMENTADO, MAS NÃO COMPROVADO` | Script gerado e versionado, porém não aplicado para respeitar a governança do banco. |
| **Execução dos 5 gates de CI no GitHub Actions com pnpm 12** | `🟡 IMPLEMENTADO, MAS NÃO COMPROVADO` | Configuração corrigida em `.github/workflows/ci.yml`; aguarda commit e push para disparar o run remoto. |
| **Homologação editorial final das 10 questões complementares** | `❌ BLOQUEADO` | Requer aprovação humana individualizada pelo Tech Lead. |
