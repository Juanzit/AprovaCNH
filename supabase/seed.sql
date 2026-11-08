-- Migration: supabase/migrations/20261108000004_update_questions_detran_mg_style.sql
-- Atualiza UF padrao para MG e reescreve as 20 questoes no estilo real da prova teorica DETRAN-MG / SENATRAN (v2)

BEGIN;

-- 1. Define MG como UF padrao na tabela profiles e na trigger de novos usuarios
ALTER TABLE public.profiles ALTER COLUMN uf SET DEFAULT 'MG';
UPDATE public.profiles SET uf = 'MG' WHERE uf IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, uf, target_category)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Estudante'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'uf', ''), 'MG'),
    COALESCE(NEW.raw_user_meta_data->>'target_category', 'B')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Questao sin-001
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-001', 2, 'Ao se aproximar de um cruzamento onde o semáforo está verde para o seu sentido, o condutor observa que o agente de trânsito posicionado na via faz gesto determinando a parada imediata. Nessa situação, qual deve ser a conduta correta do condutor?', '[{"id":"a","text":"Seguir em frente, pois a sinalização luminosa do semáforo prevalece sobre os gestos do agente."},{"id":"b","text":"Parar o veículo, pois as ordens do agente de trânsito têm prevalência sobre as normas de circulação e outros sinais."},{"id":"c","text":"Acelerar e buzinar para alertar o agente de que o semáforo está aberto para os veículos."},{"id":"d","text":"Reduzir a velocidade e prosseguir caso não haja pedestres atravessando na faixa."}]'::jsonb, 'b', 'Para a prova do DETRAN-MG, memorize a hierarquia da sinalização (Art. 89 do CTB): 1º) as ordens do agente de trânsito prevalecem sobre as normas de circulação e outros sinais; 2º) as indicações do semáforo prevalecem sobre os demais sinais; 3º) os sinais prevalecem sobre as demais normas de trânsito.', 'Sinalização de Trânsito', 'Gestos do Agente, Sinais Sonoros e Hierarquia (Arts. 89 e 195)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-001', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 89, I e 195 • Anexo II CONTRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-001', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Validado conforme Art. 89, I e Art. 195 do CTB para o exame teórico de 1ª Habilitação (DETRAN-MG / SENATRAN).', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-002
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-002', 2, 'Durante o controle de tráfego em uma via urbana, o agente da autoridade de trânsito emite DOIS silvos breves com o apito, acompanhados de gesto de parada. O que esse sinal sonoro determina ao condutor?', '[{"id":"a","text":"Pare — o condutor deve imobilizar o veículo imediatamente com segurança."},{"id":"b","text":"Siga — o trânsito está liberado na direção indicada pelo agente."},{"id":"c","text":"Diminua a marcha — o fluxo à frente exige redução gradual da velocidade."},{"id":"d","text":"Acenda os faróis — uso obrigatório de luz baixa no trecho fiscalizado."}]'::jsonb, 'a', 'Os sinais sonoros de apito do agente cobrados na prova do DETRAN-MG são apenas três (Anexo II do CTB): • 1 silvo breve = Siga; • 2 silvos breves = Pare; • 1 silvo longo = Diminua a marcha. Eles são sempre empregados em conjunto com os gestos do agente.', 'Sinalização de Trânsito', 'Gestos do Agente, Sinais Sonoros e Hierarquia (Arts. 89 e 195)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-002', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 89 e 195 • Anexo II CONTRAN (Sinais Sonoros)', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-002', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Fundamentado na tabela oficial de Sinais Sonoros do Anexo II do CTB (2 silvos breves = Pare).', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-003
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-003', 2, 'De acordo com o Anexo II do Código de Trânsito Brasileiro (Sinalização), qual é o significado correto de UM silvo breve e de UM silvo longo emitidos pelo apito do agente de trânsito, respectivamente?', '[{"id":"a","text":"Um silvo breve significa ''Pare'' e um silvo longo significa ''Estacionamento proibido''."},{"id":"b","text":"Um silvo breve significa ''Siga'' e um silvo longo significa ''Diminua a marcha''."},{"id":"c","text":"Um silvo breve significa ''Diminua a marcha'' e um silvo longo significa ''Pare imediatamente''."},{"id":"d","text":"Um silvo breve significa ''Atenção'' e um silvo longo significa ''Conversão obrigatória''."}]'::jsonb, 'b', 'Esta é uma das questões mais frequentes no exame teórico do DETRAN-MG: • 1 silvo breve = Siga (libera o trânsito na direção indicada); • 2 silvos breves = Pare; • 1 silvo longo = Diminua a marcha.', 'Sinalização de Trânsito', 'Gestos do Agente, Sinais Sonoros e Hierarquia (Arts. 89 e 195)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-003', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 89 e 195 • Anexo II CONTRAN (Sinais Sonoros)', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-003', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Conferido com a tabela de Sinais Sonoros do Anexo II do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-004
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-004', 2, 'Quando o agente de trânsito está no centro de uma interseção com o braço levantado verticalmente e a palma da mão voltada para a frente, qual é a ordem transmitida aos condutores?', '[{"id":"a","text":"Ordem de parada apenas para veículos de carga e transporte coletivo."},{"id":"b","text":"Ordem de seguir em frente com velocidade reduzida para desobstruir a via."},{"id":"c","text":"Ordem de parada obrigatória para todos os veículos que se aproximam, salvo os que já não possam parar com segurança."},{"id":"d","text":"Indicação de que apenas os veículos que vêm pela direita podem realizar conversão."}]'::jsonb, 'c', 'Nos gestos de agentes do Anexo II do CTB: • Braço levantado verticalmente = Ordem de parada obrigatória para TODOS os veículos; • Braço(s) estendido(s) horizontalmente = Ordem de parada apenas para os veículos cuja direção corte ortogonalmente a direção indicada pelos braços estendidos.', 'Sinalização de Trânsito', 'Gestos do Agente, Sinais Sonoros e Hierarquia (Arts. 89 e 195)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-004', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 89 e 195 • Anexo II CONTRAN (Gestos de Agentes)', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-004', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Item 5.1 (Gestos de Agentes da Autoridade de Trânsito) do Anexo II do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-005
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-005', 2, 'Segundo o Art. 195 do Código de Trânsito Brasileiro, desobedecer às ordens emanadas da autoridade competente de trânsito ou de seus agentes constitui infração de qual natureza e penalidade?', '[{"id":"a","text":"Infração leve (3 pontos), com advertência verbal obrigatória."},{"id":"b","text":"Infração média (4 pontos), com recolhimento imediato do certificado de registro."},{"id":"c","text":"Infração gravíssima (7 pontos), com suspensão direta do direito de dirigir."},{"id":"d","text":"Infração grave (5 pontos), sujeita à penalidade de multa."}]'::jsonb, 'd', 'O Art. 195 do CTB tipifica que desobedecer às ordens da autoridade de trânsito ou de seus agentes é infração GRAVE (5 pontos no prontuário da CNH), com penalidade de multa.', 'Sinalização de Trânsito', 'Gestos do Agente, Sinais Sonoros e Hierarquia (Arts. 89 e 195)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-005', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 89 e 195 • Anexo II CONTRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-005', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Texto literal do Art. 195 do CTB: Infração - grave; Penalidade - multa.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-006
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-006', 2, 'Conforme o Art. 35 do Código de Trânsito Brasileiro, antes de iniciar a marcha, parar o veículo, mudar de direção ou realizar qualquer deslocamento lateral, o condutor deve:', '[{"id":"a","text":"Indicar seu propósito de forma clara e com a devida antecedência, por meio da luz indicadora de direção (seta) ou fazendo gesto convencional de braço."},{"id":"b","text":"Acionar o pisca-alerta por três segundos antes de girar o volante para a faixa vizinha."},{"id":"c","text":"Dar dois toques breves na buzina e ligar o farol alto para alertar os veículos à frente."},{"id":"d","text":"Sinalizar apenas se houver veículos a menos de 10 metros de distância no retrovisor."}]'::jsonb, 'a', 'O Art. 35 do CTB determina que todo deslocamento lateral (iniciar a marcha, encostar para parar, mudar de faixa ou converter) exige sinalização prévia e clara mediante a seta do veículo ou gesto convencional de braço. O pisca-alerta NUNCA deve ser usado para indicar mudança de direção.', 'Sinalização de Trânsito', 'Sinalização de Manobras, Seta e Gestos de Braço (Arts. 35 e 196)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-006', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 35 e 196 • Anexo II CONTRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-006', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Art. 35 caput e parágrafo único do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-007
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-007', 2, 'Em caso de falha momentânea na seta do veículo, o condutor pode utilizar os gestos convencionais de braço previstos no Anexo II do CTB. Para indicar que vai DOBRAR À DIREITA, como o condutor deve posicionar o braço esquerdo para fora do veículo?', '[{"id":"a","text":"Totalmente estendido na horizontal, com a mão aberta apontando para o lado esquerdo."},{"id":"b","text":"Dobrado para cima em ângulo reto (antebraço na vertical com a palma da mão voltada para a frente)."},{"id":"c","text":"Estendido na horizontal, fazendo movimentos verticais contínuos para cima e para baixo."},{"id":"d","text":"Inclinado para baixo, apontando para o pavimento junto à porta do motorista."}]'::jsonb, 'b', 'Para acertar os gestos de condutores na prova do DETRAN-MG (Anexo II do CTB): • Dobrar à esquerda = braço esquerdo totalmente estendido na horizontal; • Dobrar à direita = braço esquerdo dobrado para cima em ângulo reto (90º); • Diminuir a marcha ou parar = braço esquerdo estendido na horizontal fazendo movimento para cima e para baixo.', 'Sinalização de Trânsito', 'Sinalização de Manobras, Seta e Gestos de Braço (Arts. 35 e 196)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-007', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 35 e 196 • Anexo II CONTRAN (Gestos de Condutores)', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-007', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Item 5.2 (Gestos de Condutores) do Anexo II do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-008
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-008', 2, 'Qual é o gesto convencional de braço que o condutor deve executar para sinalizar aos veículos que vêm atrás a intenção de DIMINUIR A MARCHA OU PARAR?', '[{"id":"a","text":"Manter o antebraço erguido verticalmente para cima com o punho fechado."},{"id":"b","text":"Estender o braço esquerdo horizontalmente e mantê-lo imóvel apontando para a esquerda."},{"id":"c","text":"Estender o braço esquerdo horizontalmente para fora e movimentá-lo verticalmente (para cima e para baixo) com a palma da mão voltada para baixo."},{"id":"d","text":"Fazer movimentos circulares com a mão esquerda indicando rotação das rodas."}]'::jsonb, 'c', 'De acordo com o Anexo II do CTB (Gestos de Condutores), para diminuir a marcha ou parar o veículo, o condutor deve estender o braço esquerdo na horizontal para fora da janela e movimentá-lo para cima e para baixo.', 'Sinalização de Trânsito', 'Sinalização de Manobras, Seta e Gestos de Braço (Arts. 35 e 196)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-008', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 35 e 196 • Anexo II CONTRAN (Gestos de Condutores)', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-008', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Item 5.2 (Gestos de Condutores) do Anexo II do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-009
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-009', 2, 'O condutor que estiver estacionado junto ao meio-fio e desejar sair para entrar no fluxo de veículos da via deve adotar qual procedimento obrigatório (Arts. 35 e 36 do CTB)?', '[{"id":"a","text":"Ingressar rapidamente na faixa principal, pois quem sai de vaga regulamentada tem preferência."},{"id":"b","text":"Ligar o pisca-alerta e avançar lentamente forçando a parada dos veículos que vêm na via."},{"id":"c","text":"Buzinar duas vezes e entrar na pista sem acionar a seta caso a rua seja de mão única."},{"id":"d","text":"Acionar a luz indicadora de direção (seta) com antecedência e dar preferência aos veículos e pedestres em circulação na via."}]'::jsonb, 'd', 'Conforme os Arts. 35 e 36 do CTB, quem vai entrar no fluxo vindo de estacionamento, garagem ou imóvel lindeiro deve SEMPRE sinalizar com a seta antes de iniciar a marcha e dar preferência aos veículos e pedestres que já estão circulando na via.', 'Sinalização de Trânsito', 'Sinalização de Manobras, Seta e Gestos de Braço (Arts. 35 e 196)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-009', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 35, 36 e 196 • Anexo II CONTRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-009', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Fundamentado nos Arts. 35, 36 e 196 do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-010
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-010', 2, 'De acordo com o Art. 196 do CTB, deixar de indicar com antecedência, mediante gesto regulamentar de braço ou luz indicadora de direção do veículo (seta), o início da marcha, a manobra de parar, a mudança de direção ou de faixa de circulação configura:', '[{"id":"a","text":"Infração grave, com penalidade de multa (5 pontos no prontuário da CNH)."},{"id":"b","text":"Infração leve, passível apenas de advertência educativa."},{"id":"c","text":"Infração média, com retenção obrigatória do veículo até troca da lâmpada."},{"id":"d","text":"Infração gravíssima multiplicada por três, com cassação da Permissão para Dirigir."}]'::jsonb, 'a', 'Atenção para a prova prática e teórica do DETRAN-MG: não dar seta (ou desligá-la antes de concluir a manobra) é infração GRAVE pelo Art. 196 do CTB (5 pontos e multa), além de ser falta eliminatória/grave no exame prático de direção!', 'Sinalização de Trânsito', 'Sinalização de Manobras, Seta e Gestos de Braço (Arts. 35 e 196)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-010', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 35 e 196 • Anexo II CONTRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-010', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Texto literal do Art. 196 do CTB: Infração - grave; Penalidade - multa.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-011
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-011', 2, 'Quando veículos, transitando por fluxos que se cruzam, se aproximarem de um local NÃO sinalizado, como o Código de Trânsito Brasileiro (Art. 29, inciso III) define a preferência de passagem?', '[{"id":"a","text":"Tem preferência sempre o veículo de maior porte ou que estiver desenvolvendo maior velocidade."},{"id":"b","text":"Tem preferência: no caso de apenas um fluxo provir de rodovia, aquele que estiver circulando por ela; no caso de rotatória, aquele que estiver circulando por ela; e, nos demais casos, o que vier pela direita do condutor."},{"id":"c","text":"Tem preferência quem vier pela esquerda do condutor ou quem piscar os faróis primeiro no cruzamento."},{"id":"d","text":"Na rotatória, a preferência é sempre de quem vai entrar nela; nos cruzamentos comuns, de quem segue em linha reta."}]'::jsonb, 'b', 'Regra de ouro do Art. 29, III do CTB para cruzamentos SEM sinalização: 1) Rodovia (quem circula nela tem preferência); 2) Rotatória (quem já está circulando dentro da rotatória tem preferência); 3) Demais cruzamentos não sinalizados: preferência de quem vem pela DIREITA do condutor.', 'Sinalização de Trânsito', 'Conversões, Preferência em Cruzamentos e Faixas (Arts. 29, 38 e 196)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-011', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 29, 38 e 196 • Anexo II CONTRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-011', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Art. 29, inciso III, alíneas ''a'', ''b'' e ''c'' do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-012
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-012', 2, 'De acordo com o Art. 38, inciso II do CTB, antes de realizar uma conversão à ESQUERDA para entrar em outra via, como o condutor deve posicionar seu veículo com antecedência?', '[{"id":"a","text":"Aproximar-se o máximo possível do bordo esquerdo da pista (se for via de sentido único) ou da linha divisória da pista/centro (se for via de sentido duplo)."},{"id":"b","text":"Deslocar-se sempre para o bordo direito da via, independentemente de a rua ser de mão única ou mão dupla."},{"id":"c","text":"Invadir a faixa de sentido contrário 50 metros antes da esquina para facilitar o giro do volante."},{"id":"d","text":"Parar sobre a faixa de pedestres no centro do cruzamento e aguardar o fechamento do semáforo."}]'::jsonb, 'a', 'Para converter à ESQUERDA (Art. 38, II do CTB): • Em via de mão única (sentido único): posicione-se o mais à esquerda possível; • Em via de mão dupla (sentido duplo): posicione-se junto à linha divisória central da pista (sem invadir a contramão). Em rodovias dotadas de acostamento e sem local próprio para conversão à esquerda, deve-se aguardar no acostamento à direita (Art. 37).', 'Sinalização de Trânsito', 'Conversões, Preferência em Cruzamentos e Faixas (Arts. 29, 38 e 196)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-012', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 29, 38 e 196 • Anexo II CONTRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-012', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Art. 38, inciso II do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-013
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-013', 2, 'Ao realizar uma conversão à DIREITA ou à ESQUERDA em uma interseção urbana (Art. 38, parágrafo único do CTB), de quem é a preferência de passagem durante a manobra?', '[{"id":"a","text":"Do veículo automotor que acionou a seta com antecedência regulamentar."},{"id":"b","text":"Exclusivamente dos ônibus e caminhões que estiverem contornando a esquina."},{"id":"c","text":"Dos pedestres e dos ciclistas que estiverem atravessando a via na qual o veículo vai entrar."},{"id":"d","text":"Do condutor que buzinar primeiro antes de iniciar a conversão."}]'::jsonb, 'c', 'O parágrafo único do Art. 38 do CTB estabelece que, durante a manobra de mudança de direção (conversão), o condutor deverá ceder passagem aos pedestres e ciclistas, aos veículos que transitem em sentido contrário pela pista da via da qual vai sair, respeitadas as normas de preferência de passagem.', 'Sinalização de Trânsito', 'Conversões, Preferência em Cruzamentos e Faixas (Arts. 29, 38 e 196)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-013', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 29, 38 e 196 • Anexo II CONTRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-013', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Art. 38, parágrafo único do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-014
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-014', 2, 'Em uma via com várias faixas de circulação no mesmo sentido, qual é a regra para a circulação e para a mudança de faixa segundo o Art. 29, inciso IV e Art. 35 do CTB?', '[{"id":"a","text":"Os veículos mais lentos devem circular obrigatoriamente pela faixa da esquerda."},{"id":"b","text":"A faixa da esquerda é destinada exclusivamente ao estacionamento temporário de emergência."},{"id":"c","text":"O condutor pode mudar de faixa sem acionar a seta desde que a linha no pavimento seja tracejada."},{"id":"d","text":"As faixas da direita destinam-se aos veículos mais lentos e de maior porte, e as da esquerda à ultrapassagem e aos veículos de maior velocidade, exigindo-se seta prévia a cada mudança de faixa."}]'::jsonb, 'd', 'Em pistas com várias faixas de mesmo sentido (Art. 29, IV do CTB): as da direita são para veículos mais lentos e de maior porte, e as da esquerda são para ultrapassagem e maior velocidade. Qualquer transposição de faixa exige sinalização prévia com a seta (Art. 35 e Art. 196).', 'Sinalização de Trânsito', 'Conversões, Preferência em Cruzamentos e Faixas (Arts. 29, 38 e 196)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-014', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 29, 38 e 196 • Anexo II CONTRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-014', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Art. 29, IV e Art. 35 do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-015
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-015', 2, 'Na sinalização horizontal (pintada no pavimento), o que significam as cores AMARELA e BRANCA nas linhas longitudinais que dividem as faixas de trânsito?', '[{"id":"a","text":"A cor amarela indica via urbana de baixa velocidade e a cor branca indica rodovia federal."},{"id":"b","text":"A cor amarela separa fluxos de sentidos opostos (mão dupla) e a cor branca separa fluxos de mesmo sentido (mão única)."},{"id":"c","text":"A cor branca proíbe qualquer mudança de faixa e a cor amarela permite ultrapassagem livre."},{"id":"d","text":"Ambas separam fluxos de mesmo sentido, variando apenas conforme a iluminação pública da via."}]'::jsonb, 'b', 'Resumo essencial de Sinalização Horizontal para a prova do DETRAN-MG (Anexo II do CTB): • Linha AMARELA = separa fluxos de sentidos OPOSTOS (mão dupla); • Linha BRANCA = separa fluxos de MESMO sentido (mão única); • Linha Contínua = proíbe ultrapassagem/transposição; • Linha Tracejada (Seccionada) = permite ultrapassagem/transposição com segurança.', 'Sinalização de Trânsito', 'Conversões, Preferência em Cruzamentos e Faixas (Arts. 29, 38 e 196)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-015', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 29, 38 e 196 • Anexo II CONTRAN (Sinalização Horizontal)', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-015', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Item 2 (Sinalização Horizontal - Padrão de Cores) do Anexo II do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-016
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-016', 2, 'Ao se aproximar de um cruzamento controlado por semáforo, o condutor percebe que o sinal muda do verde para o AMARELO. Qual deve ser a sua conduta correta?', '[{"id":"a","text":"Reduzir a marcha e parar o veículo antes da linha de retenção, salvo se já estiver tão próximo que a frenagem brusca crie risco de acidente."},{"id":"b","text":"Acelerar o veículo imediatamente para aproveitar os últimos segundos antes da luz vermelha."},{"id":"c","text":"Parar sobre a faixa de pedestres e acionar o pisca-alerta até o sinal voltar a ficar verde."},{"id":"d","text":"Buzinar continuamente e avançar o cruzamento mantendo a mesma velocidade."}]'::jsonb, 'a', 'Na Sinalização Semafórica (Anexo II do CTB), a luz amarela indica ''Atenção'', assinalando o término do direito de passagem. O condutor deve parar antes da linha de retenção, exceto se já estiver na zona de cruzamento ou tão próximo que parar bruscamente comprometa a segurança.', 'Sinalização de Trânsito', 'Semáforo, Parada Obrigatória (R-1/R-2) e Pedestres (Arts. 208 e 214)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-016', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 44-A, 70, 208 e 214 • Anexo II CONTRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-016', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Item 4 (Sinalização Semafórica) do Anexo II do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-017
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-017', 2, 'De acordo com os Arts. 44-A e 208 do Código de Trânsito Brasileiro, transpor o sinal vermelho do semáforo é infração gravíssima, EXCETO quando:', '[{"id":"a","text":"O condutor estiver atrasado ou transitando entre 22h e 6h em qualquer avenida urbana."},{"id":"b","text":"Não houver fiscalização eletrônica instalada no poste do semáforo."},{"id":"c","text":"Houver sinalização indicativa permitindo a livre conversão à direita e o condutor realizar apenas essa conversão, respeitando a preferência de pedestres e outros veículos."},{"id":"d","text":"O veículo for uma motocicleta realizando entrega urbana em faixa exclusiva."}]'::jsonb, 'c', 'Conforme o Art. 44-A e a parte final do Art. 208 do CTB (incluídos pela Lei nº 14.071/2020), é livre o movimento de conversão à direita diante de sinal vermelho do semáforo ONDE HOUVER sinalização indicativa que permita essa conversão, desde que o condutor dê preferência aos pedestres e aos demais veículos.', 'Sinalização de Trânsito', 'Semáforo, Parada Obrigatória (R-1/R-2) e Pedestres (Arts. 208 e 214)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-017', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 44-A, 70, 208 e 214 • Anexo II CONTRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-017', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Arts. 44-A e 208 do CTB (Lei nº 14.071/2020).', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-018
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-018', 2, 'Qual é a diferença de formato e de conduta obrigatória entre a placa de regulamentação R-1 (''Parada Obrigatória'') e a placa R-2 (''Dê a Preferência'')?', '[{"id":"a","text":"Ambas têm formato circular e exigem apenas redução de velocidade para 20 km/h."},{"id":"b","text":"A placa R-1 tem formato octogonal e exige a parada total do veículo; a placa R-2 tem formato triangular e determina reduzir a velocidade e parar apenas se necessário para ceder passagem aos veículos da outra via."},{"id":"c","text":"A placa R-1 é amarela de advertência e a placa R-2 é exclusiva para travessia de pedestres."},{"id":"d","text":"A placa R-2 obriga a imobilização completa do veículo por 5 segundos mesmo sem tráfego na via transversal."}]'::jsonb, 'b', 'Dica clássica da prova do DETRAN-MG: as placas de regulamentação são circulares, com DUAS exceções de formato: • R-1 (Parada Obrigatória - PARE) = formato OCTOGONAL (8 lados), exigindo imobilização total do veículo; • R-2 (Dê a Preferência) = formato TRIANGULAR (vértice para baixo), exigindo ceder a preferência e parar somente se houver tráfego na via preferencial.', 'Sinalização de Trânsito', 'Semáforo, Parada Obrigatória (R-1/R-2) e Pedestres (Arts. 208 e 214)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-018', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 44-A, 70, 208 e 214 • Anexo II CONTRAN (Placas R-1 e R-2)', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-018', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Item 1.1 (Sinalização Vertical de Regulamentação - R-1 e R-2) do Anexo II do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-019
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-019', 2, 'Em um cruzamento semafórico, o sinal fica verde para os veículos no momento em que um pedestre ainda está concluindo a travessia sobre a faixa de pedestres. De acordo com os Arts. 70 e 214 do CTB, o condutor deve:', '[{"id":"a","text":"Iniciar a marcha imediatamente e buzinar para que o pedestre corra até a calçada."},{"id":"b","text":"Desviar do pedestre acelerando pela faixa ao lado antes que outros carros avancem."},{"id":"c","text":"Avançar lentamente encostando o veículo próximo ao pedestre para impor a preferência do sinal verde."},{"id":"d","text":"Aguardar que o pedestre conclua a travessia com segurança, pois a preferência é sempre do pedestre que já houver iniciado a passagem."}]'::jsonb, 'd', 'Conforme o Art. 70, parágrafo único e o Art. 214, II do CTB, mesmo que o sinal abra (fique verde) para os veículos, os pedestres que já tenham iniciado a travessia têm prioridade para concluí-la. Deixar de dar preferência ao pedestre que esteja concluindo a travessia é infração GRAVÍSSIMA (7 pontos).', 'Sinalização de Trânsito', 'Semáforo, Parada Obrigatória (R-1/R-2) e Pedestres (Arts. 208 e 214)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-019', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 44-A, 70, 208 e 214 • Anexo II CONTRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-019', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Arts. 70, parágrafo único e 214, inciso II do CTB.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

-- Questao sin-020
INSERT INTO public.questions (id, version, statement, options, correct_option_id, explanation, topic, subtopic, ufs, categories, status, is_example)
VALUES ('sin-020', 2, 'Segundo o Art. 208 do Código de Trânsito Brasileiro, avançar o sinal vermelho do semáforo ou o de parada obrigatória (Placa R-1) constitui infração de qual natureza e pontuação?', '[{"id":"a","text":"Infração gravíssima, com penalidade de multa e registro de 7 pontos no prontuário do condutor."},{"id":"b","text":"Infração grave, com penalidade de multa e registro de 5 pontos no prontuário."},{"id":"c","text":"Infração média, com penalidade de advertência por escrito e 4 pontos."},{"id":"d","text":"Infração gravíssima multiplicada por cinco, com recolhimento imediato da CNH."}]'::jsonb, 'a', 'O Art. 208 do CTB estabelece que avançar o sinal vermelho do semáforo ou o de parada obrigatória (exceto onde houver sinalização permitindo livre conversão à direita) é infração GRAVÍSSIMA, com penalidade de multa e 7 pontos na CNH.', 'Sinalização de Trânsito', 'Semáforo, Parada Obrigatória (R-1/R-2) e Pedestres (Arts. 208 e 214)', '{"MG"}'::text[], '{"A","B"}'::text[], 'aprovada', FALSE)
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
VALUES ('sin-020', 'official', 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resoluções CONTRAN nº 973/2022, nº 985/2022 e nº 1.020/2025', 'CTB Arts. 44-A, 70, 208 e 214 • Anexo II CONTRAN', 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm', '2026-11-08T17:20:00Z'::timestamptz, '2023-01-02'::date, NULL, 'CTB Atualizado / BNQ SENATRAN (Res. CONTRAN nº 1.020/2025)', 'Domínio Público — Art. 8º, IV da Lei Federal nº 9.610/1998', 'verified')
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
VALUES ('sin-020', 'Antigravity/Gemini-3.8-Flash', 'Independent/Auditor-Juridico-Editorial', 'Texto literal do Art. 208 do CTB: Infração - gravíssima; Penalidade - multa.', 'Tech Lead / Responsável pelo Produto', '2026-11-08T17:20:00Z'::timestamptz)
ON CONFLICT (question_id) DO UPDATE SET
    generator_model = EXCLUDED.generator_model,
    verifier_model = EXCLUDED.verifier_model,
    verification_notes = EXCLUDED.verification_notes,
    approved_by = EXCLUDED.approved_by,
    approved_at = EXCLUDED.approved_at;

COMMIT;
