-- Seed: supabase/seed.sql
-- Carga inicial das 20 questões homologadas da T002 (Piloto MBFT)

BEGIN;

-- Questão sin-001
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-001', 1, 'De acordo com as Definições e Procedimentos da Ficha de Fiscalização do Art. 195 do MBFT (Enquadramento 583-50), qual é a relação de prevalência entre as ordens emanadas pelo agente da autoridade de trânsito e os demais elementos viários?', '[{"id": "a", "text": "As normas gerais de circulação prevalecem sobre os gestos e ordens emitidas pelo agente de trânsito."}, {"id": "b", "text": "As ordens do agente de trânsito têm prevalência sobre as normas de circulação e outros sinais viários."}, {"id": "c", "text": "A sinalização horizontal viária possui prevalência absoluta sobre as determinações verbais do agente fiscalizador."}, {"id": "d", "text": "As indicações luminosas do semáforo prevalecem sobre a ordem emitida pelo agente no centro do cruzamento."}]'::jsonb, 'b', 'Conforme dispõe expressamente o item 1 de Definições e Procedimentos da Ficha 583-50 do MBFT: "As ordens do agente de trânsito terão prevalência sobre as normas de circulação e outros sinais (art. 89, I)". Portanto, as determinações do agente sobrepõem-se a todos os sinais viários e regras de trânsito.', 'Sinalização de Trânsito', 'Ordens do Agente e Prevalência (Art. 195)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-001', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 195 (Ficha MBFT 583-50, Procedimento 1)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-001', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Fundamentado no trecho literal da Ficha 583-50 do MBFT (Pág 1): "As ordens do agente de trânsito terão prevalência sobre as normas de circulação e outros sinais (art. 89, I)".', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-002
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-002', 1, 'Conforme as Definições e Procedimentos do MBFT para o enquadramento 583-50 (Art. 195 do CTB), são necessários três pressupostos para a caracterização da infração administrativa. Quais são eles?', '[{"id": "a", "text": "Ordem relativa à normatização do trânsito em geral; ordem emanada da autoridade ou do agente; e participação do destinatário em qualquer situação de trânsito em sentido amplo."}, {"id": "b", "text": "Veículo registrado no município de fiscalização; presença de duas testemunhas civis; e abordagem obrigatória com teste de etilômetro."}, {"id": "c", "text": "Desobediência gravada por câmera de videomonitoramento; ocorrência de sinistro com vítima; e retenção física da CNH."}, {"id": "d", "text": "Notificação postal prévia em 30 dias; histórico de reincidência anual; e ordem expedida exclusivamente por escrito."}]'::jsonb, 'a', 'A Ficha 583-50 do MBFT (Procedimento 2) define expressamente: "Para caracterização da infração administrativa prevista no art. 195 são necessários 3 (três) pressupostos: 2.1. que a ordem seja relativa à normatização do trânsito em geral; 2.2. que a ordem seja emanada da autoridade de trânsito ou do agente; ou e 2.3. a participação do destinatário da ordem em qualquer situação de trânsito, em sentido amplo".', 'Sinalização de Trânsito', 'Pressupostos de Autuação (Art. 195)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-002', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 195 (Ficha MBFT 583-50, Procedimento 2)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-002', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Extraído literalmente do item 2 das Definições e Procedimentos da Ficha 583-50 do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-003
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-003', 1, 'Segundo a Ficha de Fiscalização do Art. 195 do MBFT (Enquadramento 583-50), como as ordens do agente de trânsito podem ser emitidas e qual é a regra obrigatória para o uso de sinais sonoros de apito?', '[{"id": "a", "text": "A ordem só tem eficácia jurídica se for lavrada por escrito, sendo vedado o emprego de apito em áreas urbanas residenciais."}, {"id": "b", "text": "A ordem pode ser verbal ou escrita, bem como através de gestos ou sinais sonoros, sendo que os sinais sonoros de apito somente devem ser utilizados em conjunto com os gestos dos agentes."}, {"id": "c", "text": "Os sinais sonoros de apito do agente dispensam qualquer gesto de braço e prevalecem isoladamente sobre os semáforos."}, {"id": "d", "text": "O agente de trânsito só pode emitir comandos sonoros por meio de autofalantes de viaturas oficiais padronizadas."}]'::jsonb, 'b', 'Conforme o item 3 das Definições e Procedimentos e o item 1 das Informações Complementares da Ficha 583-50 do MBFT: "A ordem pode ser verbal ou escrita, bem como através de gestos ou sinais sonoros" e "Os sinais sonoros de apito somente devem ser utilizados em conjunto com os gestos dos agentes".', 'Sinalização de Trânsito', 'Formas de Emissão de Ordem e Apito (Art. 195)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-003', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 195 (Ficha MBFT 583-50, Procedimento 3 e Inf. Compl. 1)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-003', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Fundamentado no item 3 de Definições e Procedimentos e item 1 de Informações Complementares da Ficha 583-50.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-004
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-004', 1, 'De acordo com o campo "Quando AUTUAR" da Ficha 583-50 do MBFT (Art. 195), qual conduta do condutor caracteriza expressamente a infração de desobediência a ordem da autoridade de trânsito?', '[{"id": "a", "text": "Deixar de efetuar a transferência de propriedade do veículo dentro do prazo legal de 30 dias contados da aquisição."}, {"id": "b", "text": "Condutor que desobedecer restrição imposta pela autoridade de trânsito, com base no exame de saúde, e que conste no campo de observações de seu documento de habilitação (ex.: vedado dirigir após o pôr-do-sol)."}, {"id": "c", "text": "Transitar em velocidade inferior à metade da máxima da via quando as condições de tráfego permitirem fluidez."}, {"id": "d", "text": "Estacionar o veículo afastado da guia da calçada a mais de um metro em via pública urbana local."}]'::jsonb, 'b', 'A Ficha 583-50 prevê explicitamente no item 5 do campo "Quando AUTUAR": "Condutor que desobedecer restrição imposta pela autoridade de trânsito, com base no exame de saúde, e que conste no campo de observações do seu documento de habilitação: 5.1. vedado dirigir em rodovias e vias de trânsito rápido; 5.2. vedado dirigir após o pôr-do-sol; ou 5.3. outras restrições".', 'Sinalização de Trânsito', 'Restrições Médicas da CNH (Art. 195)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-004', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 195 (Ficha MBFT 583-50, Quando AUTUAR 5)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-004', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Transcrição literal do item 5 de "Quando AUTUAR" da Ficha 583-50 do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-005
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-005', 1, 'O campo "Quando NÃO Autuar" da Ficha 583-50 do MBFT (Art. 195) orienta sobre enquadramentos específicos. Se a ordem do agente for especificamente relativa à parada do veículo mediante uso de gestos, qual é o enquadramento correto?', '[{"id": "a", "text": "Autuar no Art. 195 cumulado com apreensão sumária imediata do veículo pelo agente fiscalizador."}, {"id": "b", "text": "Não autuar pelo Art. 195, devendo utilizar o enquadramento específico: 605-02, Art. 208 do CTB."}, {"id": "c", "text": "Enquadrar como infração média de recusa de entrega de documentos prevista no Art. 238 do CTB."}, {"id": "d", "text": "Desconsiderar a infração de trânsito aplicando sanção de perturbação exclusiva da esfera de segurança pública."}]'::jsonb, 'b', 'Segundo o item 3 do campo "Quando NÃO Autuar" da Ficha 583-50 do MBFT: "Se a ordem do agente for relativa à parada do veículo, através do uso dos gestos de agentes da autoridade de trânsito; utilizar enquadramento específico: 605-02, art. 208".', 'Sinalização de Trânsito', 'Conflito de Enquadramento Agente (Art. 195 vs 208)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-005', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 195 (Ficha MBFT 583-50, Quando NÃO Autuar 3)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-005', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Transcrição literal do item 3 de "Quando NÃO Autuar" da Ficha 583-50 do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-006
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-006', 1, 'Conforme a Ficha 584-31 do MBFT (Art. 196), além de deixar de sinalizar com antecedência, em qual situação específica de início de marcha o condutor deve ser autuado sob esse código?', '[{"id": "a", "text": "Veículo estacionado que aciona o pisca-alerta por menos de 30 segundos antes de dar partida no motor."}, {"id": "b", "text": "Veículo estacionado/parado, que sinaliza que vai iniciar a marcha em uma direção, mas que inicia a marcha pelo lado oposto."}, {"id": "c", "text": "Condutor que buzina duas vezes antes de sair com o veículo em declive acentuado."}, {"id": "d", "text": "Veículo que inicia marcha a ré em via urbana com limite de velocidade máxima regulamentada de 40 km/h."}]'::jsonb, 'b', 'A Ficha 584-31 do MBFT estabelece expressamente em "Quando Autuar", item 2: "Veículo estacionado/parado, que sinaliza que vai iniciar a marcha em uma direção, mas que inicia a marcha pelo lado oposto". A sinalização contraditória engana os demais condutores e configura a infração grave.', 'Sinalização de Trânsito', 'Início de Marcha e Sinalização (Art. 196 / 584-31)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-006', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 196 (Ficha MBFT 584-31, Quando Autuar 2)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-006', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 584-31 (Página 1, Quando Autuar item 2) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-007
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-007', 1, 'De acordo com o Art. 35 do CTB, citado nas Definições e Procedimentos das Fichas do Art. 196 do MBFT, como o condutor deve indicar seu propósito com antecedência ao realizar deslocamento lateral?', '[{"id": "a", "text": "Apenas mediante acionamento contínuo da buzina ou relampejo intermitente dos faróis altos."}, {"id": "b", "text": "Por meio da luz indicadora de direção de seu veículo (seta), ou fazendo gesto convencional de braço."}, {"id": "c", "text": "Exclusivamente por meio do pisca-alerta acionado com três segundos de antecedência à manobra."}, {"id": "d", "text": "Somente por meio de toques no pedal do freio para acender repetidamente a luz de freio traseira."}]'::jsonb, 'b', 'Conforme o item 1 de Definições e Procedimentos da Ficha 584-31 (reproduzindo o Art. 35 do CTB): "Art. 35. Antes de iniciar qualquer manobra que implique um deslocamento lateral, o condutor deverá indicar seu propósito de forma clara e com a devida antecedência, por meio da luz indicadora de direção de seu veículo, ou fazendo gesto convencional de braço".', 'Sinalização de Trânsito', 'Meios de Indicação e Gestos (Art. 196 / Art. 35 CTB)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-007', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 196 (Ficha MBFT 584-31, Procedimento 1 / Art. 35 CTB)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-007', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Citação literal do Art. 35 do CTB no item 1 das Definições e Procedimentos da Ficha 584-31 do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-008
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-008', 1, 'Conforme o campo "Quando Autuar" da Ficha 584-32 do MBFT (Art. 196), em qual circunstância prática resta configurada a infração de deixar de indicar manobra de parar o veículo?', '[{"id": "a", "text": "Veículo imobilizado em fila dupla que mantém as luzes de posição acesas sem condutor ao volante."}, {"id": "b", "text": "Veículo em movimento que ao parar para efetuar embarque/desembarque ou estacionar, não sinaliza com antecedência, mediante luz ou gesto, essa manobra."}, {"id": "c", "text": "Condutor que para antes da linha de retenção ao comando do semáforo no início da fase amarela."}, {"id": "d", "text": "Veículo que desliga os faróis durante parada temporária em acostamento de rodovia sob fiscalização."}]'::jsonb, 'b', 'A Ficha 584-32 do MBFT (Quando Autuar, item 1) prevê: "Veículo em movimento que ao parar para efetuar embarque/desembarque ou estacionar, não sinaliza com antecedência, mediante luz ou gesto, essa manobra". Trata-se de infração de gravidade grave punida com multa e 5 pontos.', 'Sinalização de Trânsito', 'Manobra de Parar Veículo (Art. 196 / 584-32)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-008', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 196 (Ficha MBFT 584-32, Quando Autuar 1)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-008', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 584-32 (Página 1, Quando Autuar item 1) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-009
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-009', 1, 'Segundo as Definições e Procedimentos das Fichas do Art. 196 do MBFT, se o agente constatar que o veículo não sinalizou a manobra por apresentar defeito no sistema ou lâmpadas queimadas, qual é o procedimento fiscalizatório?', '[{"id": "a", "text": "Dispensar a autuação do Art. 196, pois a falha do componente elétrico isenta o motorista de responsabilidade."}, {"id": "b", "text": "Autuar concomitantemente com o enquadramento: 676-90, art. 230, XXII (defeito no sistema de iluminação, de sinalização ou com lâmpadas queimadas)."}, {"id": "c", "text": "Reter a CNH do condutor para instauração imediata de processo de suspensão do direito de dirigir."}, {"id": "d", "text": "Emitir apenas advertência verbal ao condutor sem lavratura de qualquer auto de infração de trânsito."}]'::jsonb, 'b', 'Conforme o item 3 de Definições e Procedimentos da Ficha 584-32 (e correlatas do Art. 196): "Constatado defeito no sistema de iluminação, de sinalização ou com lâmpadas queimadas, autuar concomitantemente com o enquadramento: 676-90, art. 230, XXII".', 'Sinalização de Trânsito', 'Concomitância com Defeito de Iluminação (Art. 196 c/c 230, XXII)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-009', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 196 (Ficha MBFT 584-32, Procedimento 3 c/c Art. 230, XXII)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-009', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 584-32 (Página 1, Procedimento 3) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-010
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-010', 1, 'A Ficha 584-33 do MBFT regulamenta a fiscalização da manobra de mudança de direção (Art. 196). Quais manobras são expressamente tipificadas em que a ausência de sinalização prévia gera a autuação nesse código?', '[{"id": "a", "text": "Apenas ultrapassagens realizadas em trechos sinuosos de rodovias federais não pavimentadas."}, {"id": "b", "text": "Conversão à esquerda ou à direita; retorno à esquerda ou à direita; ou entrada/saída de lote lindeiro."}, {"id": "c", "text": "Mudança simples de faixa de rolamento em linha reta dentro do mesmo sentido de fluxo viário."}, {"id": "d", "text": "Pequeno desvio lateral dentro da própria faixa de circulação para evitar poça d''água na pista."}]'::jsonb, 'b', 'A Ficha 584-33 (Quando Autuar, item 1) prevê a autuação para: "Veículo que não sinaliza com antecedência a manobra de: 1.1. conversão à esquerda ou à direita; 1.2. retorno à esquerda ou à direita; ou 1.3. entrada/saída de lote lindeiro".', 'Sinalização de Trânsito', 'Mudança de Direção e Lotes Lindeiros (Art. 196 / 584-33)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-010', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 196 (Ficha MBFT 584-33, Quando Autuar 1)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-010', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 584-33 (Página 1, Quando Autuar 1) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-011
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-011', 1, 'De acordo com o campo "Quando NÃO Autuar" da Ficha 584-33 do MBFT (Art. 196), em quais situações o condutor NÃO deve ser autuado sob o enquadramento de deixar de sinalizar mudança de direção?', '[{"id": "a", "text": "Ao realizar conversão à direita em cruzamento urbano dotado de faixa exclusiva de pedestres."}, {"id": "b", "text": "Veículo que não sinaliza a manobra de conversão em entroncamento que tenha uma única direção a seguir, ou saída de lote lindeiro quando a via for de mão única."}, {"id": "c", "text": "Em rotatórias de tráfego intenso quando o condutor pretende seguir reto pela via arterial principal."}, {"id": "d", "text": "No período noturno quando as lanternas do veículo estiverem ligadas no modo automático crepuscular."}]'::jsonb, 'b', 'A Ficha 584-33 do MBFT estabelece expressamente em "Quando NÃO Autuar", itens 1 e 2: "1. Veículo que não sinaliza a manobra de conversão em entroncamento que tenha uma única direção a seguir. 2. Veículo que não sinaliza a manobra de saída de lote lindeiro quando a via for de mão única".', 'Sinalização de Trânsito', 'Exceções na Mudança de Direção (Art. 196 / 584-33)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-011', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 196 (Ficha MBFT 584-33, Quando NÃO Autuar 1 e 2)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-011', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 584-33 (Página 1, Quando NÃO Autuar 1 e 2) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-012
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-012', 1, 'Conforme estabelece a Ficha 584-34 do MBFT (Art. 196), qual conduta do condutor caracteriza a autuação sob o código 584-34?', '[{"id": "a", "text": "Conduzir o veículo pela faixa da direita em velocidade inferior ao limite máximo estabelecido para a via."}, {"id": "b", "text": "Veículo que não sinaliza com luz ou gesto com antecedência a manobra de mudança de faixa, inclusive para efetuar passagem ou ultrapassagem."}, {"id": "c", "text": "Acionar a seta para a esquerda antes de iniciar ultrapassagem em via de sentido duplo com linha tracejada."}, {"id": "d", "text": "Desligar a luz indicadora de direção imediatamente após completar a transposição de pista."}]'::jsonb, 'b', 'A Ficha 584-34 do MBFT fixa em "Quando Autuar", item 1: "Veículo que não sinaliza com luz ou gesto com antecedência a manobra de mudança de faixa, inclusive para efetuar passagem ou ultrapassagem". A antecedência na sinalização é elemento essencial de segurança.', 'Sinalização de Trânsito', 'Mudança de Faixa e Ultrapassagem (Art. 196 / 584-34)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-012', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 196 (Ficha MBFT 584-34, Quando Autuar 1)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-012', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 584-34 (Página 1, Quando Autuar 1) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-013
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-013', 1, 'Segundo as Definições e Procedimentos da Ficha 584-34 do MBFT, como são conceituadas as faixas de trânsito e como deve ser autuado o veículo que transpuser local com Linha Simples Contínua (LMS-1) e placa R-8a ou R-8b?', '[{"id": "a", "text": "Faixas são áreas exclusivas de pedestres; e a transposição com LMS-1 é infração média do Art. 181 do CTB."}, {"id": "b", "text": "Faixas de trânsito são áreas longitudinais em que a pista pode ser subdividida, sinalizadas ou não por marcas viárias; e transpor com LMS-1 e placa R-8a/b exige enquadramento específico no Art. 185 (código 570-30)."}, {"id": "c", "text": "Faixas existem unicamente onde houver tachões refletivos amarelos; e a transposição é isenta de multa em pontes."}, {"id": "d", "text": "Faixas são pistas de aceleração obrigatoriamente delimitadas por blocos de concreto e placa de advertência A-15."}]'::jsonb, 'b', 'A Ficha 584-34 define em Procedimentos, item 3: "FAIXAS DE TRÂNSITO - qualquer uma das áreas longitudinais em que a pista pode ser subdividida, sinalizada ou não por marcas viárias longitudinais, que tenham uma largura suficiente para permitir a circulação de veículos automotores". E em Quando NÃO Autuar, item 2: "Em local sinalizado com Linha Simples Contínua - LMS-1 (contínua branca) e placa R-8a ou R-8b, veículo que transpor da faixa esquerda para a direita ou vice-versa, utilizar enquadramento específico: 570,30, art. 185".', 'Sinalização de Trânsito', 'Conceito de Faixa e Linha LMS-1 (Art. 196 vs 185)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-013', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 196 (Ficha MBFT 584-34, Procedimento 3 e Não Autuar 2)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-013', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 584-34 (Procedimento 3 e Não Autuar 2) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-014
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-014', 1, 'De acordo com o campo "Quando Autuar" da Ficha 605-01 do MBFT (Art. 208), qual é a condição fática necessária para caracterizar a infração de avançar o sinal vermelho do semáforo?', '[{"id": "a", "text": "O semáforo estar no foco amarelo quando as rodas traseiras do veículo ultrapassarem o centro geométrico da via."}, {"id": "b", "text": "O semáforo estar efetivamente no foco vermelho no momento do início da passagem do veículo pela linha de retenção."}, {"id": "c", "text": "O condutor não acelerar de forma suficiente para liberar o cruzamento antes do foco verde transversal."}, {"id": "d", "text": "O foco vermelho acender enquanto o veículo já se encontra imobilizado além da linha de bordo da calçada."}]'::jsonb, 'b', 'A Ficha 605-01 do MBFT determina em "Quando Autuar", item 1: "Semáforo efetivamente no vermelho, no início da passagem do veículo pela linha de retenção". É no momento exato em que o veículo inicia a transposição da linha de retenção que se afere a cor do semáforo.', 'Sinalização de Trânsito', 'Avanço de Sinal Vermelho e Linha de Retenção (Art. 208 / 605-01)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-014', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 208 (Ficha MBFT 605-01, Quando Autuar 1)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-014', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 605-01 (Página 1, Quando Autuar 1) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-015
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-015', 1, 'Segundo a Ficha 605-01 do MBFT (Art. 208), o condutor comete a infração de avançar sinal vermelho se transpor a linha de retenção no vermelho, mas parar antes de concluir o cruzamento?', '[{"id": "a", "text": "Não, pois a ausência de travessia integral do cruzamento descaracteriza o avanço e impede a lavratura do auto."}, {"id": "b", "text": "Sim, autua-se mesmo que não complete o movimento, tendo transposto a linha de retenção na fase vermelha, parando na área de cruzamento ou sobre faixa de pedestre."}, {"id": "c", "text": "Apenas se o veículo bloquear fisicamente a passagem de viatura de emergência ou ambulância oficial."}, {"id": "d", "text": "Configura unicamente infração leve de parada indevida sem registro de pontuação na Carteira Nacional de Habilitação."}]'::jsonb, 'b', 'A Ficha 605-01 do MBFT estabelece textualmente em "Quando Autuar", item 2: "Mesmo que não complete o movimento, tendo transposto a linha de retenção na fase vermelha, parando na área de cruzamento ou sobre faixa de pedestre". A infração é consumada no momento da transposição indevida da linha de retenção.', 'Sinalização de Trânsito', 'Transposição Incompleta da Retenção no Vermelho (Art. 208 / 605-01)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-015', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 208 (Ficha MBFT 605-01, Quando Autuar 2)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-015', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 605-01 (Página 1, Quando Autuar 2) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-016
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-016', 1, 'Conforme a tipificação do enquadramento e o campo "Quando NÃO Autuar" da Ficha 605-01 do MBFT, em qual situação o avanço do foco vermelho do semáforo é expressamente permitido pela legislação vigente?', '[{"id": "a", "text": "Em qualquer cruzamento urbano entre as 23 horas e 5 horas da manhã, independentemente de sinalização viária."}, {"id": "b", "text": "Onde houver sinalização que permita a livre conversão à direita prevista no art. 44-A deste Código."}, {"id": "c", "text": "Sempre que o motorista acionar o pisca-alerta e não observar pedestres atravessando num raio de 50 metros."}, {"id": "d", "text": "Quando a fase verde do fluxo perpendicular durar menos de dez segundos segundo cronômetro visual."}]'::jsonb, 'b', 'O Art. 208 do CTB e a Ficha 605-01 do MBFT prescrevem a ressalva explícita: "Avançar o sinal vermelho do semáforo ou o de parada obrigatória, exceto onde houver sinalização que permita a livre conversão à direita prevista no art. 44-A deste Código". E em Quando NÃO Autuar, item 1: "Veículo que faz a conversão à direita, mesmo na fase vermelha, quando houver sinalização que permita esse movimento".', 'Sinalização de Trânsito', 'Livre Conversão à Direita no Foco Vermelho (Art. 208 c/c 44-A)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-016', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 208 (Ficha MBFT 605-01, Amparo Legal c/c Art. 44-A CTB)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-016', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 605-01 (Amparo legal e Quando NÃO Autuar item 1) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-017
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-017', 1, 'A Ficha 605-01 do MBFT estabelece regras claras para veículos que passam pela linha de retenção na fase verde ou amarela e ficam imobilizados sobre a faixa de pedestres ou área de cruzamento ao mudar para o vermelho. Qual enquadramento fiscalizatório deve ser adotado?', '[{"id": "a", "text": "Autuar no Art. 208 em qualquer dos casos, pois a retenção na fase vermelha equivale ao avanço semafórico."}, {"id": "b", "text": "Não autuar no Art. 208; utilizar o enquadramento específico 567-31 (Art. 183) se retido na faixa de pedestre, ou 563-00 (Art. 182, VII) se retido na área de cruzamento."}, {"id": "c", "text": "Aplicar enquadramento de direção perigosa com recolhimento compulsório do veículo ao depósito municipal."}, {"id": "d", "text": "Isentar totalmente o motorista de penalidade atribuindo o erro ao órgão com circunscrição sobre a via."}]'::jsonb, 'b', 'A Ficha 605-01 do MBFT define em "Quando NÃO Autuar", itens 3 e 5: "3. Veículo que passa pela linha de retenção na fase do verde ou do amarelo ou na direita livre e, mudando o sinal para a fase vermelha, fica imobilizado sobre a faixa de pedestres, utilizar enquadramento específico: 567-31, art. 183." e "5. Veículo que passa pela linha de retenção na fase do verde ou do amarelo, mas que fica imobilizado na área de cruzamento de vias, havendo mudança para a fase vermelha, utilizar enquadramento específico: 563-00, Art. 182, VII.".', 'Sinalização de Trânsito', 'Passagem no Verde e Retenção Posterior (Art. 208 vs 183 e 182, VII)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-017', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 208 (Ficha MBFT 605-01, Quando NÃO Autuar 3 e 5)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-017', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 605-01 (Quando NÃO Autuar itens 3 e 5) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-018
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-018', 1, 'Conforme as instruções do campo "Quando Autuar" e Informações Complementares da Ficha 605-02 do MBFT, qual conduta a placa R-1 (Parada Obrigatória) exige do condutor ao se aproximar de uma via?', '[{"id": "a", "text": "Apenas a redução prudente da marcha até 20 km/h para averiguar visualmente o tráfego da via preferencial."}, {"id": "b", "text": "Imobilização total do veículo antes da linha de retenção ou antes da área de conflito do cruzamento, sendo insuficiente ou perigosa a simples redução da velocidade."}, {"id": "c", "text": "Parada do veículo somente se houver outro automóvel ou pedestre efetivamente cruzando a pista no momento."}, {"id": "d", "text": "Acionamento de buzina breve e prosseguimento contínuo em marcha lenta sem frear antes da linha branca."}]'::jsonb, 'b', 'A Ficha 605-02 do MBFT (Quando Autuar, item 1) exige: "Na existência da placa R-1 ou R-21, não havendo imobilização total do veículo: 1.1. antes da área de conflito do cruzamento, na inexistência da linha de retenção; 1.2. antes da linha de retenção". E suas Informações Complementares reforçam: "Seu uso deve se restringir às situações em que a parada de veículos for realmente necessária, sendo insuficiente ou perigosa a simples redução da velocidade".', 'Sinalização de Trânsito', 'Placa R-1 e Imobilização Total Obrigatória (Art. 208 / 605-02)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-018', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 208 (Ficha MBFT 605-02, Quando Autuar 1 e Inf. Compl. 1)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-018', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 605-02 (Quando Autuar item 1 e Inf. Compl. item 1) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-019
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-019', 1, 'Segundo o campo "Quando NÃO Autuar" e Procedimentos da Ficha 605-02 do MBFT, como deve proceder a fiscalização se houver marcação no solo de Linha de Retenção (LRE), porém faltar a placa vertical R-1?', '[{"id": "a", "text": "Autuar normalmente no Art. 208, pois a linha de retenção horizontal tem suficiência probatória autônoma."}, {"id": "b", "text": "Não autuar pelo Art. 208 (605-02), em virtude da falta ou deficiência da sinalização vertical (a linha de retenção não é obrigatória para a via, mas a placa vertical R-1 é indispensável para fundamentar a autuação)."}, {"id": "c", "text": "Autuar o condutor por infração genérica do Art. 195 por desrespeito às marcas transversais da via."}, {"id": "d", "text": "Lavrar o auto de infração somente se houver testemunha civil que comprove a existência anterior de placa no local."}]'::jsonb, 'b', 'A Ficha 605-02 do MBFT determina textualmente no item 1 de "Quando NÃO Autuar": "1. Na falta ou deficiência da sinalização vertical (a linha de retenção não é obrigatória)". Sem a presença visível e regulamentar da sinalização vertical (placa R-1 ou R-21), a simples marcação horizontal isolada não autoriza a autuação por avanço de parada obrigatória.', 'Sinalização de Trânsito', 'Indispensabilidade da Sinalização Vertical R-1 (Art. 208 / 605-02)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-019', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 208 (Ficha MBFT 605-02, Quando NÃO Autuar 1)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-019', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 605-02 (Página 1, Quando NÃO Autuar item 1) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-020
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-020', 1, 'De acordo com o campo "Quando Autuar" (item 2) e Definições da Ficha 605-02 do MBFT, como deve ser autuado o condutor que não atender à ordem de parada obrigatória emitida por gesto do agente de trânsito?', '[{"id": "a", "text": "Autuar no Art. 195 como infração grave de desobediência a comando verbal geral de trânsito."}, {"id": "b", "text": "Autuar no Art. 208 (código 605-02), por não atender à ordem de parada obrigatória emanada pelo agente, por meio de gesto regulamentar, acompanhado ou não de sinal sonoro."}, {"id": "c", "text": "Autuar no Art. 186 por circulação indevida na contramão de direção fixada pelo agente fiscalizador."}, {"id": "d", "text": "Não lavrar auto de infração se o veículo estiver em velocidade compatível com a segurança local."}]'::jsonb, 'b', 'A Ficha 605-02 do MBFT tipifica no item 2 do campo "Quando Autuar": "Veículo que não atender à ordem de parada obrigatória emanada pelo agente, por meio de gesto regulamentar, acompanhado ou não de sinal sonoro". E suas Definições (item 6) reforçam que os gestos de agentes orientam, indicam passagem ou emitem ordens, sobrepondo-se às demais sinalizações viárias.', 'Sinalização de Trânsito', 'Ordem de Parada por Gesto do Agente (Art. 208 / 605-02)', '{}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    status = EXCLUDED.status,
    is_example = EXCLUDED.is_example,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.question_sources (question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status)
VALUES ('sin-020', 'official', 'Resolução CONTRAN nº 985/2022 (Manual Brasileiro de Fiscalização de Trânsito – MBFT)', 'Art. 208 (Ficha MBFT 605-02, Quando Autuar 2 e Definições 6)', 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf', '2026-11-07T23:00:00Z'::timestamptz, '2023-01-02'::date, NULL, 'Resolução CONTRAN nº 985/2022', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at)
VALUES ('sin-020', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Trecho literal da Ficha 605-02 (Página 1, Quando Autuar item 2 e Definições item 6) do MBFT.', 'Tech Lead / Responsável pelo Produto', '2026-11-07T23:43:10Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

COMMIT;
