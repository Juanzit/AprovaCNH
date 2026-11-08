# Plano Técnico — Fase 6 (T006: Simulado Configurável)

- **Data:** 08/11/2026
- **Branch:** `feat/T006-simulado`
- **Autor:** Engenheiro de Software Sênior (Antigravity)
- **Status do Plano:** AGUARDANDO APROVAÇÃO (Porta D010)

---

## 1. Contexto, Motivação e Resolução Normativa

Com a homologação das 20 questões no estilo prático da prova teórica de 1ª Habilitação do DETRAN-MG / SENATRAN (BNQ), a padronização da UF padrão em `MG` e a conclusão das Fases 4, 5 e 5.1, o **AprovaCNH** atinge o momento ideal para implementar a experiência de exame simulado completo.

### 1.1. Resolução da Regra D007 (Resolução CONTRAN nº 1.020/2025)
A regra **D007**, anteriormente pendente, foi formalmente decidida e parametrizada com base na legislação federal vigente (**Resolução CONTRAN nº 1.020/2025**, combinada com as diretrizes do Banco Nacional de Questões da SENATRAN):
1. **Total de questões:** 30 questões objetivas de múltipla escolha (4 alternativas cada).
2. **Tempo de duração:** 60 minutos (cronômetro regressivo).
3. **Nota de corte para aprovação:** 20 acertos (aproveitamento mínimo de aproximadamente 70% exigido pelo CTB).
4. **UF padrão:** `MG` (Minas Gerais / DETRAN-MG), com suporte a regras estaduais customizadas caso homologadas no futuro.

### 1.2. Princípio da "Prova Real" (Simulado Autêntico)
Diferente das lições guiadas e dos treinos de repetição espaçada (SRS), onde o aluno recebe feedback imediato e micro-aulas a cada questão, o **Simulado Configurável** simula estritamente a experiência do exame oficial do DETRAN:
- **Zero feedback durante a execução:** o aluno não sabe se acertou ou errou até entregar a prova.
- **Navegação bidirecional livre:** o estudante pode pular, retroceder, marcar questões com bandeira ("Marcar para Revisar") e alterar qualquer resposta a qualquer momento dentro dos 60 minutos.
- **Gabarito e diagnóstico pedagógico pós-prova:** revelação completa apenas após a submissão, com nota, tempo gasto, status (Aprovado/Reprovado), filtro de erros e fundamentação legal comentada item por item.

---

## 2. Arquitetura de Dados no Supabase (Migration SQL)

Para garantir segurança, integridade e versionamento dos parâmetros regulatórios, projetamos três novas estruturas relacionais protegidas por RLS.

### 2.1. Tabela `exam_configs` (Parâmetros Regulatórios Versionados)
Registra as configurações oficiais do exame por UF e vigência, evitando regras estáticas "hardcoded" no código:

```sql
CREATE TABLE public.exam_configs (
    id TEXT PRIMARY KEY,                       -- Ex: 'detran-mg-default'
    name TEXT NOT NULL,                        -- Ex: 'DETRAN-MG / SENATRAN 1ª Habilitação'
    uf VARCHAR(2) DEFAULT 'MG',                -- UF do estado ('MG' ou NULL para Nacional)
    total_questions INTEGER NOT NULL DEFAULT 30,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    passing_score INTEGER NOT NULL DEFAULT 20,
    normative_act TEXT NOT NULL,               -- Ex: 'Resolução CONTRAN nº 1.020/2025'
    effective_from DATE NOT NULL,              -- Data de início da vigência
    effective_until DATE,                      -- Data de término da vigência (NULL se vigente)
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### 2.2. Tabela `simulado_sessions` (Sessões de Exame do Aluno)
Registra o ciclo de vida de cada tentativa de simulado:

```sql
CREATE TABLE public.simulado_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL no modo visitante
    config_id TEXT NOT NULL REFERENCES public.exam_configs(id),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    finished_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 30,
    score INTEGER DEFAULT 0,
    passing_score INTEGER NOT NULL DEFAULT 20,
    is_approved BOOLEAN,
    status TEXT NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'completed', 'abandoned', 'timed_out')),
    xp_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### 2.3. Tabela `simulado_answers` (Gabarito da Tentativa)
Persiste a ordem sorteada das questões e as respostas escolhidas pelo estudante:

```sql
CREATE TABLE public.simulado_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulado_id UUID NOT NULL REFERENCES public.simulado_sessions(id) ON DELETE CASCADE,
    question_id VARCHAR(64) NOT NULL REFERENCES public.questions(id),
    question_order INTEGER NOT NULL,            -- 1 a 30
    selected_option_id VARCHAR(10),             -- 'a', 'b', 'c', 'd' ou NULL se deixada em branco
    is_marked_for_review BOOLEAN DEFAULT false, -- Flag visual de revisão pelo aluno
    is_correct BOOLEAN,                         -- Calculado no servidor no momento da submissão
    answered_at TIMESTAMPTZ
);
```

### 2.4. Políticas de Segurança (Row Level Security - RLS)
- `exam_configs`: Leitura pública (`anon` e `authenticated`). Escrita restrita a administradores.
- `simulado_sessions`:
  - `SELECT`: `auth.uid() = user_id` (para usuários autenticados).
  - `INSERT`: `auth.uid() = user_id` (ou autenticado).
  - `UPDATE`: `auth.uid() = user_id`.
- `simulado_answers`:
  - `SELECT`, `INSERT`, `UPDATE`: permitidos apenas se `EXISTS (SELECT 1 FROM public.simulado_sessions WHERE id = simulado_id AND user_id = auth.uid())`.
- **Modo Visitante:** Tratamento em memória / `sessionStorage` no navegador com avaliação idêntica via Server Action, assegurando que o usuário não cadastrado usufrua da simulação sem bloqueios ou falhas de permissão.

---

## 3. Lógica de Seleção de Questões e Gestão do Banco

### 3.1. Algoritmo de Seleção Aleatória do Exame
A função de geração do simulado (`generateSimuladoQuestions`) deve selecionar 30 questões do banco aprovado com as seguintes regras determinísticas:
1. **Filtro de Escopo Federativo:** Questões com `ufs @> ARRAY['MG']` ou `ufs = '{}'` (escopo nacional).
2. **Status Aprovado:** Apenas questões com `status = 'aprovada'` e `is_example = false`.
3. **Distribuição Equilibrada:**
   - O banco atual possui 20 questões homologadas na Unidade 1 de Sinalização e Normas (`sin-001` a `sin-020`).
   - Para compor o exame completo de 30 questões de acordo com a norma CONTRAN 1.020/2025:
     - **Estratégia de Amostragem do MVP:** Seleciona as 20 questões homologadas da Unidade 1 e, caso o banco possua menos de 30 questões cadastradas, complementa deterministicamente com embaralhamento pseudo-aleatório seguro das questões do banco aprovado, garantindo sempre um array de 30 itens com ordenação aleatória das alternativas (`options`).
     - **Extensibilidade:** Assim que novas unidades forem adicionadas (Direção Defensiva, Primeiros Socorros, Meio Ambiente e Mecânica Básica), o mesmo gerador distribuirá as 30 questões proporcionalmente aos temas oficiais do exame teórico (ex: 12 Sinalização/Legislação, 8 Direção Defensiva, 4 Primeiros Socorros, 3 Meio Ambiente/Cidadania, 3 Mecânica Básica).

---

## 4. Experiência de Usuário e Interface Mobile-First da Prova Real

A interface do simulado será desenhada para oferecer precisão ergonômica tanto em telas mobile compactas (320px–396px) quanto no desktop (container centralizado `max-w-3xl`).

### 4.1. Cronômetro Regressivo Resiliente (60 Minutos)
- **Cálculo Baseado em Timestamp Absoluto:** O cronômetro não dependerá unicamente de `setInterval`, pois navegadores mobile congelam timers em segundo plano quando a tela apaga ou o usuário alterna de app.
  - A sessão armazena `started_at` e `duration_seconds = 3600`.
  - A cada tick e ao focar novamente na janela (`visibilitychange`), o tempo restante é recalculado:
    $$\text{tempo\_restante} = 3600 - \lfloor(\text{Date.now()} - \text{started\_at}) / 1000\rfloor$$
- **Alertas Visuais Acessíveis:**
  - Acima de 5 minutos: mostrador neutro cinza/azul (`MM:SS`).
  - Menos de 5 minutos: mostrador âmbar de atenção (`text-amber-600 font-bold`).
  - Menos de 1 minuto: mostrador vermelho piscante suave (`text-red-600 animate-pulse`).
- **Auto-Submissão:** Ao atingir `00:00`, a prova é submetida automaticamente com o status `'timed_out'`, garantindo que todas as questões já marcadas sejam devidamente computadas sem perda de dados.

### 4.2. Grade / Gaveta de Navegação Rápida (1 a 30)
- Um botão discreto no topo permite abrir a **Gaveta de Questões** (`SimuladoNavDrawer`), exibindo uma grade 5x6 com os 30 botões numerados.
- Cada número possui um indicador semântico acessível:
  - ⚪ **Não respondida:** borda cinza, fundo branco.
  - 🔵 **Respondida:** fundo azul com texto branco.
  - 🚩 **Marcada para Revisar:** ícone de bandeira âmbar, facilitando retornar antes de finalizar.
  - 📍 **Questão Atual:** anel de foco destacado (`ring-2 ring-blue-500`).

### 4.3. Interface de Resolução Sem Feedback
- Renderiza a questão atual, o enunciado com alta legibilidade e as 4 opções de resposta.
- Barra inferior com ações ergonômicas de toque:
  - Botão `← Anterior` (desabilitado na questão 1).
  - Botão `Marcar para revisar 🚩` (alterna estado da bandeira).
  - Botão `Próxima →` (ou `Finalizar Simulado` na questão 30).
- **Acessibilidade:** Navegação completa por teclado (teclas `1-4` ou `A-D` para selecionar alternativas, setas esquerda/direita para navegar entre questões).

### 4.4. Modais de Confirmação Acessíveis
- Ao clicar em "Finalizar Simulado":
  - Se houver questões em branco: alerta explícito modal: *"Atenção: você ainda tem X questão(ões) sem resposta. Deseja entregar a prova mesmo assim?"*.
  - Se todas estiverem respondidas: modal de confirmação: *"Deseja encerrar o simulado e ver o gabarito oficial?"*.

---

## 5. Tela de Resultado, Gabarito Comentado e Gamificação

### 5.1. Painel de Status do Resultado
- **Aprovado ($\ge 20$ acertos):**
  - Banner verde esmeralda com selo **"APROVADO NO SIMULADO!"**.
  - Mensagem: *"Parabéns! Você alcançou a pontuação mínima de corte exigida pela Resolução CONTRAN nº 1.020/2025 para a prova do DETRAN-MG."*
  - Recompensa gamificada: **+100 XP** e incremento no streak diário.
- **Reprovado ($< 20$ acertos):**
  - Banner âmbar/vermelho com selo **"NÃO ATINGIU O CORTE"**.
  - Mensagem: *"Você acertou X de 30 questões. A nota de corte é de 20 acertos (70%). Não desanime: use o gabarito abaixo para revisar seus pontos fracos e tente novamente!"*
  - Recompensa de esforço: **+30 XP** (pelo tempo dedicado de estudo).

### 5.2. Métricas Consolidadas do Exame
- **Pontuação:** `X / 30` (Aproveitamento percentual `Y%`).
- **Tempo Utilizado:** `MM min SS seg` de 60 min.
- **Data e Hora:** formato `DD/MM/AAAA às HH:mm`.
- **Regulamento Oficial:** badge explicativo `Resolução CONTRAN nº 1.020/2025 • DETRAN-MG / SENATRAN`.

### 5.3. Gabarito Interativo Pós-Prova
- Filtros rápidos em abas:
  - `Todas (30)`
  - `Apenas Erros (X)`
  - `Apenas Acertos (Y)`
- Para cada questão no gabarito:
  - Enunciado e indicação da alternativa escolhida vs. alternativa correta.
  - **Micro-aula explicativa:** bloco didático explicando por que a resposta oficial está correta.
  - **Fundamentação legal primária:** dispositivo do CTB ou Resolução CONTRAN associada.

---

## 6. Fluxo de Navegação e Rotas (Next.js App Router)

| Rota | Descrição |
| :--- | :--- |
| `/simulado` | **Lobby de Apresentação:** Explica as regras oficiais (30 questões, 60 min, 20 acertos), histórico recente de simulados e botão primário em destaque `Iniciar Simulado Oficial (60 min)`. |
| `/simulado/prova` | **Ambiente da Prova:** Tela imersiva sem distrações com cronômetro regressivo, grade de navegação e resolução sem feedback imediato. |
| `/simulado/resultado/[id]` | **Resultado e Gabarito:** Relatório completo de pontuação, status de aprovação, micro-aulas comentadas e botão de retorno ou novo simulado. |
| `/simulado/historico` | **Histórico de Simulados:** Listagem cronológica dos simulados realizados pelo estudante com gráficos de evolução de nota. |

---

## 7. Estrutura de Arquivos Planejada

```
src/
├── features/
│   └── simulado/
│       ├── types/
│       │   └── simulado.ts               # Tipos e Schemas Zod (Config, Session, Answer, Result)
│       ├── server/
│       │   ├── simuladoRepository.ts     # Acesso ao Supabase (geração, submissão, histórico)
│       │   └── simuladoActions.ts        # Server Actions seguras com validação no servidor
│       ├── utils/
│       │   └── simuladoGenerator.ts      # Embaralhamento e seleção determinística de 30 questões
│       └── components/
│           ├── SimuladoTimer.tsx         # Cronômetro regressivo baseado em timestamp
│           ├── SimuladoNavDrawer.tsx     # Grade acessível 1-30 com flags e status
│           ├── SimuladoQuestionCard.tsx  # Apresentação da questão e opções de resposta
│           ├── SimuladoFinishModal.tsx   # Modal de confirmação (com alerta de questões em branco)
│           ├── SimuladoResultSummary.tsx # Banner Aprovado/Reprovado, pontuação e tempo
│           └── SimuladoReviewList.tsx    # Gabarito pós-prova comentado com filtros
├── app/
│   ├── simulado/
│   │   ├── page.tsx                      # Lobby do Simulado (Regras D007 e CTA)
│   │   ├── prova/
│   │   │   └── page.tsx                  # Execução da Prova Real
│   │   ├── resultado/
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Gabarito e Resultado Final
│   │   └── historico/
│   │       └── page.tsx                  # Histórico de Simulados
supabase/
└── migrations/
    └── 20261108000005_create_simulado_schema.sql # Tabelas exam_configs, simulado_sessions e simulado_answers
```

---

## 8. Estratégia de Testes Automatizados

1. **Testes Unitários (`tests/unit/`):**
   - Validação dos Schemas Zod do simulado (rejeição de notas inválidas, tempos negativos).
   - Teste unitário do gerador de questões (garante 30 itens, unicidade/distribuição e consistência).
   - Teste unitário do cálculo de aprovação (garante aprovado para $\ge 20$ e reprovado para $\le 19$).
   - Teste unitário da Server Action de submissão (cálculo autoritativo de nota e XP no servidor).
2. **Testes de Componentes (`tests/components/`):**
   - `SimuladoTimer.test.tsx`: contagem regressiva, cores de alerta aos 5 min e aos 1 min, disparo de callback ao zerar.
   - `SimuladoNavDrawer.test.tsx`: reflexo do status das 30 questões (respondida, em branco, marcada para revisão).
   - `SimuladoFinishModal.test.tsx`: alerta para questões em branco e disparo da submissão.
   - `SimuladoResultSummary.test.tsx`: exibição correta do status Aprovado vs. Reprovado e tempo formatado.
3. **Testes End-to-End Playwright (`tests/e2e/simulado-flow.spec.ts`):**
   - Fluxo completo no Desktop Chrome e Mobile Chrome:
     1. Navegar até `/simulado` e validar regras da Resolução 1.020/2025.
     2. Iniciar a prova em `/simulado/prova`.
     3. Responder questões, marcar 1 para revisão e verificar atualização na gaveta de navegação.
     4. Concluir a prova com mais de 20 acertos e verificar status "APROVADO".
     5. Validar exibição do gabarito comentado pós-prova.

---

## 9. Próximos Passos (Porta de Aprovação D010)

> [!IMPORTANT]
> **PARE E AGUARDE (Regra D010):** Nenhuma alteração no código da aplicação web (`src/`) ou no banco (`supabase/migrations/`) será realizada antes da aprovação explícita deste plano pelo responsável pelo produto.
>
> Assim que aprovado:
> 1. Criaremos a migration `20261108000005_create_simulado_schema.sql`.
> 2. Implementaremos os componentes, Server Actions e rotas do Simulado.
> 3. Escreveremos e executaremos toda a suíte de testes (Vitest + Playwright).
