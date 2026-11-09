-- Migration: 20261108000006_add_questions_sin_021_to_030.sql
-- Inclusão das questões sin-021 a sin-030 em status 'em_revisao' (auditoria humana pendente pelo Tech Lead)
-- Preservação rigorosa de decisões editoriais humanas posteriores em caso de reexecução (Regra D010 / AGENTS.md)

BEGIN;

-- Questão sin-021 (Normas de Circulação)
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-021', 2, 'Ao transitar por qualquer via aberta à circulação, qual é o dever geral do condutor em relação à distância de segurança lateral e frontal e ao bordo da pista, segundo o Art. 29, II do CTB?', '[{"id":"a","text":"Guardar distância de segurança lateral e frontal entre o seu e os demais veículos, bem como em relação ao bordo da pista, considerando a velocidade e as condições do local, da circulação, do veículo e as condições climáticas."},{"id":"b","text":"Manter distância frontal fixa de 5 metros, independentemente da velocidade desenvolvida ou das condições meteorológicas."},{"id":"c","text":"Aproximar-se ao máximo do veículo da frente para reduzir a resistência do ar e economizar combustível."},{"id":"d","text":"Guardar distância apenas em relação aos veículos que trafegam à sua direita, sendo livre a aproximação frontal."}]'::jsonb, 'a',
    'Fundamentação Legal (CTB Art. 29, II): O condutor deverá guardar distância de segurança lateral e frontal entre o seu e os demais veículos, bem como em relação ao bordo da pista, considerando-se, no momento, a velocidade e as condições do local, da circulação, do veículo e as condições climáticas.

Orientação Didática (Direção Defensiva SENATRAN): Na prática de direção defensiva, a SENATRAN recomenda a "regra dos dois segundos" como parâmetro técnico seguro para a distância de seguimento em pista seca, dobrando-a sob chuva.', 'Normas de Circulação', 'Distância de Segurança (CTB Art. 29, II)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'em_revisao', false
) ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    -- Preservação de decisão editorial humana: uma reexecução jamais rebaixa questão aprovada
    status = CASE
        WHEN public.questions.status IN ('aprovada', 'suspensa', 'obsoleta') THEN public.questions.status
        ELSE EXCLUDED.status
    END,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-021', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Manual Básico de Direção Defensiva (SENATRAN)',
    'CTB Art. 29, II • Manual Básico de Direção Defensiva SENATRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-09T08:00:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado (Lei Federal nº 9.503/1997) e Diretrizes Didáticas da SENATRAN', 'Dispositivos legais e normas oficiais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.', 'pending'
) ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    -- Preservação de homologação da fonte
    verification_status = CASE
        WHEN public.question_sources.verification_status = 'verified' THEN public.question_sources.verification_status
        ELSE EXCLUDED.verification_status
    END;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-021', 'Antigravity/Gemini-3.8-Flash', NULL,
    'Questão em revisão técnica e editorial; fundamentação ampliada para cobrir a regra prática dos 2 segundos via Direção Defensiva. Pendente de aprovação humana individualizada pelo Tech Lead.', NULL, NULL
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = COALESCE(public.question_reviews.generator_model, EXCLUDED.generator_model),
    -- Preservação rigorosa de aprovação humana e modelo verificador registrado
    verifier_model = COALESCE(public.question_reviews.verifier_model, EXCLUDED.verifier_model),
    verification_notes = CASE
        WHEN public.question_reviews.approved_by IS NOT NULL THEN public.question_reviews.verification_notes
        ELSE EXCLUDED.verification_notes
    END,
    approved_by = COALESCE(public.question_reviews.approved_by, EXCLUDED.approved_by),
    approved_at = COALESCE(public.question_reviews.approved_at, EXCLUDED.approved_at);

-- Questão sin-022 (Normas de Circulação)
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-022', 2, 'De acordo com as normas atuais do CTB (alteradas pela Lei Federal nº 14.071/2020), em quais situações o uso de farol baixo aceso durante o dia é obrigatório para veículos que NÃO possuam luz de rodagem diurna (DRL)?', '[{"id":"a","text":"Apenas em rodovias federais durante a noite e sob neblina densa."},{"id":"b","text":"Em qualquer via pública urbana ou rural, sempre que o tempo estiver nublado."},{"id":"c","text":"Em rodovias de pista simples situadas fora dos perímetros urbanos, bem como nos túneis e sob chuva, neblina ou cerração."},{"id":"d","text":"Apenas no período entre 18h e 6h, sendo facultativo em qualquer rodovia durante o dia."}]'::jsonb, 'c',
    'Conforme o Art. 40, I e § 2º do CTB (redação da Lei nº 14.071/2020), o condutor deve manter faróis baixos acesos: à noite; mesmo de dia em túneis e sob chuva, neblina ou cerração; e em rodovias de pista simples situadas fora de perímetros urbanos (se não tiver DRL). Em motocicletas, farol baixo é obrigatório dia e noite em qualquer via.', 'Normas de Circulação', 'Uso de Luzes e Faróis (CTB Art. 40 • Lei nº 14.071/2020)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'em_revisao', false
) ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    -- Preservação de decisão editorial humana: uma reexecução jamais rebaixa questão aprovada
    status = CASE
        WHEN public.questions.status IN ('aprovada', 'suspensa', 'obsoleta') THEN public.questions.status
        ELSE EXCLUDED.status
    END,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-022', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Lei Federal nº 14.071/2020',
    'CTB Art. 40, I e § 2º', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-09T08:00:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado (com redação da Lei Federal nº 14.071/2020)', 'Dispositivos legais e normas oficiais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.', 'pending'
) ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    -- Preservação de homologação da fonte
    verification_status = CASE
        WHEN public.question_sources.verification_status = 'verified' THEN public.question_sources.verification_status
        ELSE EXCLUDED.verification_status
    END;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-022', 'Antigravity/Gemini-3.8-Flash', NULL,
    'Questão em revisão técnica e editorial; validado com a redação da Lei nº 14.071/2020. Pendente de aprovação humana individualizada pelo Tech Lead.', NULL, NULL
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = COALESCE(public.question_reviews.generator_model, EXCLUDED.generator_model),
    -- Preservação rigorosa de aprovação humana e modelo verificador registrado
    verifier_model = COALESCE(public.question_reviews.verifier_model, EXCLUDED.verifier_model),
    verification_notes = CASE
        WHEN public.question_reviews.approved_by IS NOT NULL THEN public.question_reviews.verification_notes
        ELSE EXCLUDED.verification_notes
    END,
    approved_by = COALESCE(public.question_reviews.approved_by, EXCLUDED.approved_by),
    approved_at = COALESCE(public.question_reviews.approved_at, EXCLUDED.approved_at);

-- Questão sin-023 (Normas de Circulação)
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-023', 2, 'Em vias urbanas, em que condições o condutor pode fazer uso da buzina e quais restrições legais devem ser obrigatoriamente observadas (Arts. 41 e 227 do CTB e placa R-20 do MBST)?', '[{"id":"a","text":"Apenas em toque breve como advertência necessária para evitar acidentes, sendo proibido o uso prolongado, entre 22h e 6h ou em locais com a placa R-20."},{"id":"b","text":"Livremente a qualquer horário para alertar motoristas que demoram a arrancar no semáforo."},{"id":"c","text":"De forma contínua em áreas residenciais para apressar a travessia de pedestres."},{"id":"d","text":"Apenas aos finais de semana, dispensando cuidados em áreas hospitalares."}]'::jsonb, 'a',
    'O Art. 41 do CTB determina que a buzina só pode ser usada em toque breve para evitar acidentes ou fora de áreas urbanas para indicar ultrapassagem. O Art. 227, inciso V do CTB tipifica como infração leve o uso em locais e horários proibidos pela sinalização regulamentar. A sinalização gráfica que regulamenta essa restrição é a placa R-20 ("Proibido acionar buzina ou sinal sonoro"), instituída pelo Manual Brasileiro de Sinalização de Trânsito — Volume I (aprovado pela Resolução CONTRAN nº 973/2022).', 'Normas de Circulação', 'Uso da Buzina e Sinalização R-20 (CTB Arts. 41 e 227, V • Res. CONTRAN nº 973/2022)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'em_revisao', false
) ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    -- Preservação de decisão editorial humana: uma reexecução jamais rebaixa questão aprovada
    status = CASE
        WHEN public.questions.status IN ('aprovada', 'suspensa', 'obsoleta') THEN public.questions.status
        ELSE EXCLUDED.status
    END,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-023', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resolução CONTRAN nº 973/2022 (MBST Volume I)',
    'CTB Arts. 41 e 227, V • MBST Vol. I (Placa R-20 / Anexo I da Res. CONTRAN nº 973/2022)', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-09T08:00:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado e Resolução CONTRAN nº 973/2022 (MBST Vol. I)', 'Dispositivos legais e normas oficiais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.', 'pending'
) ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    -- Preservação de homologação da fonte
    verification_status = CASE
        WHEN public.question_sources.verification_status = 'verified' THEN public.question_sources.verification_status
        ELSE EXCLUDED.verification_status
    END;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-023', 'Antigravity/Gemini-3.8-Flash', NULL,
    'Questão em revisão técnica e editorial; fundamentação integrada entre Arts. 41 e 227 do CTB e placa R-20. Pendente de aprovação humana individualizada pelo Tech Lead.', NULL, NULL
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = COALESCE(public.question_reviews.generator_model, EXCLUDED.generator_model),
    -- Preservação rigorosa de aprovação humana e modelo verificador registrado
    verifier_model = COALESCE(public.question_reviews.verifier_model, EXCLUDED.verifier_model),
    verification_notes = CASE
        WHEN public.question_reviews.approved_by IS NOT NULL THEN public.question_reviews.verification_notes
        ELSE EXCLUDED.verification_notes
    END,
    approved_by = COALESCE(public.question_reviews.approved_by, EXCLUDED.approved_by),
    approved_at = COALESCE(public.question_reviews.approved_at, EXCLUDED.approved_at);

-- Questão sin-024 (Sinalização Vertical)
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-024', 3, 'Ao avistar a placa de regulamentação R-4a (Proibido Virar à Esquerda), qual é a regra técnica correta segundo o Volume I do Manual Brasileiro de Sinalização de Trânsito (MBST / Resolução CONTRAN nº 973/2022)?', '[{"id":"a","text":"A placa R-4a proíbe exclusivamente a conversão à esquerda para outra via ou lote lindeiro, NÃO proibindo o movimento de retorno (que exige a placa R-5a)."},{"id":"b","text":"A placa R-4a proíbe automaticamente e em qualquer hipótese o retorno à esquerda, sendo proibida a implantação conjunta com a placa R-5a."},{"id":"c","text":"A placa R-4a autoriza virar à esquerda desde que o condutor acione a buzina e reduza para 20 km/h."},{"id":"d","text":"A placa R-4a é de advertência e apenas recomenda que os condutores evitem virar à esquerda em horários de pico."}]'::jsonb, 'a',
    'Conforme o Manual Brasileiro de Sinalização de Trânsito — Volume I (Resolução CONTRAN nº 973/2022, Anexo I, pág. 47), a placa R-4a ("Proibido virar à esquerda") proíbe apenas o movimento de conversão à esquerda para outra via ou lote lindeiro. O manual prescreve expressamente que este sinal NÃO proíbe o movimento de retorno. Se a intenção da autoridade de trânsito for proibir também ou exclusivamente o retorno, deve ser implantado o sinal R-5a ("Proibido retornar à esquerda").', 'Sinalização Vertical', 'Placas de Regulamentação e Movimentos Proibidos (R-4a e R-5a / MBST Vol. I)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'em_revisao', false
) ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    -- Preservação de decisão editorial humana: uma reexecução jamais rebaixa questão aprovada
    status = CASE
        WHEN public.questions.status IN ('aprovada', 'suspensa', 'obsoleta') THEN public.questions.status
        ELSE EXCLUDED.status
    END,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-024', 'official', 'Manual Brasileiro de Sinalização de Trânsito — Volume I (Resolução CONTRAN nº 973/2022, Anexo I)',
    'MBST Vol. I (Placas R-4a e R-5a) • Resolução CONTRAN nº 973/2022', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-09T08:00:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'Resolução CONTRAN nº 973/2022 (MBST Vol. I)', 'Norma técnica oficial federal em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.', 'pending'
) ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    -- Preservação de homologação da fonte
    verification_status = CASE
        WHEN public.question_sources.verification_status = 'verified' THEN public.question_sources.verification_status
        ELSE EXCLUDED.verification_status
    END;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-024', 'Antigravity/Gemini-3.8-Flash', NULL,
    'Reescrita corretiva da regra de não implicação entre R-4a (virar) e R-5a (retorno) com base no MBST Vol. I (Res. CONTRAN 973/2022). Pendente de aprovação humana individualizada pelo Tech Lead.', NULL, NULL
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = COALESCE(public.question_reviews.generator_model, EXCLUDED.generator_model),
    -- Preservação rigorosa de aprovação humana e modelo verificador registrado
    verifier_model = COALESCE(public.question_reviews.verifier_model, EXCLUDED.verifier_model),
    verification_notes = CASE
        WHEN public.question_reviews.approved_by IS NOT NULL THEN public.question_reviews.verification_notes
        ELSE EXCLUDED.verification_notes
    END,
    approved_by = COALESCE(public.question_reviews.approved_by, EXCLUDED.approved_by),
    approved_at = COALESCE(public.question_reviews.approved_at, EXCLUDED.approved_at);

-- Questão sin-025 (Normas de Circulação)
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-025', 2, 'Em uma via arterial urbana onde NÃO existe sinalização regulamentadora de velocidade, qual é a velocidade máxima permitida pelo Código de Trânsito Brasileiro?', '[{"id":"a","text":"80 km/h."},{"id":"b","text":"60 km/h."},{"id":"c","text":"50 km/h."},{"id":"d","text":"40 km/h."}]'::jsonb, 'b',
    'Conforme o Art. 61, § 1º, I do CTB, onde não existir sinalização regulamentadora, a velocidade máxima nas vias urbanas será de: 80 km/h nas vias de trânsito rápido; 60 km/h nas vias arteriais; 40 km/h nas vias coletoras; e 30 km/h nas vias locais.', 'Normas de Circulação', 'Velocidades Máximas em Vias Urbanas (CTB Art. 61, § 1º, I)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'em_revisao', false
) ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    -- Preservação de decisão editorial humana: uma reexecução jamais rebaixa questão aprovada
    status = CASE
        WHEN public.questions.status IN ('aprovada', 'suspensa', 'obsoleta') THEN public.questions.status
        ELSE EXCLUDED.status
    END,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-025', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997)',
    'CTB Art. 61, § 1º, I, b', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-09T08:00:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado (Lei Federal nº 9.503/1997)', 'Dispositivos legais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.', 'pending'
) ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    -- Preservação de homologação da fonte
    verification_status = CASE
        WHEN public.question_sources.verification_status = 'verified' THEN public.question_sources.verification_status
        ELSE EXCLUDED.verification_status
    END;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-025', 'Antigravity/Gemini-3.8-Flash', NULL,
    'Questão em revisão técnica e editorial; classificada na taxonomia de Velocidade e Classificação de Vias. Pendente de aprovação humana individualizada pelo Tech Lead.', NULL, NULL
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = COALESCE(public.question_reviews.generator_model, EXCLUDED.generator_model),
    -- Preservação rigorosa de aprovação humana e modelo verificador registrado
    verifier_model = COALESCE(public.question_reviews.verifier_model, EXCLUDED.verifier_model),
    verification_notes = CASE
        WHEN public.question_reviews.approved_by IS NOT NULL THEN public.question_reviews.verification_notes
        ELSE EXCLUDED.verification_notes
    END,
    approved_by = COALESCE(public.question_reviews.approved_by, EXCLUDED.approved_by),
    approved_at = COALESCE(public.question_reviews.approved_at, EXCLUDED.approved_at);

-- Questão sin-026 (Segurança e Transporte de Passageiros)
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-026', 2, 'Segundo o Art. 64 do CTB (alterado pela Lei Federal nº 14.071/2020) e a Resolução CONTRAN nº 938/2022, qual é a regra obrigatória para o transporte de crianças no banco traseiro em veículos automotores?', '[{"id":"a","text":"Devem ser transportadas nos bancos traseiros em dispositivo de retenção adequado à idade, peso e altura, exceto se já tiverem atingido 1,45m de altura."},{"id":"b","text":"Podem ser transportadas no banco dianteiro a partir dos 7 anos com cinto de segurança comum."},{"id":"c","text":"Crianças de qualquer idade podem viajar no colo dos pais no banco traseiro sem dispositivos adicionais."},{"id":"d","text":"O uso de assento de elevação é obrigatório para todas as crianças até os 14 anos de idade."}]'::jsonb, 'a',
    'O Art. 64 do CTB (redação da Lei nº 14.071/2020) e a Resolução CONTRAN nº 938/2022 determinam que crianças menores de 10 anos de idade que não tenham atingido 1,45m de altura devem ser transportadas nos bancos traseiros utilizando dispositivo de retenção adequado ao seu peso e altura (bebê-conforto, cadeirinha ou assento de elevação). Atingindo 1,45m de altura (mesmo com menos de 10 anos) ou completando 10 anos, podem viajar no banco dianteiro com o cinto de segurança.', 'Segurança e Transporte de Passageiros', 'Dispositivos de Retenção para Crianças (CTB Art. 64 • Res. CONTRAN nº 938/2022)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'em_revisao', false
) ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    -- Preservação de decisão editorial humana: uma reexecução jamais rebaixa questão aprovada
    status = CASE
        WHEN public.questions.status IN ('aprovada', 'suspensa', 'obsoleta') THEN public.questions.status
        ELSE EXCLUDED.status
    END,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-026', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resolução CONTRAN nº 938/2022',
    'CTB Art. 64 (com redação da Lei nº 14.071/2020) • Resolução CONTRAN nº 938/2022', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-09T08:00:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado (Lei nº 14.071/2020) e Resolução CONTRAN nº 938/2022', 'Dispositivos legais e normas oficiais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.', 'pending'
) ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    -- Preservação de homologação da fonte
    verification_status = CASE
        WHEN public.question_sources.verification_status = 'verified' THEN public.question_sources.verification_status
        ELSE EXCLUDED.verification_status
    END;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-026', 'Antigravity/Gemini-3.8-Flash', NULL,
    'Questão em revisão técnica e editorial; classificada na taxonomia de Segurança e Transporte de Passageiros. Pendente de aprovação humana individualizada pelo Tech Lead.', NULL, NULL
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = COALESCE(public.question_reviews.generator_model, EXCLUDED.generator_model),
    -- Preservação rigorosa de aprovação humana e modelo verificador registrado
    verifier_model = COALESCE(public.question_reviews.verifier_model, EXCLUDED.verifier_model),
    verification_notes = CASE
        WHEN public.question_reviews.approved_by IS NOT NULL THEN public.question_reviews.verification_notes
        ELSE EXCLUDED.verification_notes
    END,
    approved_by = COALESCE(public.question_reviews.approved_by, EXCLUDED.approved_by),
    approved_at = COALESCE(public.question_reviews.approved_at, EXCLUDED.approved_at);

-- Questão sin-027 (Segurança e Transporte de Passageiros)
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-027', 3, 'Segundo o Art. 244, inciso V do CTB (com a redação dada pela Lei Federal nº 14.071/2020), qual é a regra para o transporte de crianças na garupa de motocicletas, motonetas ou ciclomotores?', '[{"id":"a","text":"É proibido transportar criança menor de 10 anos de idade ou que não tenha, nas circunstâncias, condições de cuidar da própria segurança."},{"id":"b","text":"É permitido a partir dos 7 anos de idade completos, sem qualquer outra exigência de segurança."},{"id":"c","text":"É permitido para qualquer idade desde que a criança viaje à frente do condutor sobre o tanque."},{"id":"d","text":"É proibido até os 12 anos, independentemente da altura ou uso de capacete."}]'::jsonb, 'a',
    'O Art. 244, V do CTB (alterado pela Lei nº 14.071/2020) classifica como infração gravíssima conduzir motocicleta, motoneta ou ciclomotor transportando criança menor de 10 anos de idade OU que não tenha, nas circunstâncias, condições de cuidar de sua própria segurança (como membro imobilizado ou limitação física).', 'Segurança e Transporte de Passageiros', 'Transporte de Menores em Motocicletas (CTB Art. 244, V)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'em_revisao', false
) ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    -- Preservação de decisão editorial humana: uma reexecução jamais rebaixa questão aprovada
    status = CASE
        WHEN public.questions.status IN ('aprovada', 'suspensa', 'obsoleta') THEN public.questions.status
        ELSE EXCLUDED.status
    END,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-027', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Lei Federal nº 14.071/2020',
    'CTB Art. 244, V • Lei nº 14.071/2020', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-09T08:00:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado (com redação da Lei Federal nº 14.071/2020)', 'Dispositivos legais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.', 'pending'
) ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    -- Preservação de homologação da fonte
    verification_status = CASE
        WHEN public.question_sources.verification_status = 'verified' THEN public.question_sources.verification_status
        ELSE EXCLUDED.verification_status
    END;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-027', 'Antigravity/Gemini-3.8-Flash', NULL,
    'Ajustada a redação para incluir a condição de cuidar da própria segurança conforme Art. 244, V do CTB e apontamento do Tech Lead. Pendente de aprovação humana individualizada pelo Tech Lead.', NULL, NULL
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = COALESCE(public.question_reviews.generator_model, EXCLUDED.generator_model),
    -- Preservação rigorosa de aprovação humana e modelo verificador registrado
    verifier_model = COALESCE(public.question_reviews.verifier_model, EXCLUDED.verifier_model),
    verification_notes = CASE
        WHEN public.question_reviews.approved_by IS NOT NULL THEN public.question_reviews.verification_notes
        ELSE EXCLUDED.verification_notes
    END,
    approved_by = COALESCE(public.question_reviews.approved_by, EXCLUDED.approved_by),
    approved_at = COALESCE(public.question_reviews.approved_at, EXCLUDED.approved_at);

-- Questão sin-028 (Sinalização Vertical)
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-028', 2, 'Qual é a finalidade principal das placas de sinalização de ADVERTÊNCIA (formato quadrado com diagonal vertical, fundo amarelo e orla/símbolo pretos) conforme o CTB e o Manual Brasileiro de Sinalização de Trânsito?', '[{"id":"a","text":"Alertar os usuários da via sobre condições potencialmente perigosas, indicando sua natureza para que adotem cautela."},{"id":"b","text":"Impor restrições, proibições e obrigações de cumprimento compulsório sob pena de multa."},{"id":"c","text":"Indicar pontos turísticos, rotas históricas e distâncias quilométricas entre cidades."},{"id":"d","text":"Demarcar exclusivamente pontos de carga e descarga de mercadorias pesadas."}]'::jsonb, 'a',
    'Conforme o Anexo II do CTB e o Volume II do MBST (aprovado pela Resolução CONTRAN nº 973/2022), a sinalização de advertência tem por finalidade alertar os usuários da via para condições potencialmente perigosas, indicando sua natureza (como curvas acentuadas, lombadas, cruzamentos ou estreitamento de pista), para que os condutores adotem comportamento preventivo antecipado.', 'Sinalização Vertical', 'Conceito e Finalidade da Sinalização de Advertência (CTB Anexo II • MBST Vol. II)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'em_revisao', false
) ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    -- Preservação de decisão editorial humana: uma reexecução jamais rebaixa questão aprovada
    status = CASE
        WHEN public.questions.status IN ('aprovada', 'suspensa', 'obsoleta') THEN public.questions.status
        ELSE EXCLUDED.status
    END,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-028', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997, Anexo II) e Resolução CONTRAN nº 973/2022',
    'CTB Anexo II (Sinalização de Advertência) • MBST Vol. II / Resolução CONTRAN nº 973/2022', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-09T08:00:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Anexo II e Resolução CONTRAN nº 973/2022', 'Normas oficiais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.', 'pending'
) ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    -- Preservação de homologação da fonte
    verification_status = CASE
        WHEN public.question_sources.verification_status = 'verified' THEN public.question_sources.verification_status
        ELSE EXCLUDED.verification_status
    END;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-028', 'Antigravity/Gemini-3.8-Flash', NULL,
    'Questão em revisão técnica e editorial; classificada em Sinalização Vertical. Pendente de aprovação humana individualizada pelo Tech Lead.', NULL, NULL
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = COALESCE(public.question_reviews.generator_model, EXCLUDED.generator_model),
    -- Preservação rigorosa de aprovação humana e modelo verificador registrado
    verifier_model = COALESCE(public.question_reviews.verifier_model, EXCLUDED.verifier_model),
    verification_notes = CASE
        WHEN public.question_reviews.approved_by IS NOT NULL THEN public.question_reviews.verification_notes
        ELSE EXCLUDED.verification_notes
    END,
    approved_by = COALESCE(public.question_reviews.approved_by, EXCLUDED.approved_by),
    approved_at = COALESCE(public.question_reviews.approved_at, EXCLUDED.approved_at);

-- Questão sin-029 (Infrações e Medidas Administrativas)
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-029', 2, 'No âmbito do Código de Trânsito Brasileiro, qual é a diferença fundamental entre uma Penalidade e uma Medida Administrativa?', '[{"id":"a","text":"As penalidades são aplicadas no ato da abordagem pelo policial; as medidas administrativas são aplicadas pelo juiz após 5 anos."},{"id":"b","text":"As penalidades (como multa e suspensão) são aplicadas pela autoridade de trânsito em processo administrativo; as medidas administrativas (como retenção e remoção) são ações preventivas adotadas pelo agente fiscalizador na via."},{"id":"c","text":"Medidas administrativas sempre geram pontuação na CNH, enquanto penalidades nunca geram pontos."},{"id":"d","text":"Não existe qualquer diferença técnica, sendo termos sinônimos no Código de Trânsito."}]'::jsonb, 'b',
    'Conforme o CTB, as Medidas Administrativas (Art. 269) são providências de caráter preventivo e imediato executadas na via pelo agente (Retenção, Remoção, Recolhimento). As Penalidades (Art. 256) são aplicadas exclusivamente pela autoridade de trânsito competente após regular processo administrativo (Advertência por escrito, Multa, Suspensão do direito de dirigir e Cassação da CNH).', 'Infrações e Medidas Administrativas', 'Diferença entre Penalidades e Medidas Administrativas (CTB Arts. 256 e 269)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'em_revisao', false
) ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    -- Preservação de decisão editorial humana: uma reexecução jamais rebaixa questão aprovada
    status = CASE
        WHEN public.questions.status IN ('aprovada', 'suspensa', 'obsoleta') THEN public.questions.status
        ELSE EXCLUDED.status
    END,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-029', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997)',
    'CTB Arts. 256 e 269', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-09T08:00:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado (Lei Federal nº 9.503/1997)', 'Dispositivos legais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.', 'pending'
) ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    -- Preservação de homologação da fonte
    verification_status = CASE
        WHEN public.question_sources.verification_status = 'verified' THEN public.question_sources.verification_status
        ELSE EXCLUDED.verification_status
    END;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-029', 'Antigravity/Gemini-3.8-Flash', NULL,
    'Questão em revisão técnica e editorial; classificada na taxonomia de Infrações e Medidas Administrativas. Pendente de aprovação humana individualizada pelo Tech Lead.', NULL, NULL
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = COALESCE(public.question_reviews.generator_model, EXCLUDED.generator_model),
    -- Preservação rigorosa de aprovação humana e modelo verificador registrado
    verifier_model = COALESCE(public.question_reviews.verifier_model, EXCLUDED.verifier_model),
    verification_notes = CASE
        WHEN public.question_reviews.approved_by IS NOT NULL THEN public.question_reviews.verification_notes
        ELSE EXCLUDED.verification_notes
    END,
    approved_by = COALESCE(public.question_reviews.approved_by, EXCLUDED.approved_by),
    approved_at = COALESCE(public.question_reviews.approved_at, EXCLUDED.approved_at);

-- Questão sin-030 (Normas de Circulação)
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-030', 2, 'Ao perceber a aproximação de veículo de socorro de incêndio, polícia ou ambulância em serviço de urgência com dispositivos sonoros (sirene) e luminosos intermitentes acionados, qual conduta deve ser adotada por condutores e pedestres segundo o Art. 29, VII do CTB?', '[{"id":"a","text":"Os condutores devem deixar livre a passagem pela faixa da esquerda, deslocando-se para a direita da via e parando, se necessário; os pedestres devem aguardar na calçada."},{"id":"b","text":"Os condutores devem acelerar para cruzar antes do veículo de emergência; os pedestres devem correr para atravessar."},{"id":"c","text":"Os condutores que trafegam na faixa da esquerda têm prioridade e devem manter a velocidade constante."},{"id":"d","text":"Todos os veículos devem acionar o pisca-alerta e parar imediatamente sobre a faixa central."}]'::jsonb, 'a',
    'Conforme o Art. 29, inciso VII do CTB, os veículos destinados a socorro de incêndio e salvamento, polícia, fiscalização de trânsito e ambulâncias gozam de livre circulação, estacionamento e parada quando em serviço de urgência e devidamente identificados. Todos os condutores devem deixar livre a passagem pela faixa da esquerda, deslocando-se para a direita e parando, se necessário; e os pedestres devem aguardar no passeio.', 'Normas de Circulação', 'Prioridade de Passagem e Veículos de Emergência (CTB Art. 29, VII)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'em_revisao', false
) ON CONFLICT (id) DO UPDATE SET
    version = EXCLUDED.version,
    statement = EXCLUDED.statement,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    topic = EXCLUDED.topic,
    subtopic = EXCLUDED.subtopic,
    ufs = EXCLUDED.ufs,
    categories = EXCLUDED.categories,
    -- Preservação de decisão editorial humana: uma reexecução jamais rebaixa questão aprovada
    status = CASE
        WHEN public.questions.status IN ('aprovada', 'suspensa', 'obsoleta') THEN public.questions.status
        ELSE EXCLUDED.status
    END,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-030', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997)',
    'CTB Art. 29, VII', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-09T08:00:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado (Lei Federal nº 9.503/1997)', 'Dispositivos legais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.', 'pending'
) ON CONFLICT (question_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    document = EXCLUDED.document,
    provision = EXCLUDED.provision,
    url = EXCLUDED.url,
    checked_at = EXCLUDED.checked_at,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    source_version = EXCLUDED.source_version,
    license_note = EXCLUDED.license_note,
    -- Preservação de homologação da fonte
    verification_status = CASE
        WHEN public.question_sources.verification_status = 'verified' THEN public.question_sources.verification_status
        ELSE EXCLUDED.verification_status
    END;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-030', 'Antigravity/Gemini-3.8-Flash', NULL,
    'Questão em revisão técnica e editorial; classificada em Normas de Circulação. Pendente de aprovação humana individualizada pelo Tech Lead.', NULL, NULL
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = COALESCE(public.question_reviews.generator_model, EXCLUDED.generator_model),
    -- Preservação rigorosa de aprovação humana e modelo verificador registrado
    verifier_model = COALESCE(public.question_reviews.verifier_model, EXCLUDED.verifier_model),
    verification_notes = CASE
        WHEN public.question_reviews.approved_by IS NOT NULL THEN public.question_reviews.verification_notes
        ELSE EXCLUDED.verification_notes
    END,
    approved_by = COALESCE(public.question_reviews.approved_by, EXCLUDED.approved_by),
    approved_at = COALESCE(public.question_reviews.approved_at, EXCLUDED.approved_at);

COMMIT;
