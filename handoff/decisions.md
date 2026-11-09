# Registro de decisões

Formato: ID — decisão — motivo — status — observação.

- D001 — Stack: Next.js (App Router) + TypeScript strict, Supabase (Postgres/Auth), Gemini API chamada no servidor, Vitest/React Testing Library/Playwright e pnpm — simplicidade e velocidade para o MVP; relações questão ↔ norma ↔ versão combinam com SQL — **DECIDIDO**.
- D002 — UF será etiqueta nas questões; regras estaduais só serão criadas quando comprovadas — a base legal é nacional e não devemos inventar diferenças — **DECIDIDO**.
- D003 — Questões originais derivadas de fontes oficiais/licenciadas; verificação por modelo diferente do gerador, com trecho de fonte primária; aprovação humana obrigatória — reduzir erro jurídico e risco autoral — **DECIDIDO**.
- D004 — Sem frameworks de agentes (ADK, LangGraph etc.) no MVP; agentes serão scripts/serviços simples com entrada, saída, logs e limites — evitar complexidade prematura — **DECIDIDO**.
- D005 — Comunicação por arquivos em `handoff/` (briefs, tasks, reports, decisions); pasta pode ser espelhada no Google Drive; repositório de código NÃO fica dentro do Drive — evitar conflitos de sincronização — **DECIDIDO**.
- D006 — Nome e marca independentes, sem sugerir vínculo com DETRAN; pesquisar disponibilidade no INPI — independência institucional e segurança de marca — **PENDENTE**.
- D007 — Parâmetros da Prova Teórica para Simulado (Resolução CONTRAN nº 1.020/2025): fixação de 30 questões por simulado, duração máxima de 60 minutos (cronômetro regressivo) e nota de corte de 20 acertos (aproveitamento mínimo de ~70% para aprovação conforme CTB e BNQ/SENATRAN) — assegurar simulação fidedigna ao exame teórico oficial de 1ª habilitação sem distorções — **DECIDIDO**.
- D008 — Provedor de hospedagem e orçamento/nível de faturamento para IA em produção — decisão depende de MVP, tráfego e custos medidos — **PENDENTE**.
- D009 — T001 será uma fatia técnica com cinco questões seed demonstrativas, em rascunho; sem login, trilhas completas, simulado, IA ou banco real — validar estrutura, interação e fluxo de lição antes de ampliar — **DECIDIDO PELO ESCOPO DE T001**.
- D010 — Trabalho em fases com porta de aprovação: o agente planeja, aguarda aprovação, implementa uma tarefa e entrega evidências antes de avançar — reduzir confusão, escopo indevido e regressões — **DECIDIDO**.
- D011 — Piloto editorial de sinalização: produção de 20 questões originais derivadas de fontes primárias oficiais (CTB/CONTRAN), executado em duas etapas com porta de aprovação (geração com status "em_revisao" acompanhada de matriz de rastreabilidade literal -> auditoria independente por modelo distinto e aprovação humana explícita antes de promover para "aprovada") — validar o gargalo editorial e garantir zero erro jurídico — **DECIDIDO**.
- D012 — Adoção da linha Next.js 16.x estável, React 19 e Tailwind CSS 4 via `@tailwindcss/postcss`, eliminando o legado `tailwind.config.ts` e arquivos `.eslintrc` legados — alinhamento com ferramentas modernas e suporte de longo prazo — **DECIDIDO**.
- D013 — Eliminação de dependências utilitárias de conveniência (`clsx`, `tailwind-merge`, `lucide-react`) na T001; uso de classes diretas e SVGs nativos acessíveis — manter a base de código enxuta e sem pacotes redundantes — **DECIDIDO**.
- D014 — Convenção para questões de escopo nacional: utilizar array vazio `ufs: []` para indicar ausência de restrição estadual, abolindo expressamente o uso de "BR" como sigla de estado — precisão semântica nos metadados federativos — **DECIDIDO**.
- D015 — Versionamento obrigatório por tarefa: branch própria, commits por checkpoints lógicos, push obrigatório para o remoto após cada checkpoint/entrega, relatório com hash e destino; nunca push direto para main, force push ou merge sem aprovação — evitar perda de trabalho e manter histórico remoto recuperável — **DECIDIDO**. Se não houver remoto/permissão, preservar commit local e reportar bloqueio sem afirmar que houve push.
- D016 — Navegação em Livre Acesso na trilha: o estudante tem acesso aberto para praticar qualquer sessão temática (Sessões 1 a 4) sem pré-requisitos bloqueantes — promover autonomia e estudo dirigido para tópicos de maior dificuldade — **DECIDIDO**.
- D017 — Atribuição de XP apenas na Primeira Conclusão de cada sessão temática: concessão autoritativa de 70 XP no servidor na primeira finalização; revisões e repetições subsequentes preservam histórico e atualizam streak, mas creditam 0 XP adicional — prevenção contra acúmulo artificial de pontuação (anti-farming) e integridade gamificada — **DECIDIDO**.
- D018 — Algoritmo Determinístico de Repetição Espaçada (SRS) e Diagnóstico de Domínio Sem IA: agendamento de revisão baseado no modelo Leitner ponderado por status recente, taxa de erros históricos e tempo de retenção decorrido, associado ao diagnóstico de domínio por dispositivo legal do MBFT — assegurar 100% de reprodutibilidade, transparência pedagógica com justificativas explicáveis, custo zero de inferência e conformidade com o princípio da Fase 5 — **DECIDIDO**.
- D019 — Enquadramento Editorial e Pedagógico do Simulado Temático (Fase 6 / T006): Denominação formal como "Simulado Temático — Sinalização de Trânsito" com nota de independência institucional em relação ao DETRAN/SENATRAN. Mensagens de resultado alinhadas ao valor pedagógico real ("Meta de estudo alcançada" com 100 XP para ≥ 20 acertos; "Continue praticando" com 30 XP para ≤ 19 acertos), esclarecendo que 20 acertos é meta de referência da plataforma e não assegura aprovação oficial. Tempo estendido de 120 minutos assegurado pelo Art. 33, § 2º da Resolução CONTRAN nº 1.020/2025 para candidatos com dislexia, TDAH ou TEA, sem exigência de laudo médico na interface — **DECIDIDO**.

## Histórico

- v1.0 — 06/11/2026: consolidação das decisões enviadas pelo responsável e separação dos itens pendentes/propostos.
- v1.1 — 06/11/2026: inclusão de D015, política obrigatória de branch, commits, push, checkpoints e sincronização documental.
- v1.2 — 06/11/2026: formalização de D012, D013 e D014 como DECIDIDO após aprovação do Tech Lead para execução da T001.
- v1.3 — 06/11/2026: D011 formalizado como DECIDIDO para execução da Fase 2 (T002).
- v1.4 — 08/11/2026: D016 e D017 formalizados como DECIDIDO após aprovação do planejamento da Fase 4 (T004).
- v1.5 — 08/11/2026: D018 formalizado como DECIDIDO após aprovação do plano T005 pelo responsável.
- v1.6 — 08/11/2026: D007 formalizado como DECIDIDO com base na Resolução CONTRAN nº 1.020/2025 (30 questões, 60 minutos, 20 acertos) para subsidiar a Fase 6 (T006).
- v1.7 — 08/11/2026: D019 formalizado como DECIDIDO após diretrizes de aceite editorial e pedagógico do Tech Lead para o Simulado Temático de Sinalização.
