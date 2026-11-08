-- Migration: 20261108000005_create_simulado_schema.sql
-- Fase 6 (T006): Simulado Configurável (Resolução CONTRAN nº 1.020/2025 — Regra D007)

BEGIN;

-- 1. Tabela de Configurações Regulatórias do Exame (Parâmetros Versionados por UF e Vigência)
CREATE TABLE IF NOT EXISTS public.exam_configs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    uf VARCHAR(2) DEFAULT 'MG' CHECK (uf IS NULL OR (char_length(uf) = 2 AND uf <> 'BR')),
    total_questions INTEGER NOT NULL DEFAULT 30 CHECK (total_questions > 0),
    duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    passing_score INTEGER NOT NULL DEFAULT 20 CHECK (passing_score > 0 AND passing_score <= total_questions),
    normative_act TEXT NOT NULL,
    effective_from DATE NOT NULL,
    effective_until DATE,
    version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Sessões de Simulado do Estudante
CREATE TABLE IF NOT EXISTS public.simulado_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    config_id TEXT NOT NULL REFERENCES public.exam_configs(id),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    finished_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    total_questions INTEGER NOT NULL DEFAULT 30 CHECK (total_questions > 0),
    score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
    passing_score INTEGER NOT NULL DEFAULT 20 CHECK (passing_score > 0),
    is_approved BOOLEAN,
    status TEXT NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'completed', 'abandoned', 'timed_out')),
    xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Respostas e Ordem Sorteada do Simulado
CREATE TABLE IF NOT EXISTS public.simulado_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulado_id UUID NOT NULL REFERENCES public.simulado_sessions(id) ON DELETE CASCADE,
    question_id VARCHAR(64) NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL CHECK (question_order >= 1 AND question_order <= 30),
    selected_option_id VARCHAR(10) CHECK (selected_option_id IS NULL OR selected_option_id IN ('a', 'b', 'c', 'd')),
    is_marked_for_review BOOLEAN NOT NULL DEFAULT false,
    is_correct BOOLEAN,
    answered_at TIMESTAMPTZ,

    CONSTRAINT uq_simulado_question_order UNIQUE (simulado_id, question_order)
);

-- 4. Índices de Desempenho
CREATE INDEX IF NOT EXISTS idx_simulado_sessions_user
    ON public.simulado_sessions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_simulado_answers_simulado
    ON public.simulado_answers (simulado_id, question_order);

-- 5. Habilitação de Row Level Security (RLS)
ALTER TABLE public.exam_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulado_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulado_answers ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de RLS
-- exam_configs: leitura pública para configurações ativas
DROP POLICY IF EXISTS "exam_configs_select_active" ON public.exam_configs;
CREATE POLICY "exam_configs_select_active"
    ON public.exam_configs FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- simulado_sessions: leitura e gravação restrita ao próprio usuário autenticado
DROP POLICY IF EXISTS "simulado_sessions_select_own" ON public.simulado_sessions;
CREATE POLICY "simulado_sessions_select_own"
    ON public.simulado_sessions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "simulado_sessions_insert_own" ON public.simulado_sessions;
CREATE POLICY "simulado_sessions_insert_own"
    ON public.simulado_sessions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "simulado_sessions_update_own" ON public.simulado_sessions;
CREATE POLICY "simulado_sessions_update_own"
    ON public.simulado_sessions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- simulado_answers: leitura e gravação restrita a sessões pertencentes ao próprio usuário
DROP POLICY IF EXISTS "simulado_answers_select_own" ON public.simulado_answers;
CREATE POLICY "simulado_answers_select_own"
    ON public.simulado_answers FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.simulado_sessions s
            WHERE s.id = simulado_answers.simulado_id
              AND s.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "simulado_answers_insert_own" ON public.simulado_answers;
CREATE POLICY "simulado_answers_insert_own"
    ON public.simulado_answers FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.simulado_sessions s
            WHERE s.id = simulado_answers.simulado_id
              AND s.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "simulado_answers_update_own" ON public.simulado_answers;
CREATE POLICY "simulado_answers_update_own"
    ON public.simulado_answers FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.simulado_sessions s
            WHERE s.id = simulado_answers.simulado_id
              AND s.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.simulado_sessions s
            WHERE s.id = simulado_answers.simulado_id
              AND s.user_id = auth.uid()
        )
    );

-- 7. Permissões de Acesso para Roles da API (PostgREST)
GRANT SELECT ON TABLE public.exam_configs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.simulado_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.simulado_answers TO authenticated;

-- 8. Inserção da Configuração Oficial Padrão (Regra D007 — Resolução CONTRAN nº 1.020/2025)
INSERT INTO public.exam_configs (
    id,
    name,
    uf,
    total_questions,
    duration_minutes,
    passing_score,
    normative_act,
    effective_from,
    effective_until,
    version,
    is_active
) VALUES (
    'detran-mg-default',
    'DETRAN-MG / SENATRAN — Exame Teórico de 1ª Habilitação',
    'MG',
    30,
    60,
    20,
    'Resolução CONTRAN nº 1.020/2025 e Banco Nacional de Questões (SENATRAN)',
    '2025-01-01',
    NULL,
    1,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    uf = EXCLUDED.uf,
    total_questions = EXCLUDED.total_questions,
    duration_minutes = EXCLUDED.duration_minutes,
    passing_score = EXCLUDED.passing_score,
    normative_act = EXCLUDED.normative_act,
    effective_from = EXCLUDED.effective_from,
    effective_until = EXCLUDED.effective_until,
    version = EXCLUDED.version,
    is_active = EXCLUDED.is_active;

COMMIT;
