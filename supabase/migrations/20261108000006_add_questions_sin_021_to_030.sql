-- Migration: 20261108000006_add_questions_sin_021_to_030.sql
-- Inclusão das questões sin-021 a sin-030 para totalizar 30 questões no Simulado (D007)

BEGIN;

-- Questão sin-021
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-021', 2, 'Ao transitar por qualquer via aberta à circulação, qual é o dever do condutor em relação à distância de segurança com os demais veículos e com o bordo da pista?', '[{"id":"a","text":"Guardar distância de segurança lateral e frontal entre o seu e os demais veículos, bem como em relação ao bordo da pista, considerando a velocidade e as condições do local e do clima."},{"id":"b","text":"Manter distância frontal fixa de 5 metros, independentemente da velocidade desenvolvida ou das condições meteorológicas."},{"id":"c","text":"Aproximar-se ao máximo do veículo da frente para reduzir a resistência do ar e economizar combustível."},{"id":"d","text":"Guardar distância apenas em relação aos veículos que trafegam à sua direita, sendo livre a aproximação frontal."}]'::jsonb, 'a',
    'O Art. 29, inciso II do CTB determina que o condutor deve guardar distância de segurança lateral e frontal entre o seu e os demais veículos, bem como em relação ao bordo da pista, considerando a velocidade, condições do local, da circulação, do veículo e as condições climáticas. Na direção defensiva para a prova do DETRAN-MG, aplica-se a regra prática dos dois segundos.', 'Sinalização de Trânsito', 'Distância de Segurança Lateral e Frontal (Art. 29, II)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'aprovada', false
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
    status = EXCLUDED.status,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-021', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025',
    'CTB Art. 29, II', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-08T18:40:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Elaborada pela plataforma AprovaCNH com base no CTB e diretrizes do BNQ/SENATRAN — Domínio Público (Art. 8º, IV da Lei 9.610/1998)', 'verified'
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
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-021', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial',
    'Validado conforme Art. 29, II do CTB para o exame teórico de 1ª Habilitação.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T18:40:00Z'::timestamptz
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-022
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-022', 2, 'De acordo com as normas atuais do CTB e as alterações introduzidas pela Lei Federal nº 14.071/2020, em quais situações o uso de farol baixo aceso durante o dia é obrigatório para veículos que NÃO possuam luz de rodagem diurna (DRL)?', '[{"id":"a","text":"Apenas em rodovias federais durante a noite e sob neblina densa."},{"id":"b","text":"Em qualquer via pública urbana ou rural, sempre que o tempo estiver nublado."},{"id":"c","text":"Em rodovias de pista simples situadas fora dos perímetros urbanos, bem como nos túneis e sob chuva, neblina ou cerração."},{"id":"d","text":"Apenas no período entre 18h e 6h, sendo facultativo em qualquer rodovia durante o dia."}]'::jsonb, 'c',
    'Conforme o Art. 40, I e § 2º do CTB (atualizado pela Lei nº 14.071/2020), o condutor deve manter acesos os faróis do veículo, por meio da utilização da luz baixa: à noite; mesmo de dia em túneis e sob chuva, neblina ou cerração; e em rodovias de pista simples situadas fora dos perímetros urbanos (caso o veículo não disponha de DRL). Para motocicletas, o farol baixo deve permanecer aceso dia e noite em qualquer via.', 'Sinalização de Trânsito', 'Uso de Luzes e Faróis (Art. 40 e Lei 14.071/2020)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'aprovada', false
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
    status = EXCLUDED.status,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-022', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025',
    'CTB Art. 40, I e § 2º • Lei nº 14.071/2020', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-08T18:40:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Elaborada pela plataforma AprovaCNH com base no CTB e diretrizes do BNQ/SENATRAN — Domínio Público (Art. 8º, IV da Lei 9.610/1998)', 'verified'
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
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-022', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial',
    'Validado conforme Art. 40 do CTB com redação da Lei 14.071/2020.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T18:40:00Z'::timestamptz
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-023
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-023', 2, 'Em vias urbanas, em que condições e de que maneira o condutor de um veículo automotor pode fazer uso da buzina?', '[{"id":"a","text":"De forma contínua e prolongada para apressar o pedestre que atravessa na faixa."},{"id":"b","text":"Apenas em toque breve, como advertência indispensável para evitar acidentes."},{"id":"c","text":"A qualquer horário, sempre que o semáforo abrir e o condutor da frente demorar a arrancar."},{"id":"d","text":"Livremente entre as 22h e 6h em áreas residenciais para alertar porteiros."}]'::jsonb, 'b',
    'Segundo o Art. 41 do CTB, o condutor de veículo só poderá fazer uso de buzina, desde que em toque breve, para fazer as advertências necessárias a fim de evitar acidentes ou fora das áreas urbanas para indicar propósito de ultrapassagem. É proibido buzinar entre 22h e 6h e em locais com placa R-20.', 'Sinalização de Trânsito', 'Uso da Buzina e Advertência Sonora (Art. 41)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'aprovada', false
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
    status = EXCLUDED.status,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-023', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025',
    'CTB Art. 41, I', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-08T18:40:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Elaborada pela plataforma AprovaCNH com base no CTB e diretrizes do BNQ/SENATRAN — Domínio Público (Art. 8º, IV da Lei 9.610/1998)', 'verified'
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
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-023', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial',
    'Validado conforme Art. 41 do CTB para provas teóricas.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T18:40:00Z'::timestamptz
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-024
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-024', 2, 'Ao avistar a placa de regulamentação R-4a (Proibido Virar à Esquerda), qual regra adicional o condutor deve obrigatoriamente respeitar segundo o Anexo II do CTB?', '[{"id":"a","text":"A proibição de virar à esquerda também proíbe expressamente a manobra de retorno à esquerda no mesmo local."},{"id":"b","text":"O condutor pode retornar à esquerda, desde que não adentre a rua transversal."},{"id":"c","text":"A placa proíbe apenas o tráfego de caminhões e ônibus, liberando automóveis leves."},{"id":"d","text":"A conversão à esquerda é permitida caso não haja veículos no sentido oposto da via."}]'::jsonb, 'a',
    'De acordo com o Manual Brasileiro de Sinalização de Trânsito (Volume I / Res. CONTRAN nº 973/2022) e o Anexo II do CTB, a placa R-4a proíbe a conversão à esquerda e, por decorrência regulamentar direta, proíbe também a manobra de retorno à esquerda.', 'Sinalização de Trânsito', 'Placas de Proibição e Movimentos Proibidos (R-4a / R-4b)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'aprovada', false
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
    status = EXCLUDED.status,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-024', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025',
    'CTB Anexo II • Resolução CONTRAN nº 973/2022', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-08T18:40:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Elaborada pela plataforma AprovaCNH com base no CTB e diretrizes do BNQ/SENATRAN — Domínio Público (Art. 8º, IV da Lei 9.610/1998)', 'verified'
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
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-024', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial',
    'Validado conforme Anexo II do CTB e Res. CONTRAN 973/2022.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T18:40:00Z'::timestamptz
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-025
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-025', 2, 'Em uma via arterial urbana onde NÃO existe sinalização regulamentadora de velocidade, qual é a velocidade máxima permitida pelo Código de Trânsito Brasileiro?', '[{"id":"a","text":"80 km/h."},{"id":"b","text":"60 km/h."},{"id":"c","text":"50 km/h."},{"id":"d","text":"40 km/h."}]'::jsonb, 'b',
    'Para a prova do DETRAN-MG, memorize as velocidades máximas em vias urbanas sem placas (Art. 61, § 1º, I do CTB): Via de trânsito rápido = 80 km/h; Via arterial = 60 km/h; Via coletora = 40 km/h; Via local = 30 km/h.', 'Sinalização de Trânsito', 'Classificação de Vias e Velocidades Regulamentadas (Art. 61)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'aprovada', false
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
    status = EXCLUDED.status,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-025', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025',
    'CTB Art. 61, § 1º, I, b', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-08T18:40:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Elaborada pela plataforma AprovaCNH com base no CTB e diretrizes do BNQ/SENATRAN — Domínio Público (Art. 8º, IV da Lei 9.610/1998)', 'verified'
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
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-025', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial',
    'Validado conforme Art. 61 do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T18:40:00Z'::timestamptz
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-026
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-026', 2, 'Qual é a regra geral prevista no CTB (com a alteração da Lei nº 14.071/2020) para o transporte de crianças com menos de 10 anos de idade em veículos de passeio?', '[{"id":"a","text":"Devem ser transportadas nos bancos traseiros em dispositivo de retenção adequado à idade, peso e altura, exceto se já tiverem atingido 1,45m de altura."},{"id":"b","text":"Podem ser transportadas no banco dianteiro a partir dos 7 anos com cinto de segurança comum."},{"id":"c","text":"Crianças de qualquer idade podem viajar no colo dos pais no banco traseiro sem dispositivos adicionais."},{"id":"d","text":"O uso de assento de elevação é obrigatório para todas as crianças até os 14 anos de idade."}]'::jsonb, 'a',
    'O Art. 64 do CTB determina que menores de 10 anos que não tenham atingido 1,45m de altura devem ser transportados nos bancos traseiros em dispositivo de retenção adequado (bebê-conforto, cadeirinha ou assento de elevação). Atingindo 1,45m de altura ou 10 anos, podem viajar no banco dianteiro com cinto.', 'Sinalização de Trânsito', 'Transporte de Crianças e Dispositivos de Retenção (Art. 64)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'aprovada', false
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
    status = EXCLUDED.status,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-026', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025',
    'CTB Art. 64 • Lei nº 14.071/2020', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-08T18:40:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Elaborada pela plataforma AprovaCNH com base no CTB e diretrizes do BNQ/SENATRAN — Domínio Público (Art. 8º, IV da Lei 9.610/1998)', 'verified'
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
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-026', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial',
    'Validado conforme Art. 64 do CTB e Res. CONTRAN 996/2023.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T18:40:00Z'::timestamptz
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-027
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-027', 2, 'Qual é a idade mínima permitida pelo CTB para que uma criança seja transportada na garupa de uma motocicleta, motoneta ou ciclomotor?', '[{"id":"a","text":"7 anos de idade."},{"id":"b","text":"10 anos de idade."},{"id":"c","text":"12 anos de idade."},{"id":"d","text":"Não há limite mínimo de idade caso a criança utilize capacete infantil regulamentado."}]'::jsonb, 'b',
    'A Lei nº 14.071/2020 alterou o Art. 244, V do CTB: transportar criança menor de 10 anos (ou sem condições de cuidar de sua própria segurança) em moto é infração GRAVÍSSIMA, sujeita a multa e suspensão do direito de dirigir.', 'Sinalização de Trânsito', 'Normas de Motocicletas e Transporte de Menores (Art. 244, V)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'aprovada', false
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
    status = EXCLUDED.status,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-027', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025',
    'CTB Art. 244, V • Lei nº 14.071/2020', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-08T18:40:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Elaborada pela plataforma AprovaCNH com base no CTB e diretrizes do BNQ/SENATRAN — Domínio Público (Art. 8º, IV da Lei 9.610/1998)', 'verified'
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
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-027', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial',
    'Validado conforme Art. 244, V do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T18:40:00Z'::timestamptz
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-028
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-028', 2, 'Qual é a finalidade principal das placas de sinalização de ADVERTÊNCIA (formato quadrado com diagonal vertical, fundo amarelo e orla/símbolo pretos)?', '[{"id":"a","text":"Alertar os usuários da via sobre condições potencialmente perigosas, indicando sua natureza para que adotem cautela."},{"id":"b","text":"Impor restrições, proibições e obrigações de cumprimento compulsório sob pena de multa."},{"id":"c","text":"Indicar pontos turísticos, rotas históricas e distâncias quilométricas entre cidades."},{"id":"d","text":"Demarcar exclusivamente pontos de carga e descarga de mercadorias pesadas."}]'::jsonb, 'a',
    'Conforme o Anexo II do CTB e a Resolução CONTRAN nº 973/2022, a sinalização de advertência tem por finalidade alertar os usuários da via para condições potencialmente perigosas, indicando sua natureza (ex: curvas acentuadas, pista sinuosa, declive acentuado).', 'Sinalização de Trânsito', 'Conceito e Finalidade da Sinalização de Advertência', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'aprovada', false
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
    status = EXCLUDED.status,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-028', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025',
    'CTB Anexo II • Resolução CONTRAN nº 973/2022', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-08T18:40:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Elaborada pela plataforma AprovaCNH com base no CTB e diretrizes do BNQ/SENATRAN — Domínio Público (Art. 8º, IV da Lei 9.610/1998)', 'verified'
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
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-028', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial',
    'Validado conforme Anexo II do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T18:40:00Z'::timestamptz
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-029
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-029', 2, 'No âmbito do Código de Trânsito Brasileiro, qual é a diferença fundamental entre uma Penalidade e uma Medida Administrativa?', '[{"id":"a","text":"As penalidades são aplicadas no ato da abordagem pelo policial; as medidas administrativas são aplicadas pelo juiz após 5 anos."},{"id":"b","text":"As penalidades (como multa e suspensão) são aplicadas pela autoridade de trânsito em processo administrativo; as medidas administrativas (como retenção e remoção) são ações preventivas adotadas pelo agente fiscalizador na via."},{"id":"c","text":"Medidas administrativas sempre geram pontuação na CNH, enquanto penalidades nunca geram pontos."},{"id":"d","text":"Não existe qualquer diferença técnica, sendo termos sinônimos no Código de Trânsito."}]'::jsonb, 'b',
    'Para a prova do DETRAN-MG, memorize: Medidas Administrativas (Art. 269 do CTB) começam prioritariamente com R ou T (Retenção, Remoção, Recolhimento, Transbordo) e são executadas na via pelo agente. Penalidades (Art. 256) são aplicadas pela autoridade de trânsito (Multa, Advertência por escrito, Suspensão do direito de dirigir e Cassação da CNH).', 'Sinalização de Trânsito', 'Diferença entre Penalidades e Medidas Administrativas (Arts. 256 e 269)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'aprovada', false
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
    status = EXCLUDED.status,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-029', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025',
    'CTB Arts. 256 e 269', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-08T18:40:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Elaborada pela plataforma AprovaCNH com base no CTB e diretrizes do BNQ/SENATRAN — Domínio Público (Art. 8º, IV da Lei 9.610/1998)', 'verified'
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
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-029', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial',
    'Validado conforme Arts. 256 e 269 do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T18:40:00Z'::timestamptz
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questão sin-030
INSERT INTO public.questions (
    id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example
) VALUES (
    'sin-030', 2, 'Ao perceber a aproximação de veículo de socorro de incêndio, polícia ou ambulância em serviço de urgência com sirene e luz intermitente acionadas, qual deve ser a conduta dos condutores e pedestres?', '[{"id":"a","text":"Os condutores devem deixar livre a passagem pela faixa da esquerda, deslocando-se para a direita da via e parando, se necessário; os pedestres devem aguardar na calçada."},{"id":"b","text":"Os condutores devem acelerar para cruzar antes do veículo de emergência; os pedestres devem correr para atravessar."},{"id":"c","text":"Os condutores que trafegam na faixa da esquerda têm prioridade e devem manter a velocidade constante."},{"id":"d","text":"Todos os veículos devem acionar o pisca-alerta e parar imediatamente sobre a faixa central."}]'::jsonb, 'a',
    'Conforme o Art. 29, VII do CTB, os veículos de socorro em serviço de urgência têm prioridade de trânsito e livre circulação. Todos os condutores devem deixar livre a faixa da esquerda, indo para a direita e parando, se necessário; os pedestres devem aguardar no passeio.', 'Sinalização de Trânsito', 'Prioridade de Passagem e Veículos de Emergência (Art. 29, VII)', ARRAY['MG']::varchar(2)[], ARRAY['A','B']::varchar(5)[], 'aprovada', false
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
    status = EXCLUDED.status,
    is_example = false;

INSERT INTO public.question_sources (
    question_id, kind, document, provision, url, checked_at, effective_from, effective_until, source_version, license_note, verification_status
) VALUES (
    'sin-030', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025',
    'CTB Art. 29, VII', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    '2026-11-08T18:40:00Z'::timestamptz, '2023-01-02'::date, NULL,
    'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Elaborada pela plataforma AprovaCNH com base no CTB e diretrizes do BNQ/SENATRAN — Domínio Público (Art. 8º, IV da Lei 9.610/1998)', 'verified'
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
    verification_status = EXCLUDED.verification_status;

INSERT INTO public.question_reviews (
    question_id, generator_model, verifier_model, verification_notes, approved_by, approved_at
) VALUES (
    'sin-030', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial',
    'Validado conforme Art. 29, VII do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T18:40:00Z'::timestamptz
) ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

COMMIT;
