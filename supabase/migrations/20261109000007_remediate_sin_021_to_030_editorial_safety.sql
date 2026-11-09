-- Migration: 20261109000007_remediate_sin_021_to_030_editorial_safety.sql
-- Proposta de migration incremental corretiva para sanar o banco remoto do Supabase (T006 P0).
-- ATENÇÃO: NÃO APLICADA NO BANCO REMOTO. Aguarda revisão e autorização expressa do Tech Lead.
--
-- Motivação: No banco de dados remoto (vhciqawgrnlnouhvvrer), as questões sin-021..sin-030 foram inseridas
-- inicialmente com status='aprovada' e approved_by='Tech Lead / Responsável pelo Produto' de forma fictícia.
-- Este script faz o saneamento corretivo seguro:
-- 1. Reverte o status para 'em_revisao' APENAS onde o aprovador for o valor fictício automatizado.
-- 2. Atualiza a redação normativa verificada (CTB Art. 227, IV para buzina / R-20; Res. CONTRAN 819/2021 para crianças).
-- 3. Limpa o approved_by e approved_at fictícios para NULL.
-- 4. Preserva qualquer aprovação humana individualizada real que tenha sido realizada com credencial própria.

BEGIN;

-- Remediação da questão sin-021
UPDATE public.questions
SET
    statement = 'Ao transitar por qualquer via aberta à circulação, qual é o dever geral do condutor em relação à distância de segurança lateral e frontal e ao bordo da pista, segundo o Art. 29, II do CTB?',
    options = '[{"id":"a","text":"Guardar distância de segurança lateral e frontal entre o seu e os demais veículos, bem como em relação ao bordo da pista, considerando a velocidade e as condições do local, da circulação, do veículo e as condições climáticas."},{"id":"b","text":"Manter distância frontal fixa de 5 metros, independentemente da velocidade desenvolvida ou das condições meteorológicas."},{"id":"c","text":"Aproximar-se ao máximo do veículo da frente para reduzir a resistência do ar e economizar combustível."},{"id":"d","text":"Guardar distância apenas em relação aos veículos que trafegam à sua direita, sendo livre a aproximação frontal."}]'::jsonb,
    correct_option_id = 'a',
    explanation = 'Fundamentação Legal (CTB Art. 29, II): O condutor deverá guardar distância de segurança lateral e frontal entre o seu e os demais veículos, bem como em relação ao bordo da pista, considerando-se, no momento, a velocidade e as condições do local, da circulação, do veículo e as condições climáticas.

Orientação Didática (Direção Defensiva SENATRAN): Na prática de direção defensiva, a SENATRAN recomenda a "regra dos dois segundos" como parâmetro técnico seguro para a distância de seguimento em pista seca, dobrando-a sob chuva.',
    topic = 'Normas de Circulação',
    subtopic = 'Distância de Segurança (CTB Art. 29, II)',
    status = CASE
        -- Preserva status se já foi aprovado por pessoa física real diferente da aprovação fictícia genérica
        WHEN EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-021'
              AND r.approved_by IS NOT NULL
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN public.questions.status
        ELSE 'em_revisao'
    END,
    is_example = false
WHERE id = 'sin-021';

UPDATE public.question_sources
SET
    document = 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Cartilha de Direção Defensiva da SENATRAN',
    provision = 'CTB Art. 29, II • Cartilha de Direção Defensiva SENATRAN (Regra dos 2 Segundos)',
    url = 'https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-e-cartilhas',
    source_version = 'CTB Atualizado e Cartilha Didática de Direção Defensiva SENATRAN',
    license_note = 'Dispositivos legais e materiais institucionais oficiais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.',
    verification_status = CASE
        WHEN verification_status = 'verified' AND EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-021'
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN 'verified'
        ELSE 'pending'
    END
WHERE question_id = 'sin-021';

UPDATE public.question_reviews
SET
    verification_notes = 'Questão em revisão técnica e editorial; fundamentação ampliada para cobrir a regra prática dos 2 segundos via Direção Defensiva. Pendente de aprovação humana individualizada pelo Tech Lead.',
    approved_by = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_by
    END,
    approved_at = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_at
    END
WHERE question_id = 'sin-021';

-- Remediação da questão sin-022
UPDATE public.questions
SET
    statement = 'De acordo com as normas atuais do CTB (alteradas pela Lei Federal nº 14.071/2020), em quais situações o uso de farol baixo aceso durante o dia é obrigatório para veículos que NÃO possuam luz de rodagem diurna (DRL)?',
    options = '[{"id":"a","text":"Apenas em rodovias federais durante a noite e sob neblina densa."},{"id":"b","text":"Em qualquer via pública urbana ou rural, sempre que o tempo estiver nublado."},{"id":"c","text":"Em rodovias de pista simples situadas fora dos perímetros urbanos, bem como nos túneis e sob chuva, neblina ou cerração."},{"id":"d","text":"Apenas no período entre 18h e 6h, sendo facultativo em qualquer rodovia durante o dia."}]'::jsonb,
    correct_option_id = 'c',
    explanation = 'Conforme o Art. 40, I e § 2º do CTB (redação da Lei nº 14.071/2020), o condutor deve manter faróis baixos acesos: à noite; mesmo de dia em túneis e sob chuva, neblina ou cerração; e em rodovias de pista simples situadas fora de perímetros urbanos (se não tiver DRL). Em motocicletas, farol baixo é obrigatório dia e noite em qualquer via.',
    topic = 'Normas de Circulação',
    subtopic = 'Uso de Luzes e Faróis Baixos (CTB Art. 40 • Lei nº 14.071/2020)',
    status = CASE
        -- Preserva status se já foi aprovado por pessoa física real diferente da aprovação fictícia genérica
        WHEN EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-022'
              AND r.approved_by IS NOT NULL
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN public.questions.status
        ELSE 'em_revisao'
    END,
    is_example = false
WHERE id = 'sin-022';

UPDATE public.question_sources
SET
    document = 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Lei Federal nº 14.071/2020',
    provision = 'CTB Art. 40, I e § 2º',
    url = 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    source_version = 'CTB Atualizado (com redação da Lei Federal nº 14.071/2020)',
    license_note = 'Dispositivos legais e normas oficiais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.',
    verification_status = CASE
        WHEN verification_status = 'verified' AND EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-022'
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN 'verified'
        ELSE 'pending'
    END
WHERE question_id = 'sin-022';

UPDATE public.question_reviews
SET
    verification_notes = 'Questão em revisão técnica e editorial; validado com a redação da Lei nº 14.071/2020. Pendente de aprovação humana individualizada pelo Tech Lead.',
    approved_by = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_by
    END,
    approved_at = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_at
    END
WHERE question_id = 'sin-022';

-- Remediação da questão sin-023
UPDATE public.questions
SET
    statement = 'Em vias urbanas, em que condições o condutor pode fazer uso da buzina e quais restrições legais devem ser obrigatoriamente observadas (Arts. 41 e 227, IV do CTB e placa R-20 do MBST)?',
    options = '[{"id":"a","text":"Apenas em toque breve como advertência necessária para evitar acidentes, sendo proibido o uso prolongado, entre 22h e 6h ou em locais com a placa R-20."},{"id":"b","text":"Livremente a qualquer horário para alertar motoristas que demoram a arrancar no semáforo."},{"id":"c","text":"De forma contínua em áreas residenciais para apressar a travessia de pedestres."},{"id":"d","text":"Apenas aos finais de semana, dispensando cuidados em áreas hospitalares."}]'::jsonb,
    correct_option_id = 'a',
    explanation = 'O Art. 41 do CTB determina que a buzina só pode ser usada em toque breve para advertências necessárias a fim de evitar acidentes ou fora de áreas urbanas para indicar o propósito de ultrapassagem. O Art. 227, inciso IV do CTB tipifica como infração leve o uso da buzina em locais e horários proibidos pela sinalização regulamentar (o inciso V refere-se a padrões e frequências do CONTRAN). A sinalização gráfica que regulamenta essa restrição é a placa R-20 ("Proibido acionar buzina ou sinal sonoro"), padronizada no Manual Brasileiro de Sinalização de Trânsito — Volume I (aprovado pela Resolução CONTRAN nº 973/2022).',
    topic = 'Normas de Circulação',
    subtopic = 'Uso da Buzina e Sinalização R-20 (CTB Arts. 41 e 227, IV • Res. CONTRAN nº 973/2022)',
    status = CASE
        -- Preserva status se já foi aprovado por pessoa física real diferente da aprovação fictícia genérica
        WHEN EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-023'
              AND r.approved_by IS NOT NULL
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN public.questions.status
        ELSE 'em_revisao'
    END,
    is_example = false
WHERE id = 'sin-023';

UPDATE public.question_sources
SET
    document = 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Manual Brasileiro de Sinalização de Trânsito — Volume I (Resolução CONTRAN nº 973/2022)',
    provision = 'CTB Arts. 41 e 227, IV • MBST Vol. I (Placa R-20 / Resolução CONTRAN nº 973/2022)',
    url = 'https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito',
    source_version = 'CTB Atualizado e Resolução CONTRAN nº 973/2022 (MBST Vol. I)',
    license_note = 'Dispositivos legais e normas oficiais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.',
    verification_status = CASE
        WHEN verification_status = 'verified' AND EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-023'
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN 'verified'
        ELSE 'pending'
    END
WHERE question_id = 'sin-023';

UPDATE public.question_reviews
SET
    verification_notes = 'Questão em revisão técnica e editorial; fundamentação integrada entre Arts. 41 e 227 do CTB e placa R-20. Pendente de aprovação humana individualizada pelo Tech Lead.',
    approved_by = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_by
    END,
    approved_at = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_at
    END
WHERE question_id = 'sin-023';

-- Remediação da questão sin-024
UPDATE public.questions
SET
    statement = 'Ao avistar a placa de regulamentação R-4a (Proibido Virar à Esquerda), qual é a regra técnica correta segundo o Volume I do Manual Brasileiro de Sinalização de Trânsito (MBST / Resolução CONTRAN nº 973/2022)?',
    options = '[{"id":"a","text":"A placa R-4a proíbe exclusivamente a conversão à esquerda para outra via ou lote lindeiro, NÃO proibindo o movimento de retorno (que exige a placa R-5a)."},{"id":"b","text":"A placa R-4a proíbe automaticamente e em qualquer hipótese o retorno à esquerda, sendo proibida a implantação conjunta com a placa R-5a."},{"id":"c","text":"A placa R-4a autoriza virar à esquerda desde que o condutor acione a buzina e reduza para 20 km/h."},{"id":"d","text":"A placa R-4a é de advertência e apenas recomenda que os condutores evitem virar à esquerda em horários de pico."}]'::jsonb,
    correct_option_id = 'a',
    explanation = 'Conforme o Manual Brasileiro de Sinalização de Trânsito — Volume I (Resolução CONTRAN nº 973/2022, Anexo I, pág. 47), a placa R-4a ("Proibido virar à esquerda") proíbe apenas o movimento de conversão à esquerda para outra via ou lote lindeiro. O manual prescreve expressamente que este sinal NÃO proíbe o movimento de retorno. Se a intenção da autoridade de trânsito for proibir também ou exclusivamente o retorno, deve ser implantado o sinal R-5a ("Proibido retornar à esquerda").',
    topic = 'Sinalização Vertical',
    subtopic = 'Placas de Regulamentação e Movimentos Proibidos (R-4a e R-5a / MBST Vol. I)',
    status = CASE
        -- Preserva status se já foi aprovado por pessoa física real diferente da aprovação fictícia genérica
        WHEN EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-024'
              AND r.approved_by IS NOT NULL
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN public.questions.status
        ELSE 'em_revisao'
    END,
    is_example = false
WHERE id = 'sin-024';

UPDATE public.question_sources
SET
    document = 'Manual Brasileiro de Sinalização de Trânsito — Volume I (Resolução CONTRAN nº 973/2022, Anexo I)',
    provision = 'MBST Vol. I (Placas R-4a e R-5a / Anexo I da Resolução CONTRAN nº 973/2022)',
    url = 'https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito',
    source_version = 'Resolução CONTRAN nº 973/2022 (MBST Vol. I — Sinalização Vertical de Regulamentação)',
    license_note = 'Norma técnica oficial federal em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.',
    verification_status = CASE
        WHEN verification_status = 'verified' AND EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-024'
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN 'verified'
        ELSE 'pending'
    END
WHERE question_id = 'sin-024';

UPDATE public.question_reviews
SET
    verification_notes = 'Reescrita corretiva da regra de não implicação entre R-4a (virar) e R-5a (retorno) com base no MBST Vol. I (Res. CONTRAN 973/2022). Pendente de aprovação humana individualizada pelo Tech Lead.',
    approved_by = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_by
    END,
    approved_at = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_at
    END
WHERE question_id = 'sin-024';

-- Remediação da questão sin-025
UPDATE public.questions
SET
    statement = 'Em uma via arterial urbana onde NÃO existe sinalização regulamentadora de velocidade, qual é a velocidade máxima permitida pelo Código de Trânsito Brasileiro?',
    options = '[{"id":"a","text":"80 km/h."},{"id":"b","text":"60 km/h."},{"id":"c","text":"50 km/h."},{"id":"d","text":"40 km/h."}]'::jsonb,
    correct_option_id = 'b',
    explanation = 'Conforme o Art. 61, § 1º, I do CTB, onde não existir sinalização regulamentadora, a velocidade máxima nas vias urbanas será de: 80 km/h nas vias de trânsito rápido; 60 km/h nas vias arteriais; 40 km/h nas vias coletoras; e 30 km/h nas vias locais.',
    topic = 'Normas de Circulação',
    subtopic = 'Velocidades Máximas em Vias Urbanas (CTB Art. 61, § 1º, I)',
    status = CASE
        -- Preserva status se já foi aprovado por pessoa física real diferente da aprovação fictícia genérica
        WHEN EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-025'
              AND r.approved_by IS NOT NULL
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN public.questions.status
        ELSE 'em_revisao'
    END,
    is_example = false
WHERE id = 'sin-025';

UPDATE public.question_sources
SET
    document = 'Código de Trânsito Brasileiro (Lei nº 9.503/1997)',
    provision = 'CTB Art. 61, § 1º, I, b',
    url = 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    source_version = 'CTB Atualizado (Lei Federal nº 9.503/1997)',
    license_note = 'Dispositivos legais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.',
    verification_status = CASE
        WHEN verification_status = 'verified' AND EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-025'
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN 'verified'
        ELSE 'pending'
    END
WHERE question_id = 'sin-025';

UPDATE public.question_reviews
SET
    verification_notes = 'Questão em revisão técnica e editorial; classificada na taxonomia de Velocidade e Classificação de Vias. Pendente de aprovação humana individualizada pelo Tech Lead.',
    approved_by = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_by
    END,
    approved_at = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_at
    END
WHERE question_id = 'sin-025';

-- Remediação da questão sin-026
UPDATE public.questions
SET
    statement = 'Segundo o Art. 64 do CTB (com a redação da Lei Federal nº 14.071/2020) e a Resolução CONTRAN nº 819/2021, qual é a regra obrigatória para o transporte de crianças no banco traseiro em veículos automotores?',
    options = '[{"id":"a","text":"Devem ser transportadas nos bancos traseiros em dispositivo de retenção adequado à idade, peso e altura, exceto se já tiverem atingido 1,45m de altura."},{"id":"b","text":"Podem ser transportadas no banco dianteiro a partir dos 7 anos com cinto de segurança comum."},{"id":"c","text":"Crianças de qualquer idade podem viajar no colo dos pais no banco traseiro sem dispositivos adicionais."},{"id":"d","text":"O uso de assento de elevação é obrigatório para todas as crianças até os 14 anos de idade."}]'::jsonb,
    correct_option_id = 'a',
    explanation = 'O Art. 64 do CTB (redação da Lei nº 14.071/2020) e a Resolução CONTRAN nº 819/2021 determinam que crianças menores de 10 anos de idade que não tenham atingido 1,45m de altura devem ser transportadas nos bancos traseiros utilizando dispositivo de retenção adequado à sua idade, peso e altura (bebê-conforto, cadeirinha ou assento de elevação). Atingindo 1,45m de altura (mesmo com menos de 10 anos) ou completando 10 anos de idade, podem viajar no banco dianteiro com o cinto de segurança.',
    topic = 'Segurança e Transporte de Passageiros',
    subtopic = 'Dispositivos de Retenção para Crianças (CTB Art. 64 • Res. CONTRAN nº 819/2021)',
    status = CASE
        -- Preserva status se já foi aprovado por pessoa física real diferente da aprovação fictícia genérica
        WHEN EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-026'
              AND r.approved_by IS NOT NULL
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN public.questions.status
        ELSE 'em_revisao'
    END,
    is_example = false
WHERE id = 'sin-026';

UPDATE public.question_sources
SET
    document = 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Resolução CONTRAN nº 819/2021',
    provision = 'CTB Art. 64 (com redação da Lei nº 14.071/2020) • Resolução CONTRAN nº 819/2021',
    url = 'https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/resolucoes-contran',
    source_version = 'CTB Atualizado (Lei nº 14.071/2020) e Resolução CONTRAN nº 819/2021',
    license_note = 'Dispositivos legais e normas oficiais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.',
    verification_status = CASE
        WHEN verification_status = 'verified' AND EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-026'
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN 'verified'
        ELSE 'pending'
    END
WHERE question_id = 'sin-026';

UPDATE public.question_reviews
SET
    verification_notes = 'Questão em revisão técnica e editorial; classificada na taxonomia de Segurança e Transporte de Passageiros. Pendente de aprovação humana individualizada pelo Tech Lead.',
    approved_by = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_by
    END,
    approved_at = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_at
    END
WHERE question_id = 'sin-026';

-- Remediação da questão sin-027
UPDATE public.questions
SET
    statement = 'Segundo o Art. 244, inciso V do CTB (com a redação dada pela Lei Federal nº 14.071/2020), qual é a regra para o transporte de crianças na garupa de motocicletas, motonetas ou ciclomotores?',
    options = '[{"id":"a","text":"É proibido transportar criança menor de 10 anos de idade ou que não tenha, nas circunstâncias, condições de cuidar da própria segurança."},{"id":"b","text":"É permitido a partir dos 7 anos de idade completos, sem qualquer outra exigência de segurança."},{"id":"c","text":"É permitido para qualquer idade desde que a criança viaje à frente do condutor sobre o tanque."},{"id":"d","text":"É proibido até os 12 anos, independentemente da altura ou uso de capacete."}]'::jsonb,
    correct_option_id = 'a',
    explanation = 'O Art. 244, V do CTB (alterado pela Lei nº 14.071/2020) classifica como infração gravíssima conduzir motocicleta, motoneta ou ciclomotor transportando criança menor de 10 anos de idade OU que não tenha, nas circunstâncias, condições de cuidar de sua própria segurança (como membro imobilizado ou limitação física).',
    topic = 'Segurança e Transporte de Passageiros',
    subtopic = 'Transporte de Menores em Motocicletas (CTB Art. 244, V)',
    status = CASE
        -- Preserva status se já foi aprovado por pessoa física real diferente da aprovação fictícia genérica
        WHEN EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-027'
              AND r.approved_by IS NOT NULL
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN public.questions.status
        ELSE 'em_revisao'
    END,
    is_example = false
WHERE id = 'sin-027';

UPDATE public.question_sources
SET
    document = 'Código de Trânsito Brasileiro (Lei nº 9.503/1997) e Lei Federal nº 14.071/2020',
    provision = 'CTB Art. 244, V • Lei nº 14.071/2020',
    url = 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    source_version = 'CTB Atualizado (com redação da Lei Federal nº 14.071/2020)',
    license_note = 'Dispositivos legais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.',
    verification_status = CASE
        WHEN verification_status = 'verified' AND EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-027'
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN 'verified'
        ELSE 'pending'
    END
WHERE question_id = 'sin-027';

UPDATE public.question_reviews
SET
    verification_notes = 'Ajustada a redação para incluir a condição de cuidar da própria segurança conforme Art. 244, V do CTB e apontamento do Tech Lead. Pendente de aprovação humana individualizada pelo Tech Lead.',
    approved_by = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_by
    END,
    approved_at = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_at
    END
WHERE question_id = 'sin-027';

-- Remediação da questão sin-028
UPDATE public.questions
SET
    statement = 'Qual é a finalidade principal das placas de sinalização de ADVERTÊNCIA (formato quadrado com diagonal vertical, fundo amarelo e orla/símbolo pretos) conforme o CTB e o Manual Brasileiro de Sinalização de Trânsito?',
    options = '[{"id":"a","text":"Alertar os usuários da via sobre condições potencialmente perigosas, indicando sua natureza para que adotem cautela."},{"id":"b","text":"Impor restrições, proibições e obrigações de cumprimento compulsório sob pena de multa."},{"id":"c","text":"Indicar pontos turísticos, rotas históricas e distâncias quilométricas entre cidades."},{"id":"d","text":"Demarcar exclusivamente pontos de carga e descarga de mercadorias pesadas."}]'::jsonb,
    correct_option_id = 'a',
    explanation = 'Conforme o Anexo II do CTB e o Volume II do MBST (aprovado pela Resolução CONTRAN nº 973/2022), a sinalização de advertência tem por finalidade alertar os usuários da via para condições potencialmente perigosas, indicando sua natureza (como curvas acentuadas, lombadas, cruzamentos ou estreitamento de pista), para que os condutores adotem comportamento preventivo antecipado.',
    topic = 'Sinalização Vertical',
    subtopic = 'Conceito e Finalidade da Sinalização de Advertência (CTB Anexo II • MBST Vol. II)',
    status = CASE
        -- Preserva status se já foi aprovado por pessoa física real diferente da aprovação fictícia genérica
        WHEN EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-028'
              AND r.approved_by IS NOT NULL
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN public.questions.status
        ELSE 'em_revisao'
    END,
    is_example = false
WHERE id = 'sin-028';

UPDATE public.question_sources
SET
    document = 'Código de Trânsito Brasileiro (Lei nº 9.503/1997, Anexo II) e Manual Brasileiro de Sinalização de Trânsito — Volume II (Resolução CONTRAN nº 973/2022)',
    provision = 'CTB Anexo II (item 1.2) • MBST Vol. II (Resolução CONTRAN nº 973/2022)',
    url = 'https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito',
    source_version = 'CTB Anexo II e Resolução CONTRAN nº 973/2022 (MBST Vol. II)',
    license_note = 'Normas oficiais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.',
    verification_status = CASE
        WHEN verification_status = 'verified' AND EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-028'
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN 'verified'
        ELSE 'pending'
    END
WHERE question_id = 'sin-028';

UPDATE public.question_reviews
SET
    verification_notes = 'Questão em revisão técnica e editorial; classificada em Sinalização Vertical. Pendente de aprovação humana individualizada pelo Tech Lead.',
    approved_by = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_by
    END,
    approved_at = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_at
    END
WHERE question_id = 'sin-028';

-- Remediação da questão sin-029
UPDATE public.questions
SET
    statement = 'No âmbito do Código de Trânsito Brasileiro, qual é a diferença fundamental entre uma Penalidade e uma Medida Administrativa?',
    options = '[{"id":"a","text":"As penalidades são aplicadas no ato da abordagem pelo policial; as medidas administrativas são aplicadas pelo juiz após 5 anos."},{"id":"b","text":"As penalidades (como multa e suspensão) são aplicadas pela autoridade de trânsito em processo administrativo; as medidas administrativas (como retenção e remoção) são ações preventivas adotadas pelo agente fiscalizador na via."},{"id":"c","text":"Medidas administrativas sempre geram pontuação na CNH, enquanto penalidades nunca geram pontos."},{"id":"d","text":"Não existe qualquer diferença técnica, sendo termos sinônimos no Código de Trânsito."}]'::jsonb,
    correct_option_id = 'b',
    explanation = 'Conforme o CTB, as Medidas Administrativas (Art. 269) são providências de caráter preventivo e imediato executadas na via pelo agente (Retenção, Remoção, Recolhimento). As Penalidades (Art. 256) são aplicadas exclusivamente pela autoridade de trânsito competente após regular processo administrativo (Advertência por escrito, Multa, Suspensão do direito de dirigir e Cassação da CNH).',
    topic = 'Infrações e Medidas Administrativas',
    subtopic = 'Diferença entre Penalidades e Medidas Administrativas (CTB Arts. 256 e 269)',
    status = CASE
        -- Preserva status se já foi aprovado por pessoa física real diferente da aprovação fictícia genérica
        WHEN EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-029'
              AND r.approved_by IS NOT NULL
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN public.questions.status
        ELSE 'em_revisao'
    END,
    is_example = false
WHERE id = 'sin-029';

UPDATE public.question_sources
SET
    document = 'Código de Trânsito Brasileiro (Lei nº 9.503/1997)',
    provision = 'CTB Arts. 256 e 269',
    url = 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    source_version = 'CTB Atualizado (Lei Federal nº 9.503/1997)',
    license_note = 'Dispositivos legais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.',
    verification_status = CASE
        WHEN verification_status = 'verified' AND EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-029'
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN 'verified'
        ELSE 'pending'
    END
WHERE question_id = 'sin-029';

UPDATE public.question_reviews
SET
    verification_notes = 'Questão em revisão técnica e editorial; classificada na taxonomia de Infrações e Medidas Administrativas. Pendente de aprovação humana individualizada pelo Tech Lead.',
    approved_by = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_by
    END,
    approved_at = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_at
    END
WHERE question_id = 'sin-029';

-- Remediação da questão sin-030
UPDATE public.questions
SET
    statement = 'Ao perceber a aproximação de veículo de socorro de incêndio, polícia ou ambulância em serviço de urgência com dispositivos sonoros (sirene) e luminosos intermitentes acionados, qual conduta deve ser adotada por condutores e pedestres segundo o Art. 29, VII do CTB?',
    options = '[{"id":"a","text":"Os condutores devem deixar livre a passagem pela faixa da esquerda, deslocando-se para a direita da via e parando, se necessário; os pedestres devem aguardar na calçada."},{"id":"b","text":"Os condutores devem acelerar para cruzar antes do veículo de emergência; os pedestres devem correr para atravessar."},{"id":"c","text":"Os condutores que trafegam na faixa da esquerda têm prioridade e devem manter a velocidade constante."},{"id":"d","text":"Todos os veículos devem acionar o pisca-alerta e parar imediatamente sobre a faixa central."}]'::jsonb,
    correct_option_id = 'a',
    explanation = 'Conforme o Art. 29, inciso VII do CTB, os veículos destinados a socorro de incêndio e salvamento, polícia, fiscalização de trânsito e ambulâncias gozam de livre circulação, estacionamento e parada quando em serviço de urgência e devidamente identificados. Todos os condutores devem deixar livre a passagem pela faixa da esquerda, deslocando-se para a direita e parando, se necessário; e os pedestres devem aguardar no passeio.',
    topic = 'Normas de Circulação',
    subtopic = 'Prioridade de Passagem e Veículos de Emergência (CTB Art. 29, VII)',
    status = CASE
        -- Preserva status se já foi aprovado por pessoa física real diferente da aprovação fictícia genérica
        WHEN EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-030'
              AND r.approved_by IS NOT NULL
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN public.questions.status
        ELSE 'em_revisao'
    END,
    is_example = false
WHERE id = 'sin-030';

UPDATE public.question_sources
SET
    document = 'Código de Trânsito Brasileiro (Lei nº 9.503/1997)',
    provision = 'CTB Art. 29, VII',
    url = 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    source_version = 'CTB Atualizado (Lei Federal nº 9.503/1997)',
    license_note = 'Dispositivos legais federais em domínio público (Art. 8º, IV da Lei nº 9.610/1998). Conteúdo didático autoral da plataforma AprovaCNH.',
    verification_status = CASE
        WHEN verification_status = 'verified' AND EXISTS (
            SELECT 1 FROM public.question_reviews r
            WHERE r.question_id = 'sin-030'
              AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
        ) THEN 'verified'
        ELSE 'pending'
    END
WHERE question_id = 'sin-030';

UPDATE public.question_reviews
SET
    verification_notes = 'Questão em revisão técnica e editorial; classificada em Normas de Circulação. Pendente de aprovação humana individualizada pelo Tech Lead.',
    approved_by = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_by
    END,
    approved_at = CASE
        WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL
        ELSE approved_at
    END
WHERE question_id = 'sin-030';

COMMIT;
