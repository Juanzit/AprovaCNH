-- Migration: 20261108000002_add_progress_xp_streak.sql
-- Fase 4 (T004): Progresso por Lição, Extrato de XP, Histórico de Respostas e Streak Diário

-- 1. Evolução da tabela profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS xp_total INTEGER NOT NULL DEFAULT 0 CHECK (xp_total >= 0),
    ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
    ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- 2. Tabela de Progresso por Lição / Sessão
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    session_id INTEGER NOT NULL CHECK (session_id BETWEEN 1 AND 4),
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
    score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 5),
    max_score INTEGER NOT NULL DEFAULT 5 CHECK (max_score > 0),
    xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Invariante: Um registro por usuário, tema e sessão
    CONSTRAINT uq_user_topic_session UNIQUE (user_id, topic, session_id)
);

-- 3. Tabela de Histórico de Respostas por Questão (Base para Fase 5)
CREATE TABLE IF NOT EXISTS public.user_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    session_id INTEGER NOT NULL CHECK (session_id BETWEEN 1 AND 4),
    selected_option_id TEXT NOT NULL CHECK (selected_option_id IN ('a', 'b', 'c', 'd')),
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabela de Extrato de XP (Transações Auditáveis)
CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Índices de Desempenho
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress (user_id, topic);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_question ON public.user_answers (user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON public.xp_transactions (user_id, created_at DESC);

-- 6. Habilitação de Row Level Security (RLS)
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de RLS
-- lesson_progress: usuário lê e atualiza apenas o próprio progresso
DROP POLICY IF EXISTS "lesson_progress_select_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_select_own"
    ON public.lesson_progress FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_upsert_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_upsert_own"
    ON public.lesson_progress FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_answers: usuário lê e insere suas respostas
DROP POLICY IF EXISTS "user_answers_select_own" ON public.user_answers;
CREATE POLICY "user_answers_select_own"
    ON public.user_answers FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_answers_insert_own" ON public.user_answers;
CREATE POLICY "user_answers_insert_own"
    ON public.user_answers FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- xp_transactions: usuário lê seu extrato de XP
DROP POLICY IF EXISTS "xp_transactions_select_own" ON public.xp_transactions;
CREATE POLICY "xp_transactions_select_own"
    ON public.xp_transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "xp_transactions_insert_own" ON public.xp_transactions;
CREATE POLICY "xp_transactions_insert_own"
    ON public.xp_transactions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 8. Permissões de Acesso para Roles da API
GRANT SELECT, INSERT, UPDATE ON TABLE public.lesson_progress TO authenticated;
GRANT SELECT, INSERT ON TABLE public.user_answers TO authenticated;
GRANT SELECT, INSERT ON TABLE public.xp_transactions TO authenticated;
