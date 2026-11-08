# Plano Técnico — Fase 5 (T005: Revisão Espaçada e Domínio por Assunto)

**Data:** 08/11/2026
**Branch:** `feat/T005-revisao-espacada`
**Autor:** Engenheiro de Software Sênior (Antigravity)
**Status do Plano:** AGUARDANDO APROVAÇÃO (Porta D010)

---

## 1. Contexto e Motivação

Com a conclusão da **Fase 4 (T004)**, o AprovaCNH possui:
- 20 questões oficiais da MBFT homologadas e cadastradas no Supabase.
- Trilha temática (Unidade 1) com 4 sessões em Livre Acesso (D016).
- Histórico auditável de tentativas persistido na tabela `user_answers`.
- Extrato de XP com validação de primeira conclusão (D017) e streak diário temporal em `America/Sao_Paulo`.

Na **Fase 5 (T005)**, o objetivo pedagógico central é evitar a curva do esquecimento do estudante por meio de **Revisão Espaçada Determinística (Spaced Repetition System — SRS)** e **Diagnóstico de Domínio por Assunto/Artigo**.

Conforme estabelecido taxativamente no documento `handoff/roadmap/FASES.md`:
> *"Regra: revisão espaçada é primeiro um algoritmo determinístico, não um agente de IA."*
> *"Saída: aluno recebe fila de revisão explicável e reproduzível."*

Este plano técnico projeta uma solução 100% reproduzível, explicável, performática e aderente à stack Next.js 16 + TypeScript strict + Supabase + Tailwind CSS 4.

---

## 2. Modelo Matemático Determinístico de Repetição Espaçada (SRS)

O algoritmo processa o histórico de `user_answers` de cada questão respondida pelo aluno e calcula duas métricas determinísticas fundamentais:
1. **Prioridade de Revisão ($P$):** quão urgente é reapresentar a questão na fila de estudo.
2. **Índice de Domínio por Subtema ($D$):** percentual de retenção e maestria do estudante em cada dispositivo legal.

### 2.1. Métricas Base por Questão ($q$)

Para cada questão $q$ respondida pelo estudante:
- $N_q$: total de tentativas históricas ($N_q \ge 1$).
- $C_q$: total de tentativas corretas.
- $E_q$: total de tentativas incorretas ($E_q = N_q - C_q$).
- $\text{Taxa de Erro}_q = \frac{E_q}{N_q} \in [0, 1]$.
- $\text{Último Resultado}_q \in \{0, 1\}$ (1 para acerto, 0 para erro).
- $\text{Data da Última Resposta}_q$: timestamp $t_{last}$.
- $\Delta t$: tempo decorrido desde a última resposta em dias decimais:
  $$\Delta t = \frac{t_{agora} - t_{last}}{86.400.000\text{ ms}}$$
- $S_{consec}$: sequência ininterrupta de acertos recentes na questão (reinicia para 0 imediatamente ao cometer um erro).

### 2.2. Intervalos Determinísticos de Fixação ($I$)

Inspirado no modelo de Leitner com intervalos calibrados para a prova teórica da CNH (ciclo rápido de 3 a 4 semanas de preparação):

| Acertos Consecutivos ($S_{consec}$) | Intervalo Ideal de Revisão ($I$) | Classificação de Memória |
|---|---|---|
| **0 acertos** (última tentativa foi erro) | **0 dias** (imediato / mesmo dia) | 🔴 Frágil / Em falha |
| **1 acerto consecutivo** | **1 dia** (24 horas) | 🟡 Em consolidação inicial |
| **2 acertos consecutivos** | **3 dias** (72 horas) | 🟡 Em fixação intermediária |
| **3 acertos consecutivos** | **7 dias** (168 horas) | 🟢 Estável |
| **4 ou mais acertos** | **14 dias** (336 horas) | 🟢 Memória consolidada |

### 2.3. Cálculo da Prioridade de Revisão ($P_q$)

A pontuação de prioridade $P_q \in [0, 200+]$ define a ordem estrita da fila de estudo. Quanto **maior** o valor de $P_q$, mais urgente é a revisão daquela questão:

$$P_q = W_{status} + W_{erro} + W_{atraso}$$

Onde:
1. **Peso do Status Imediato ($W_{status}$):**
   - Se o último resultado foi **ERRO** ($\text{Último Resultado}_q = 0$): $W_{status} = 100$.
   - Se o último resultado foi **ACERTO** ($\text{Último Resultado}_q = 1$): $W_{status} = 0$.
   *(Garante que qualquer questão errada recentemente passe imediatamente à frente de questões já acertadas).*

2. **Peso do Histórico de Erros ($W_{erro}$):**
   $$W_{erro} = 40 \times \text{Taxa de Erro}_q$$
   *(Adiciona até 40 pontos de urgência para questões com reincidência de erros ao longo do tempo).*

3. **Peso do Atraso Temporal ($W_{atraso}$):**
   - Se $\Delta t \ge I$ (questão venceu seu ciclo de espaçamento):
     $$W_{atraso} = 30 \times \left(1 + \frac{\Delta t - I}{I + 1}\right)$$
   - Se $\Delta t < I$ (ainda dentro do período de retenção):
     $$W_{atraso} = 0$$

4. **Critério de Desempate (Determinístico):**
   - Em caso de pontuações $P_q$ idênticas, a questão com menor $\text{Data da Última Resposta}_q$ (estudada há mais tempo) é exibida primeiro.

### 2.4. Motivos Pedagógicos Explicáveis (Transparência ao Aluno)

Cada item na fila de revisão apresenta um rótulo legível e justificativa determinística:
- Se $W_{status} = 100$: *"Você errou esta questão na última tentativa"*
- Se $\Delta t \ge I$ e $S_{consec} > 0$: *"Venceu o intervalo de revisão (${I}$ dias sem praticar)"*
- Se $E_q \ge 2$: *"Tópico com histórico de reincidência de erros"*

---

## 3. Diagnóstico e Cálculo de Domínio por Subtema e Artigo

O AprovaCNH mapeia cada questão a um `subtopic` oficial e dispositivo legal primário (`source.provision` / Fichas do MBFT):
- **Sessão 1:** Art. 195 (Prevalência do Agente — Ficha 583-50)
- **Sessão 2:** Art. 196 (Início de Marcha e Parada — Fichas 584-31 e 584-32)
- **Sessão 3:** Art. 196 (Mudança de Direção e Faixa — Fichas 584-33 e 584-34)
- **Sessão 4:** Art. 208 (Sinal Vermelho e Parada Obrigatória — Fichas 605-01 e 605-02)

### 3.1. Fórmula de Domínio da Questão ($D_q$)
Para evitar que erros antigos penalizem perpetuamente o estudante quando ele já aprendeu o conteúdo, o domínio individual combina o **estado atual** com o **histórico**:

$$D_q = 0.7 \times (\text{Último Resultado}_q \times 100) + 0.3 \times \left(\frac{C_q}{N_q} \times 100\right)$$

- Se o estudante errou no passado ($1/3$ acertos = $33\%$), mas acertou as duas últimas revisões, seu domínio atual da questão sobe para:
  $$D_q = 0.7 \times 100 + 0.3 \times 60\% = 70 + 18 = 88\%$$
- Se o estudante nunca respondeu à questão: $D_q = 0\%$ (Não praticada).

### 3.2. Fórmula de Domínio do Subtema ($D_{subtema}$)
$$D_{subtema} = \frac{\sum_{q \in subtema} D_q}{N_{questões\_no\_subtema}}$$

### 3.3. Faixas Diagnósticas (Semânticas e Acessíveis)
- 🔴 **Crítico (< 60%):** Dispositivo legal com retenção baixa ou dúvidas ativas. Marcado com ícone de alerta e destaque vermelho/laranja.
- 🟡 **Em Progresso (60% a 79%):** Dispositivo em fase de fixação. Marcado com ícone de livro/progresso e destaque âmbar/amarelo.
- 🟢 **Dominado ($\ge$ 80%):** Domínio sólido comprovado por acertos recentes e consistência. Marcado com ícone de check e destaque verde.

---

## 4. Arquitetura da Interface Mobile-First & Acessibilidade

### 4.1. Nova Rota `/revisao` (Painel de Domínio & Fila de Repetição)
A interface será implementada mobile-first seguindo as diretrizes de contraste, alvos de toque ($\ge 44 \times 44\text{px}$) e conformidade WAI-ARIA:

```
┌────────────────────────────────────────────────────────┐
│  ← Voltar ao Início          [ Perfil ]                │
├────────────────────────────────────────────────────────┤
│  🎯 Centro de Revisão & Domínio                        │
│  Pratique seus pontos fracos e fixe as normas do MBFT. │
├────────────────────────────────────────────────────────┤
│  ⚡ REVISÃO INTELIGENTE RECOMENDADA                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 5 questões prioritárias precisam de atenção      │  │
│  │ 2 erros recentes • 3 revisões vencidas           │  │
│  │ [ ▶ Iniciar Treino de Revisão (5 Questões) ]     │  │
│  └──────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│  📊 Diagnóstico de Domínio por Dispositivo Legal       │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Art. 195: Ordens do Agente (MBFT 583-50)         │  │
│  │ Progresso: 85%  [ 🟢 Dominado ]                  │  │
│  │ [████████████████████████████████░░░░░░]         │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Art. 196: Início de Marcha e Parada (584-31/32)  │  │
│  │ Progresso: 50%  [ 🔴 Crítico — 2 erros ]         │  │
│  │ [██████████████████░░░░░░░░░░░░░░░░░░░░]         │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Art. 196: Mudança de Direção (584-33/34)         │  │
│  │ Progresso: 70%  [ 🟡 Em Progresso ]              │  │
│  │ [██████████████████████████░░░░░░░░░░░░]         │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Art. 208: Sinal Vermelho e Parada (605-01/02)    │  │
│  │ Progresso: 0%   [ ⚪ Não Praticado ]             │  │
│  │ [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]         │  │
│  └──────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│  📋 Fila Detalhada de Questões                         │
│  - sin-003 • Art. 196 • Errado há 2 dias • [Revisar]   │
│  - sin-008 • Art. 196 • Venceu ciclo (3 dias) • [...]  │
└────────────────────────────────────────────────────────┘
```

### 4.2. Fluxo do Modo de Prática de Revisão (`/revisao/pratica`)
- Ao clicar em *"Iniciar Treino de Revisão"*, o aluno é direcionado para `/revisao/pratica`.
- A página carrega dinamicamente as **5 questões com maior prioridade $P_q$**.
- Reutiliza o `LessonContainer` com indicador visual:
  `Badge: Treino de Revisão Espaçada (Foco em Fixação)`.
- Cada resposta submetida grava uma nova linha em `user_answers`, recalculando automaticamente o domínio e diminuindo a prioridade de revisão da questão após o acerto.
- Na tela de conclusão da revisão, o estudante visualiza a atualização imediata do domínio recuperado (ex: *"Domínio do Art. 196 subiu de 50% para 70%"*).

---

## 5. Estrutura de Arquivos e Módulos

```
src/
├── features/
│   ├── review/
│   │   ├── types/
│   │   │   └── review.ts            # Tipagens de SRS, prioridade, domínio e diagnóstico
│   │   ├── utils/
│   │   │   ├── srsAlgorithm.ts      # Função pura: cálculo de P_q, intervalos I e ordenação
│   │   │   └── masteryCalculator.ts # Função pura: cálculo de D_q e domínio por subtema
│   │   ├── server/
│   │   │   └── reviewRepository.ts  # Consulta user_answers, cruza com questions e gera fila
│   │   ├── actions/
│   │   │   └── reviewActions.ts     # Server action para submeter revisão e invalidar cache
│   │   └── components/
│   │       ├── MasteryOverview.tsx  # Medidores de domínio por subtema e barras de progresso
│   │       ├── ReviewQueueList.tsx  # Fila explicável com motivos determinísticos de estudo
│   │       └── ReviewSessionCta.tsx # CTA mobile destacado para iniciar sessão de 5 questões
├── app/
│   ├── revisao/
│   │   ├── page.tsx                 # Página principal do centro de revisão
│   │   └── pratica/
│   │       └── page.tsx             # Sessão interativa de prática com as questões da fila
```

### 5.1. Otimização de Banco de Dados
Para garantir tempo de resposta de poucos milissegundos (< 10ms) ao agregar o histórico de respostas:
- Criar migration `supabase/migrations/20261108000003_add_review_indexes.sql`:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_user_answers_user_answered
  ON public.user_answers (user_id, answered_at DESC);
  ```
- Nenhuma alteração destrutiva nem novas tabelas complexas necessárias, reaproveitando a integridade relacional já estabelecida na T003 e T004.

---

## 6. Estratégia de Testes Automatizados

1. **Testes Unitários de Algoritmo Puro (`srsAlgorithm.test.ts`):**
   - Questão com erro recente recebe $P_q \ge 100$ e encabeça a fila.
   - Questão com 3 acertos consecutivos recebe intervalo de 7 dias.
   - Questão com prazo vencido ($\Delta t > I$) recebe incremento linear de $W_{atraso}$.
   - Desempate determinístico quando duas questões têm pontuações idênticas.
   - Comportamento de reset de sequência consecutiva após novo erro.

2. **Testes Unitários de Diagnóstico (`masteryCalculator.test.ts`):**
   - Subtema sem respostas retorna 0% (não praticado).
   - Subtema com 5 questões acertadas de primeira retorna 100% (Dominado).
   - Ponderação de 70% para estado recente vs 30% histórico.
   - Enquadramento correto nas faixas Crítico (< 60%), Em Progresso (60-79%) e Dominado ($\ge$ 80%).

3. **Testes de Integração e Repositório (`reviewRepository.test.ts`):**
   - Recuperação da fila de revisão do usuário logado via Supabase.
   - Fallback gracioso para visitante anônimo mantendo simulação completa em memória.

4. **Testes de Componentes React (`MasteryOverview.test.tsx`, `ReviewQueueList.test.tsx`):**
   - Acessibilidade dos indicadores de progresso (`role="progressbar"`, `aria-valuenow`).
   - Renderização dos motivos pedagógicos explicáveis para cada item da fila.

5. **Testes Ponta a Ponta Playwright (`tests/e2e/spaced-repetition.spec.ts`):**
   - Usuário realiza a Sessão 1 e erra intencionalmente 1 questão.
   - Navega para `/revisao`.
   - Verifica que a questão errada está no topo da Fila de Revisão.
   - Clica em *"Iniciar Treino de Revisão"*, responde a questão corretamente e conclui.
   - Verifica que o domínio do Art. 195 foi atualizado na tela de resumo e no painel de revisão.

---

## 7. Decisões Técnicas Propostas para Registro (D018)

- **D018 — Algoritmo Determinístico de Repetição Espaçada (SRS) e Domínio Sem IA:**
  - *Decisão:* Adotar algoritmo determinístico baseado em modelo Leitner ponderado por erro, recência e sequência consecutiva de acertos, sem uso de modelos de linguagem para agendamento.
  - *Motivo:* Garantir total reprodutibilidade, explicação transparente ao estudante, custo zero de inferência e conformidade estrita com o princípio da Fase 5 em `FASES.md` e a regra D004.
  - *Status:* Proposta vinculada à aprovação deste plano.

---

## 8. Verificação de Riscos e Mitigações

| Risco Técnico | Probabilidade | Impacto | Mitigação no Plano |
|---|---|---|---|
| **Volume de dados em `user_answers` degradar a query** | Baixa | Baixo | Criação do índice `idx_user_answers_user_answered` e limite de busca às últimas tentativas por questão. |
| **Estudante novato sem respostas acessar `/revisao`** | Alta | Baixo | Empty state acolhedor orientando o estudante a iniciar a primeira lição na Unidade 1. |
| **Visitante anônimo perder fila de revisão** | Média | Baixo | Armazenamento de respostas da sessão corrente em memória/fallback com convite para criar conta e sincronizar na nuvem. |
| **Complexidade desnecessária na UI** | Média | Médio | Design minimalista mobile-first: apenas medidores de domínio claros e botão de treino de 5 questões. |

---

## 9. Plano de Ação para Implementação (Pós-Aprovação)

1. Criar migration SQL `20261108000003_add_review_indexes.sql`.
2. Implementar as funções de domínio puro `srsAlgorithm.ts` e `masteryCalculator.ts` acompanhadas de 100% de cobertura de testes unitários.
3. Desenvolver o repositório `reviewRepository.ts` e as Server Actions.
4. Construir os componentes acessíveis de UI (`MasteryOverview`, `ReviewQueueList`, `ReviewSessionCta`).
5. Desenvolver as páginas `/revisao` e `/revisao/pratica`.
6. Criar e executar a suíte E2E do Playwright (`spaced-repetition.spec.ts`).
7. Executar todas as verificações de qualidade (`pnpm typecheck`, `pnpm lint`, `pnpm vitest run`, `pnpm test:e2e`, `pnpm build`).
8. Registrar commit e push na branch `feat/T005-revisao-espacada`, sincronizar no Drive e aguardar homologação.

---

> [!IMPORTANT]
> **Porta de Aprovação D010:** Nenhuma linha de código de produção ou migration real foi criada. Aguardando a leitura e a aprovação formal do plano técnico acima para autorizar o início da implementação da Fase 5 (T005).
