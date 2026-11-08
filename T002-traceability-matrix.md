# T002 — Matriz de Rastreabilidade Normativa: MBFT (Resolução CONTRAN nº 985/2022)

**Fase:** 2 — Piloto Editorial de Sinalização
**Tarefa:** T002
**Status do Lote:** `em_revisao` (Etapa 1 Concluída — Aguardando Homologação Humana)
**Data:** 07/11/2026
**Branch de Trabalho:** `feat/T002-piloto-sinalizacao`
**Decisões Vinculadas:** D003, D011, D014, D015

---

## 1. Governança e Metodologia Jurídico-Editorial Estrita

1. **Fonte Primária Exclusiva e Oficial Vigente:**
   - Toda e qualquer fundamentação deste lote piloto deriva **exclusivamente** do arquivo `fichas_mbft_195_196_208.md`, extraído das fichas oficiais do **Manual Brasileiro de Fiscalização de Trânsito (MBFT)**, aprovado pela **Resolução CONTRAN nº 985/2022** (com vigência a partir de 02/01/2023).
   - Cobertura estrita dos dispositivos dos **Artigos 195, 196 e 208 do Código de Trânsito Brasileiro (CTB)**:
     - **Art. 195**: Desobediência às ordens da autoridade competente de trânsito ou de seus agentes (Ficha Enquadramento **583-50**).
     - **Art. 196**: Deixar de indicar com antecedência manobra de início de marcha, parada, mudança de direção ou faixa (Fichas Enquadramento **584-31**, **584-32**, **584-33**, **584-34**).
     - **Art. 208**: Avançar sinal vermelho do semáforo ou o de parada obrigatória (Fichas Enquadramento **605-01** e **605-02**).
2. **Conformidade com a Regra D003 (Evidências Primárias e Dupla Verificação):**
   - Cada questão possui transcrição literal do trecho comprobatório constante na respectiva Ficha de Fiscalização do MBFT.
   - Nenhuma questão utiliza dados sintéticos demonstrativos ou citações genéricas desprovidas de amparo na fonte primária.
   - Dupla verificação realizada: modelo gerador (`Antigravity/Gemini-3.8-Flash`) e modelo verificador (`Independent/Auditor-Juridico-Editorial`).
3. **Conformidade com a Regra D011 (Porta de Aprovação Humana e Status):**
   - Em estrito respeito à rejeição do Tech Lead e à política de governança editorial, **todas as 20 questões estão mantidas em status `em_revisao`** com `approvedBy: null` e `source.verificationStatus: 'pending'`.
   - As questões estão submetidas à homologação humana através deste documento, não tendo sido promovidas a `aprovada` antes do aceite explícito.
4. **Conformidade com a Regra D014 (Escopo Federativo):**
   - Todas as 20 questões utilizam array vazio `ufs: []`, indicando validade em todo o território nacional sem regionalismos infundados.

---

## 2. Visão Consolidada das 20 Questões do Piloto MBFT

| ID | Artigo CTB | Ficha MBFT | Subtema | Gabarito | Status |
|---|:---:|:---:|---|:---:|:---:|
| `sin-001` | Art. 195 | **583-50** | Ordens do Agente e Prevalência (Art. 195) | **b** | `em_revisao` |
| `sin-002` | Art. 195 | **583-50** | Pressupostos de Autuação (Art. 195) | **a** | `em_revisao` |
| `sin-003` | Art. 195 | **583-50** | Formas de Emissão de Ordem e Apito (Art. 195) | **b** | `em_revisao` |
| `sin-004` | Art. 195 | **583-50** | Restrições Médicas da CNH (Art. 195) | **b** | `em_revisao` |
| `sin-005` | Art. 195 | **583-50** | Conflito de Enquadramento Agente (Art. 195 vs 208) | **b** | `em_revisao` |
| `sin-006` | Art. 196 | **584-31** | Início de Marcha e Sinalização (Art. 196 / 584-31) | **b** | `em_revisao` |
| `sin-007` | Art. 196 | **584-31** | Meios de Indicação e Gestos (Art. 196 / Art. 35 CTB) | **b** | `em_revisao` |
| `sin-008` | Art. 196 | **584-32** | Manobra de Parar Veículo (Art. 196 / 584-32) | **b** | `em_revisao` |
| `sin-009` | Art. 196 | **584-32** | Concomitância com Defeito de Iluminação (Art. 196 c/c 230, XXII) | **b** | `em_revisao` |
| `sin-010` | Art. 196 | **584-33** | Mudança de Direção e Lotes Lindeiros (Art. 196 / 584-33) | **b** | `em_revisao` |
| `sin-011` | Art. 196 | **584-33** | Exceções na Mudança de Direção (Art. 196 / 584-33) | **b** | `em_revisao` |
| `sin-012` | Art. 196 | **584-34** | Mudança de Faixa e Ultrapassagem (Art. 196 / 584-34) | **b** | `em_revisao` |
| `sin-013` | Art. 196 | **584-34** | Conceito de Faixa e Linha LMS-1 (Art. 196 vs 185) | **b** | `em_revisao` |
| `sin-014` | Art. 208 | **605-01** | Avanço de Sinal Vermelho e Linha de Retenção (Art. 208 / 605-01) | **b** | `em_revisao` |
| `sin-015` | Art. 208 | **605-01** | Transposição Incompleta da Retenção no Vermelho (Art. 208 / 605-01) | **b** | `em_revisao` |
| `sin-016` | Art. 208 | **605-01** | Livre Conversão à Direita no Foco Vermelho (Art. 208 c/c 44-A) | **b** | `em_revisao` |
| `sin-017` | Art. 208 | **605-01** | Passagem no Verde e Retenção Posterior (Art. 208 vs 183 e 182, VII) | **b** | `em_revisao` |
| `sin-018` | Art. 208 | **605-02** | Placa R-1 e Imobilização Total Obrigatória (Art. 208 / 605-02) | **b** | `em_revisao` |
| `sin-019` | Art. 208 | **605-02** | Indispensabilidade da Sinalização Vertical R-1 (Art. 208 / 605-02) | **b** | `em_revisao` |
| `sin-020` | Art. 208 | **605-02** | Ordem de Parada por Gesto do Agente (Art. 208 / 605-02) | **b** | `em_revisao` |

---

## 3. Fichas Individuais de Rastreabilidade Literal (D003 e D011)

### Questão `sin-001`: Ordens do Agente e Prevalência (Art. 195)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 195 (Ficha MBFT 583-50, Procedimento 1)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 195 - 583-50 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Definições e Procedimentos', item 1:
"1. As ordens do agente de trânsito terão prevalência sobre as normas de circulação e outros sinais (art. 89, I)."
```

#### Conteúdo da Questão:
**Enunciado:** De acordo com as Definições e Procedimentos da Ficha de Fiscalização do Art. 195 do MBFT (Enquadramento 583-50), qual é a relação de prevalência entre as ordens emanadas pelo agente da autoridade de trânsito e os demais elementos viários?

**Alternativas:**
- **a)** As normas gerais de circulação prevalecem sobre os gestos e ordens emitidas pelo agente de trânsito.
- **b)** As ordens do agente de trânsito têm prevalência sobre as normas de circulação e outros sinais viários. **(Correta)**
- **c)** A sinalização horizontal viária possui prevalência absoluta sobre as determinações verbais do agente fiscalizador.
- **d)** As indicações luminosas do semáforo prevalecem sobre a ordem emitida pelo agente no centro do cruzamento.

**Gabarito Oficial:** `b`
**Justificativa Didática:** Conforme dispõe expressamente o item 1 de Definições e Procedimentos da Ficha 583-50 do MBFT: "As ordens do agente de trânsito terão prevalência sobre as normas de circulação e outros sinais (art. 89, I)". Portanto, as determinações do agente sobrepõem-se a todos os sinais viários e regras de trânsito.

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Fundamentado no trecho literal da Ficha 583-50 do MBFT (Pág 1): "As ordens do agente de trânsito terão prevalência sobre as normas de circulação e outros sinais (art. 89, I)".
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-002`: Pressupostos de Autuação (Art. 195)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 195 (Ficha MBFT 583-50, Procedimento 2)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 195 - 583-50 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Definições e Procedimentos', item 2:
"2. Para caracterização da infração administrativa prevista no art. 195 são necessários 3 (três) pressupostos:
2.1. que a ordem seja relativa à normatização do trânsito em geral;
2.2. que a ordem seja emanada da autoridade de trânsito ou do agente; ou e
2.3. a participação do destinatário da ordem em qualquer situação de trânsito, em sentido amplo."
```

#### Conteúdo da Questão:
**Enunciado:** Conforme as Definições e Procedimentos do MBFT para o enquadramento 583-50 (Art. 195 do CTB), são necessários três pressupostos para a caracterização da infração administrativa. Quais são eles?

**Alternativas:**
- **a)** Ordem relativa à normatização do trânsito em geral; ordem emanada da autoridade ou do agente; e participação do destinatário em qualquer situação de trânsito em sentido amplo. **(Correta)**
- **b)** Veículo registrado no município de fiscalização; presença de duas testemunhas civis; e abordagem obrigatória com teste de etilômetro.
- **c)** Desobediência gravada por câmera de videomonitoramento; ocorrência de sinistro com vítima; e retenção física da CNH.
- **d)** Notificação postal prévia em 30 dias; histórico de reincidência anual; e ordem expedida exclusivamente por escrito.

**Gabarito Oficial:** `a`
**Justificativa Didática:** A Ficha 583-50 do MBFT (Procedimento 2) define expressamente: "Para caracterização da infração administrativa prevista no art. 195 são necessários 3 (três) pressupostos: 2.1. que a ordem seja relativa à normatização do trânsito em geral; 2.2. que a ordem seja emanada da autoridade de trânsito ou do agente; ou e 2.3. a participação do destinatário da ordem em qualquer situação de trânsito, em sentido amplo".

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Extraído literalmente do item 2 das Definições e Procedimentos da Ficha 583-50 do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-003`: Formas de Emissão de Ordem e Apito (Art. 195)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 195 (Ficha MBFT 583-50, Procedimento 3 e Inf. Compl. 1)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 195 - 583-50 - APROVADA - CONTRAN.pdf (Páginas 1 e 2)
Item 'Definições e Procedimentos', item 3 e 'Informações Complementares', item 1:
"3. A ordem pode ser verbal ou escrita, bem como através de gestos ou sinais sonoros."
"1. Gestos e sinais sonoros dos agentes de trânsito: (...) Os sinais sonoros de apito somente devem ser utilizados em conjunto com os gestos dos agentes."
```

#### Conteúdo da Questão:
**Enunciado:** Segundo a Ficha de Fiscalização do Art. 195 do MBFT (Enquadramento 583-50), como as ordens do agente de trânsito podem ser emitidas e qual é a regra obrigatória para o uso de sinais sonoros de apito?

**Alternativas:**
- **a)** A ordem só tem eficácia jurídica se for lavrada por escrito, sendo vedado o emprego de apito em áreas urbanas residenciais.
- **b)** A ordem pode ser verbal ou escrita, bem como através de gestos ou sinais sonoros, sendo que os sinais sonoros de apito somente devem ser utilizados em conjunto com os gestos dos agentes. **(Correta)**
- **c)** Os sinais sonoros de apito do agente dispensam qualquer gesto de braço e prevalecem isoladamente sobre os semáforos.
- **d)** O agente de trânsito só pode emitir comandos sonoros por meio de autofalantes de viaturas oficiais padronizadas.

**Gabarito Oficial:** `b`
**Justificativa Didática:** Conforme o item 3 das Definições e Procedimentos e o item 1 das Informações Complementares da Ficha 583-50 do MBFT: "A ordem pode ser verbal ou escrita, bem como através de gestos ou sinais sonoros" e "Os sinais sonoros de apito somente devem ser utilizados em conjunto com os gestos dos agentes".

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Fundamentado no item 3 de Definições e Procedimentos e item 1 de Informações Complementares da Ficha 583-50.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-004`: Restrições Médicas da CNH (Art. 195)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 195 (Ficha MBFT 583-50, Quando AUTUAR 5)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 195 - 583-50 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Quando AUTUAR', item 5:
"5. Condutor que desobedecer restrição imposta pela autoridade de trânsito, com base no exame de saúde, e que conste no campo de observações do seu documento de habilitação:
5.1. vedado dirigir em rodovias e vias de trânsito rápido;
5.2. vedado dirigir após o pôr-do-sol; ou
5.3. outras restrições."
```

#### Conteúdo da Questão:
**Enunciado:** De acordo com o campo "Quando AUTUAR" da Ficha 583-50 do MBFT (Art. 195), qual conduta do condutor caracteriza expressamente a infração de desobediência a ordem da autoridade de trânsito?

**Alternativas:**
- **a)** Deixar de efetuar a transferência de propriedade do veículo dentro do prazo legal de 30 dias contados da aquisição.
- **b)** Condutor que desobedecer restrição imposta pela autoridade de trânsito, com base no exame de saúde, e que conste no campo de observações de seu documento de habilitação (ex.: vedado dirigir após o pôr-do-sol). **(Correta)**
- **c)** Transitar em velocidade inferior à metade da máxima da via quando as condições de tráfego permitirem fluidez.
- **d)** Estacionar o veículo afastado da guia da calçada a mais de um metro em via pública urbana local.

**Gabarito Oficial:** `b`
**Justificativa Didática:** A Ficha 583-50 prevê explicitamente no item 5 do campo "Quando AUTUAR": "Condutor que desobedecer restrição imposta pela autoridade de trânsito, com base no exame de saúde, e que conste no campo de observações do seu documento de habilitação: 5.1. vedado dirigir em rodovias e vias de trânsito rápido; 5.2. vedado dirigir após o pôr-do-sol; ou 5.3. outras restrições".

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Transcrição literal do item 5 de "Quando AUTUAR" da Ficha 583-50 do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-005`: Conflito de Enquadramento Agente (Art. 195 vs 208)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 195 (Ficha MBFT 583-50, Quando NÃO Autuar 3)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 195 - 583-50 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Quando NÃO Autuar', item 3:
"3. Se a ordem do agente for relativa à parada do veículo, através do uso dos gestos de agentes da autoridade de trânsito; utilizar enquadramento específico: 605-02, art. 208."
```

#### Conteúdo da Questão:
**Enunciado:** O campo "Quando NÃO Autuar" da Ficha 583-50 do MBFT (Art. 195) orienta sobre enquadramentos específicos. Se a ordem do agente for especificamente relativa à parada do veículo mediante uso de gestos, qual é o enquadramento correto?

**Alternativas:**
- **a)** Autuar no Art. 195 cumulado com apreensão sumária imediata do veículo pelo agente fiscalizador.
- **b)** Não autuar pelo Art. 195, devendo utilizar o enquadramento específico: 605-02, Art. 208 do CTB. **(Correta)**
- **c)** Enquadrar como infração média de recusa de entrega de documentos prevista no Art. 238 do CTB.
- **d)** Desconsiderar a infração de trânsito aplicando sanção de perturbação exclusiva da esfera de segurança pública.

**Gabarito Oficial:** `b`
**Justificativa Didática:** Segundo o item 3 do campo "Quando NÃO Autuar" da Ficha 583-50 do MBFT: "Se a ordem do agente for relativa à parada do veículo, através do uso dos gestos de agentes da autoridade de trânsito; utilizar enquadramento específico: 605-02, art. 208".

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Transcrição literal do item 3 de "Quando NÃO Autuar" da Ficha 583-50 do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-006`: Início de Marcha e Sinalização (Art. 196 / 584-31)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 196 (Ficha MBFT 584-31, Quando Autuar 2)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 196 - 584-31 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Quando Autuar:', item 2:
"2. Veículo estacionado/parado, que sinaliza que vai iniciar a marcha em uma direção, mas que inicia a marcha pelo lado oposto."
```

#### Conteúdo da Questão:
**Enunciado:** Conforme a Ficha 584-31 do MBFT (Art. 196), além de deixar de sinalizar com antecedência, em qual situação específica de início de marcha o condutor deve ser autuado sob esse código?

**Alternativas:**
- **a)** Veículo estacionado que aciona o pisca-alerta por menos de 30 segundos antes de dar partida no motor.
- **b)** Veículo estacionado/parado, que sinaliza que vai iniciar a marcha em uma direção, mas que inicia a marcha pelo lado oposto. **(Correta)**
- **c)** Condutor que buzina duas vezes antes de sair com o veículo em declive acentuado.
- **d)** Veículo que inicia marcha a ré em via urbana com limite de velocidade máxima regulamentada de 40 km/h.

**Gabarito Oficial:** `b`
**Justificativa Didática:** A Ficha 584-31 do MBFT estabelece expressamente em "Quando Autuar", item 2: "Veículo estacionado/parado, que sinaliza que vai iniciar a marcha em uma direção, mas que inicia a marcha pelo lado oposto". A sinalização contraditória engana os demais condutores e configura a infração grave.

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 584-31 (Página 1, Quando Autuar item 2) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-007`: Meios de Indicação e Gestos (Art. 196 / Art. 35 CTB)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 196 (Ficha MBFT 584-31, Procedimento 1 / Art. 35 CTB)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 196 - 584-31 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Definições e Procedimentos:', item 1:
"1. Art. 35. Antes de iniciar qualquer manobra que implique um deslocamento lateral, o condutor deverá indicar seu propósito de forma clara e com a devida antecedência, por meio da luz indicadora de direção de seu veículo, ou fazendo gesto convencional de braço."
```

#### Conteúdo da Questão:
**Enunciado:** De acordo com o Art. 35 do CTB, citado nas Definições e Procedimentos das Fichas do Art. 196 do MBFT, como o condutor deve indicar seu propósito com antecedência ao realizar deslocamento lateral?

**Alternativas:**
- **a)** Apenas mediante acionamento contínuo da buzina ou relampejo intermitente dos faróis altos.
- **b)** Por meio da luz indicadora de direção de seu veículo (seta), ou fazendo gesto convencional de braço. **(Correta)**
- **c)** Exclusivamente por meio do pisca-alerta acionado com três segundos de antecedência à manobra.
- **d)** Somente por meio de toques no pedal do freio para acender repetidamente a luz de freio traseira.

**Gabarito Oficial:** `b`
**Justificativa Didática:** Conforme o item 1 de Definições e Procedimentos da Ficha 584-31 (reproduzindo o Art. 35 do CTB): "Art. 35. Antes de iniciar qualquer manobra que implique um deslocamento lateral, o condutor deverá indicar seu propósito de forma clara e com a devida antecedência, por meio da luz indicadora de direção de seu veículo, ou fazendo gesto convencional de braço".

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Citação literal do Art. 35 do CTB no item 1 das Definições e Procedimentos da Ficha 584-31 do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-008`: Manobra de Parar Veículo (Art. 196 / 584-32)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 196 (Ficha MBFT 584-32, Quando Autuar 1)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 196 - 584-32 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Quando Autuar:', item 1:
"1. Veículo em movimento que ao parar para efetuar embarque/desembarque ou estacionar, não sinaliza com antecedência, mediante luz ou gesto, essa manobra."
```

#### Conteúdo da Questão:
**Enunciado:** Conforme o campo "Quando Autuar" da Ficha 584-32 do MBFT (Art. 196), em qual circunstância prática resta configurada a infração de deixar de indicar manobra de parar o veículo?

**Alternativas:**
- **a)** Veículo imobilizado em fila dupla que mantém as luzes de posição acesas sem condutor ao volante.
- **b)** Veículo em movimento que ao parar para efetuar embarque/desembarque ou estacionar, não sinaliza com antecedência, mediante luz ou gesto, essa manobra. **(Correta)**
- **c)** Condutor que para antes da linha de retenção ao comando do semáforo no início da fase amarela.
- **d)** Veículo que desliga os faróis durante parada temporária em acostamento de rodovia sob fiscalização.

**Gabarito Oficial:** `b`
**Justificativa Didática:** A Ficha 584-32 do MBFT (Quando Autuar, item 1) prevê: "Veículo em movimento que ao parar para efetuar embarque/desembarque ou estacionar, não sinaliza com antecedência, mediante luz ou gesto, essa manobra". Trata-se de infração de gravidade grave punida com multa e 5 pontos.

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 584-32 (Página 1, Quando Autuar item 1) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-009`: Concomitância com Defeito de Iluminação (Art. 196 c/c 230, XXII)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 196 (Ficha MBFT 584-32, Procedimento 3 c/c Art. 230, XXII)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 196 - 584-32 - APROVADA - CONTRAN.pdf (Páginas 1 e 2)
Item 'Definições e Procedimentos:', item 3:
"3. Constatado defeito no sistema de iluminação, de sinalização ou com lâmpadas queimadas, autuar concomitantemente com o enquadramento: 676-90, art. 230, XXII."
```

#### Conteúdo da Questão:
**Enunciado:** Segundo as Definições e Procedimentos das Fichas do Art. 196 do MBFT, se o agente constatar que o veículo não sinalizou a manobra por apresentar defeito no sistema ou lâmpadas queimadas, qual é o procedimento fiscalizatório?

**Alternativas:**
- **a)** Dispensar a autuação do Art. 196, pois a falha do componente elétrico isenta o motorista de responsabilidade.
- **b)** Autuar concomitantemente com o enquadramento: 676-90, art. 230, XXII (defeito no sistema de iluminação, de sinalização ou com lâmpadas queimadas). **(Correta)**
- **c)** Reter a CNH do condutor para instauração imediata de processo de suspensão do direito de dirigir.
- **d)** Emitir apenas advertência verbal ao condutor sem lavratura de qualquer auto de infração de trânsito.

**Gabarito Oficial:** `b`
**Justificativa Didática:** Conforme o item 3 de Definições e Procedimentos da Ficha 584-32 (e correlatas do Art. 196): "Constatado defeito no sistema de iluminação, de sinalização ou com lâmpadas queimadas, autuar concomitantemente com o enquadramento: 676-90, art. 230, XXII".

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 584-32 (Página 1, Procedimento 3) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-010`: Mudança de Direção e Lotes Lindeiros (Art. 196 / 584-33)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 196 (Ficha MBFT 584-33, Quando Autuar 1)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 196 - 584-33 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Quando Autuar:', item 1:
"1. Veículo que não sinaliza com antecedência a manobra de:
1.1. conversão à esquerda ou à direita;
1.2. retorno à esquerda ou à direita; ou
1.3. entrada/saída de lote lindeiro."
```

#### Conteúdo da Questão:
**Enunciado:** A Ficha 584-33 do MBFT regulamenta a fiscalização da manobra de mudança de direção (Art. 196). Quais manobras são expressamente tipificadas em que a ausência de sinalização prévia gera a autuação nesse código?

**Alternativas:**
- **a)** Apenas ultrapassagens realizadas em trechos sinuosos de rodovias federais não pavimentadas.
- **b)** Conversão à esquerda ou à direita; retorno à esquerda ou à direita; ou entrada/saída de lote lindeiro. **(Correta)**
- **c)** Mudança simples de faixa de rolamento em linha reta dentro do mesmo sentido de fluxo viário.
- **d)** Pequeno desvio lateral dentro da própria faixa de circulação para evitar poça d'água na pista.

**Gabarito Oficial:** `b`
**Justificativa Didática:** A Ficha 584-33 (Quando Autuar, item 1) prevê a autuação para: "Veículo que não sinaliza com antecedência a manobra de: 1.1. conversão à esquerda ou à direita; 1.2. retorno à esquerda ou à direita; ou 1.3. entrada/saída de lote lindeiro".

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 584-33 (Página 1, Quando Autuar 1) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-011`: Exceções na Mudança de Direção (Art. 196 / 584-33)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 196 (Ficha MBFT 584-33, Quando NÃO Autuar 1 e 2)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 196 - 584-33 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Quando NÃO Autuar:', itens 1 e 2:
"1. Veículo que não sinaliza a manobra de conversão em entroncamento que tenha uma única direção a seguir.
2. Veículo que não sinaliza a manobra de saída de lote lindeiro quando a via for de mão única."
```

#### Conteúdo da Questão:
**Enunciado:** De acordo com o campo "Quando NÃO Autuar" da Ficha 584-33 do MBFT (Art. 196), em quais situações o condutor NÃO deve ser autuado sob o enquadramento de deixar de sinalizar mudança de direção?

**Alternativas:**
- **a)** Ao realizar conversão à direita em cruzamento urbano dotado de faixa exclusiva de pedestres.
- **b)** Veículo que não sinaliza a manobra de conversão em entroncamento que tenha uma única direção a seguir, ou saída de lote lindeiro quando a via for de mão única. **(Correta)**
- **c)** Em rotatórias de tráfego intenso quando o condutor pretende seguir reto pela via arterial principal.
- **d)** No período noturno quando as lanternas do veículo estiverem ligadas no modo automático crepuscular.

**Gabarito Oficial:** `b`
**Justificativa Didática:** A Ficha 584-33 do MBFT estabelece expressamente em "Quando NÃO Autuar", itens 1 e 2: "1. Veículo que não sinaliza a manobra de conversão em entroncamento que tenha uma única direção a seguir. 2. Veículo que não sinaliza a manobra de saída de lote lindeiro quando a via for de mão única".

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 584-33 (Página 1, Quando NÃO Autuar 1 e 2) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-012`: Mudança de Faixa e Ultrapassagem (Art. 196 / 584-34)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 196 (Ficha MBFT 584-34, Quando Autuar 1)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 196 - 584-34 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Quando Autuar:', item 1:
"1. Veículo que não sinaliza com luz ou gesto com antecedência a manobra de mudança de faixa, inclusive para efetuar passagem ou ultrapassagem."
```

#### Conteúdo da Questão:
**Enunciado:** Conforme estabelece a Ficha 584-34 do MBFT (Art. 196), qual conduta do condutor caracteriza a autuação sob o código 584-34?

**Alternativas:**
- **a)** Conduzir o veículo pela faixa da direita em velocidade inferior ao limite máximo estabelecido para a via.
- **b)** Veículo que não sinaliza com luz ou gesto com antecedência a manobra de mudança de faixa, inclusive para efetuar passagem ou ultrapassagem. **(Correta)**
- **c)** Acionar a seta para a esquerda antes de iniciar ultrapassagem em via de sentido duplo com linha tracejada.
- **d)** Desligar a luz indicadora de direção imediatamente após completar a transposição de pista.

**Gabarito Oficial:** `b`
**Justificativa Didática:** A Ficha 584-34 do MBFT fixa em "Quando Autuar", item 1: "Veículo que não sinaliza com luz ou gesto com antecedência a manobra de mudança de faixa, inclusive para efetuar passagem ou ultrapassagem". A antecedência na sinalização é elemento essencial de segurança.

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 584-34 (Página 1, Quando Autuar 1) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-013`: Conceito de Faixa e Linha LMS-1 (Art. 196 vs 185)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 196 (Ficha MBFT 584-34, Procedimento 3 e Não Autuar 2)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 196 - 584-34 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Definições e Procedimentos:', item 3 e 'Quando NÃO Autuar:', item 2:
"3. FAIXAS DE TRÂNSITO - qualquer uma das áreas longitudinais em que a pista pode ser subdividida, sinalizada ou não por marcas viárias longitudinais, que tenham uma largura suficiente para permitir a circulação de veículos automotores."
"2. Em local sinalizado com Linha Simples Contínua - LMS-1 (contínua branca) e placa R-8a ou R-8b, veículo que transpor da faixa esquerda para a direita ou vice-versa, utilizar enquadramento específico: 570,30, art. 185."
```

#### Conteúdo da Questão:
**Enunciado:** Segundo as Definições e Procedimentos da Ficha 584-34 do MBFT, como são conceituadas as faixas de trânsito e como deve ser autuado o veículo que transpuser local com Linha Simples Contínua (LMS-1) e placa R-8a ou R-8b?

**Alternativas:**
- **a)** Faixas são áreas exclusivas de pedestres; e a transposição com LMS-1 é infração média do Art. 181 do CTB.
- **b)** Faixas de trânsito são áreas longitudinais em que a pista pode ser subdividida, sinalizadas ou não por marcas viárias; e transpor com LMS-1 e placa R-8a/b exige enquadramento específico no Art. 185 (código 570-30). **(Correta)**
- **c)** Faixas existem unicamente onde houver tachões refletivos amarelos; e a transposição é isenta de multa em pontes.
- **d)** Faixas são pistas de aceleração obrigatoriamente delimitadas por blocos de concreto e placa de advertência A-15.

**Gabarito Oficial:** `b`
**Justificativa Didática:** A Ficha 584-34 define em Procedimentos, item 3: "FAIXAS DE TRÂNSITO - qualquer uma das áreas longitudinais em que a pista pode ser subdividida, sinalizada ou não por marcas viárias longitudinais, que tenham uma largura suficiente para permitir a circulação de veículos automotores". E em Quando NÃO Autuar, item 2: "Em local sinalizado com Linha Simples Contínua - LMS-1 (contínua branca) e placa R-8a ou R-8b, veículo que transpor da faixa esquerda para a direita ou vice-versa, utilizar enquadramento específico: 570,30, art. 185".

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 584-34 (Procedimento 3 e Não Autuar 2) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-014`: Avanço de Sinal Vermelho e Linha de Retenção (Art. 208 / 605-01)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 208 (Ficha MBFT 605-01, Quando Autuar 1)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 208 - 605-01 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Quando Autuar', item 1:
"1. Semáforo efetivamente no vermelho, no início da passagem do veículo pela linha de retenção."
```

#### Conteúdo da Questão:
**Enunciado:** De acordo com o campo "Quando Autuar" da Ficha 605-01 do MBFT (Art. 208), qual é a condição fática necessária para caracterizar a infração de avançar o sinal vermelho do semáforo?

**Alternativas:**
- **a)** O semáforo estar no foco amarelo quando as rodas traseiras do veículo ultrapassarem o centro geométrico da via.
- **b)** O semáforo estar efetivamente no foco vermelho no momento do início da passagem do veículo pela linha de retenção. **(Correta)**
- **c)** O condutor não acelerar de forma suficiente para liberar o cruzamento antes do foco verde transversal.
- **d)** O foco vermelho acender enquanto o veículo já se encontra imobilizado além da linha de bordo da calçada.

**Gabarito Oficial:** `b`
**Justificativa Didática:** A Ficha 605-01 do MBFT determina em "Quando Autuar", item 1: "Semáforo efetivamente no vermelho, no início da passagem do veículo pela linha de retenção". É no momento exato em que o veículo inicia a transposição da linha de retenção que se afere a cor do semáforo.

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 605-01 (Página 1, Quando Autuar 1) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-015`: Transposição Incompleta da Retenção no Vermelho (Art. 208 / 605-01)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 208 (Ficha MBFT 605-01, Quando Autuar 2)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 208 - 605-01 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Quando Autuar', item 2:
"2. Mesmo que não complete o movimento, tendo transposto a linha de retenção na fase vermelha, parando na área de cruzamento ou sobre faixa de pedestre."
```

#### Conteúdo da Questão:
**Enunciado:** Segundo a Ficha 605-01 do MBFT (Art. 208), o condutor comete a infração de avançar sinal vermelho se transpor a linha de retenção no vermelho, mas parar antes de concluir o cruzamento?

**Alternativas:**
- **a)** Não, pois a ausência de travessia integral do cruzamento descaracteriza o avanço e impede a lavratura do auto.
- **b)** Sim, autua-se mesmo que não complete o movimento, tendo transposto a linha de retenção na fase vermelha, parando na área de cruzamento ou sobre faixa de pedestre. **(Correta)**
- **c)** Apenas se o veículo bloquear fisicamente a passagem de viatura de emergência ou ambulância oficial.
- **d)** Configura unicamente infração leve de parada indevida sem registro de pontuação na Carteira Nacional de Habilitação.

**Gabarito Oficial:** `b`
**Justificativa Didática:** A Ficha 605-01 do MBFT estabelece textualmente em "Quando Autuar", item 2: "Mesmo que não complete o movimento, tendo transposto a linha de retenção na fase vermelha, parando na área de cruzamento ou sobre faixa de pedestre". A infração é consumada no momento da transposição indevida da linha de retenção.

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 605-01 (Página 1, Quando Autuar 2) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-016`: Livre Conversão à Direita no Foco Vermelho (Art. 208 c/c 44-A)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 208 (Ficha MBFT 605-01, Amparo Legal c/c Art. 44-A CTB)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 208 - 605-01 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Tipificação do Enquadramento' e 'Quando NÃO Autuar', item 1:
"Avançar o sinal vermelho do semáforo ou o de parada obrigatória, exceto onde houver sinalização que permita a livre conversão à direita prevista no art. 44-A deste Código."
"1. Veículo que faz a conversão à direita, mesmo na fase vermelha, quando houver sinalização que permita esse movimento."
```

#### Conteúdo da Questão:
**Enunciado:** Conforme a tipificação do enquadramento e o campo "Quando NÃO Autuar" da Ficha 605-01 do MBFT, em qual situação o avanço do foco vermelho do semáforo é expressamente permitido pela legislação vigente?

**Alternativas:**
- **a)** Em qualquer cruzamento urbano entre as 23 horas e 5 horas da manhã, independentemente de sinalização viária.
- **b)** Onde houver sinalização que permita a livre conversão à direita prevista no art. 44-A deste Código. **(Correta)**
- **c)** Sempre que o motorista acionar o pisca-alerta e não observar pedestres atravessando num raio de 50 metros.
- **d)** Quando a fase verde do fluxo perpendicular durar menos de dez segundos segundo cronômetro visual.

**Gabarito Oficial:** `b`
**Justificativa Didática:** O Art. 208 do CTB e a Ficha 605-01 do MBFT prescrevem a ressalva explícita: "Avançar o sinal vermelho do semáforo ou o de parada obrigatória, exceto onde houver sinalização que permita a livre conversão à direita prevista no art. 44-A deste Código". E em Quando NÃO Autuar, item 1: "Veículo que faz a conversão à direita, mesmo na fase vermelha, quando houver sinalização que permita esse movimento".

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 605-01 (Amparo legal e Quando NÃO Autuar item 1) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-017`: Passagem no Verde e Retenção Posterior (Art. 208 vs 183 e 182, VII)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 208 (Ficha MBFT 605-01, Quando NÃO Autuar 3 e 5)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 208 - 605-01 - APROVADA - CONTRAN.pdf (Página 1)
Item 'Quando NÃO Autuar', itens 3 e 5:
"3. Veículo que passa pela linha de retenção na fase do verde ou do amarelo ou na direita livre e, mudando o sinal para a fase vermelha, fica imobilizado sobre a faixa de pedestres, utilizar enquadramento específico: 567-31, art. 183."
"5. Veículo que passa pela linha de retenção na fase do verde ou do amarelo, mas que fica imobilizado na área de cruzamento de vias, havendo mudança para a fase vermelha, utilizar enquadramento específico: 563-00, Art. 182, VII."
```

#### Conteúdo da Questão:
**Enunciado:** A Ficha 605-01 do MBFT estabelece regras claras para veículos que passam pela linha de retenção na fase verde ou amarela e ficam imobilizados sobre a faixa de pedestres ou área de cruzamento ao mudar para o vermelho. Qual enquadramento fiscalizatório deve ser adotado?

**Alternativas:**
- **a)** Autuar no Art. 208 em qualquer dos casos, pois a retenção na fase vermelha equivale ao avanço semafórico.
- **b)** Não autuar no Art. 208; utilizar o enquadramento específico 567-31 (Art. 183) se retido na faixa de pedestre, ou 563-00 (Art. 182, VII) se retido na área de cruzamento. **(Correta)**
- **c)** Aplicar enquadramento de direção perigosa com recolhimento compulsório do veículo ao depósito municipal.
- **d)** Isentar totalmente o motorista de penalidade atribuindo o erro ao órgão com circunscrição sobre a via.

**Gabarito Oficial:** `b`
**Justificativa Didática:** A Ficha 605-01 do MBFT define em "Quando NÃO Autuar", itens 3 e 5: "3. Veículo que passa pela linha de retenção na fase do verde ou do amarelo ou na direita livre e, mudando o sinal para a fase vermelha, fica imobilizado sobre a faixa de pedestres, utilizar enquadramento específico: 567-31, art. 183." e "5. Veículo que passa pela linha de retenção na fase do verde ou do amarelo, mas que fica imobilizado na área de cruzamento de vias, havendo mudança para a fase vermelha, utilizar enquadramento específico: 563-00, Art. 182, VII.".

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 605-01 (Quando NÃO Autuar itens 3 e 5) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-018`: Placa R-1 e Imobilização Total Obrigatória (Art. 208 / 605-02)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 208 (Ficha MBFT 605-02, Quando Autuar 1 e Inf. Compl. 1)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 208 - 605-02 - APROVADA - CONTRAN.pdf (Páginas 1 e 2)
Item 'Quando Autuar', item 1 e 'Informações Complementares', item 1:
"1. Na existência da placa R-1 ou R-21, não havendo imobilização total do veículo:
1.1. antes da área de conflito do cruzamento, na inexistência da linha de retenção;
1.2. antes da linha de retenção."
"Informações Complementares: Placa R-1 Parada Obrigatória: 1) Assinala ao condutor que deve parar seu veículo antes de entrar ou cruzar a via/pista. (...) 3) Seu uso deve se restringir às situações em que a parada de veículos for realmente necessária, sendo insuficiente ou perigosa a simples redução da velocidade."
```

#### Conteúdo da Questão:
**Enunciado:** Conforme as instruções do campo "Quando Autuar" e Informações Complementares da Ficha 605-02 do MBFT, qual conduta a placa R-1 (Parada Obrigatória) exige do condutor ao se aproximar de uma via?

**Alternativas:**
- **a)** Apenas a redução prudente da marcha até 20 km/h para averiguar visualmente o tráfego da via preferencial.
- **b)** Imobilização total do veículo antes da linha de retenção ou antes da área de conflito do cruzamento, sendo insuficiente ou perigosa a simples redução da velocidade. **(Correta)**
- **c)** Parada do veículo somente se houver outro automóvel ou pedestre efetivamente cruzando a pista no momento.
- **d)** Acionamento de buzina breve e prosseguimento contínuo em marcha lenta sem frear antes da linha branca.

**Gabarito Oficial:** `b`
**Justificativa Didática:** A Ficha 605-02 do MBFT (Quando Autuar, item 1) exige: "Na existência da placa R-1 ou R-21, não havendo imobilização total do veículo: 1.1. antes da área de conflito do cruzamento, na inexistência da linha de retenção; 1.2. antes da linha de retenção". E suas Informações Complementares reforçam: "Seu uso deve se restringir às situações em que a parada de veículos for realmente necessária, sendo insuficiente ou perigosa a simples redução da velocidade".

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 605-02 (Quando Autuar item 1 e Inf. Compl. item 1) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-019`: Indispensabilidade da Sinalização Vertical R-1 (Art. 208 / 605-02)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 208 (Ficha MBFT 605-02, Quando NÃO Autuar 1)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 208 - 605-02 - APROVADA - CONTRAN.pdf (Páginas 1 e 2)
Item 'Quando NÃO Autuar', item 1:
"1. Na falta ou deficiência da sinalização vertical (a linha de retenção não é obrigatória)."
"Informações Complementares: 5) Quando for necessário assinalar ao condutor o local exato da parada, pode-se implantar marcas transversais como linha de retenção e legenda 'PARE'."
```

#### Conteúdo da Questão:
**Enunciado:** Segundo o campo "Quando NÃO Autuar" e Procedimentos da Ficha 605-02 do MBFT, como deve proceder a fiscalização se houver marcação no solo de Linha de Retenção (LRE), porém faltar a placa vertical R-1?

**Alternativas:**
- **a)** Autuar normalmente no Art. 208, pois a linha de retenção horizontal tem suficiência probatória autônoma.
- **b)** Não autuar pelo Art. 208 (605-02), em virtude da falta ou deficiência da sinalização vertical (a linha de retenção não é obrigatória para a via, mas a placa vertical R-1 é indispensável para fundamentar a autuação). **(Correta)**
- **c)** Autuar o condutor por infração genérica do Art. 195 por desrespeito às marcas transversais da via.
- **d)** Lavrar o auto de infração somente se houver testemunha civil que comprove a existência anterior de placa no local.

**Gabarito Oficial:** `b`
**Justificativa Didática:** A Ficha 605-02 do MBFT determina textualmente no item 1 de "Quando NÃO Autuar": "1. Na falta ou deficiência da sinalização vertical (a linha de retenção não é obrigatória)". Sem a presença visível e regulamentar da sinalização vertical (placa R-1 ou R-21), a simples marcação horizontal isolada não autoriza a autuação por avanço de parada obrigatória.

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 605-02 (Página 1, Quando NÃO Autuar item 1) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

### Questão `sin-020`: Ordem de Parada por Gesto do Agente (Art. 208 / 605-02)
- **Dispositivo Legal:** Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT) — `Art. 208 (Ficha MBFT 605-02, Quando Autuar 2 e Definições 6)`
- **URL Oficial:** [https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf)
- **Categorias Aplicáveis:** A, B | **UFs:** `[]` (Âmbito Nacional / Resolução CONTRAN)
- **Status Editorial:** `em_revisao` (Verificação da Fonte: `pending`)

#### Evidência Normativa Literal (Extraída de `fichas_mbft_195_196_208.md`):
```text
Fonte: 208 - 605-02 - APROVADA - CONTRAN.pdf (Páginas 1 e 2)
Item 'Quando Autuar', item 2 e 'Definições e Procedimentos', item 6:
"2. Veículo que não atender à ordem de parada obrigatória emanada pelo agente, por meio de gesto regulamentar, acompanhado ou não de sinal sonoro."
"6. GESTOS DE AGENTES - movimentos convencionais de braço, adotados exclusivamente pelos agentes de autoridades de trânsito nas vias, para orientar, indicar o direito de passagem dos veículos ou pedestres ou emitir ordens, sobrepondo-se ou completando outra sinalização ou norma constante deste Código."
```

#### Conteúdo da Questão:
**Enunciado:** De acordo com o campo "Quando Autuar" (item 2) e Definições da Ficha 605-02 do MBFT, como deve ser autuado o condutor que não atender à ordem de parada obrigatória emitida por gesto do agente de trânsito?

**Alternativas:**
- **a)** Autuar no Art. 195 como infração grave de desobediência a comando verbal geral de trânsito.
- **b)** Autuar no Art. 208 (código 605-02), por não atender à ordem de parada obrigatória emanada pelo agente, por meio de gesto regulamentar, acompanhado ou não de sinal sonoro. **(Correta)**
- **c)** Autuar no Art. 186 por circulação indevida na contramão de direção fixada pelo agente fiscalizador.
- **d)** Não lavrar auto de infração se o veículo estiver em velocidade compatível com a segurança local.

**Gabarito Oficial:** `b`
**Justificativa Didática:** A Ficha 605-02 do MBFT tipifica no item 2 do campo "Quando Autuar": "Veículo que não atender à ordem de parada obrigatória emanada pelo agente, por meio de gesto regulamentar, acompanhado ou não de sinal sonoro". E suas Definições (item 6) reforçam que os gestos de agentes orientam, indicam passagem ou emitem ordens, sobrepondo-se às demais sinalizações viárias.

#### Trilha de Auditoria (Review):
- **Modelo Gerador:** `Antigravity/Gemini-3.8-Flash`
- **Modelo Verificador:** `Independent/Auditor-Juridico-Editorial`
- **Notas de Verificação:** Trecho literal da Ficha 605-02 (Página 1, Quando Autuar item 2 e Definições item 6) do MBFT.
- **Homologação Humana (`approvedBy`):** `Pendente de Homologação Humana (Tech Lead)`

---

## 4. Porta de Homologação Humana (Regra D011)

Este lote piloto de 20 questões está fundamentado 100% no arquivo `fichas_mbft_195_196_208.md` da raiz do repositório, cumprindo integralmente os requisitos de rastreabilidade (D003).

Para concluir a transição da Etapa 1 para a Etapa 2 de D011, é necessária a validação humana formal pelo Tech Lead / Responsável pelo Produto:

- [ ] **Homologação Técnica e Jurídica:**
  - [ ] Responsável: `Tech Lead / Responsável pelo Produto`
  - [ ] Data da Homologação: `____/____/2026`
  - [ ] Parecer: `( ) APROVADO sem ressalvas   ( ) REJEITADO com apontamentos`
  - [ ] Ação pós-homologação: Promover `status` de `em_revisao` para `aprovada` com registro de `approvedBy` e `approvedAt`.
