-- Migration: 20261108000000_create_initial_schema.sql
-- Fase 3 (T003): Schema Inicial de Persistência e Autenticação do AprovaCNH

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis de Usuário (vinculada a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    uf TEXT CHECK (uf IS NULL OR (length(uf) = 2 AND uf <> 'BR')),
    target_category TEXT CHECK (target_category IS NULL OR target_category IN ('A', 'B', 'AB', 'C', 'D', 'E')),
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'reviewer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger para criar perfil automaticamente ao registrar novo usuário no Supabase Auth
-- Utiliza SECURITY DEFINER SET search_path = public para operar de forma segura com RLS ativo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        'student'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Tabela de Questões
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
    statement TEXT NOT NULL CHECK (length(statement) >= 5),
    options JSONB NOT NULL,
    correct_option_id TEXT NOT NULL CHECK (correct_option_id IN ('a', 'b', 'c', 'd')),
    explanation TEXT NOT NULL CHECK (length(explanation) > 0),
    topic TEXT NOT NULL CHECK (length(topic) > 0),
    subtopic TEXT,
    ufs TEXT[] NOT NULL DEFAULT '{}'::text[],
    categories TEXT[] NOT NULL DEFAULT '{}'::text[],
    status TEXT NOT NULL CHECK (status IN ('rascunho', 'em_revisao', 'aprovada', 'suspensa', 'obsoleta')),
    is_example BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Invariante D014: Proibido 'BR' como código de UF
    CONSTRAINT check_no_br_in_ufs CHECK (NOT ('BR' = ANY(ufs))),

    -- Invariante de integridade das opções: deve ser array com exatamente 4 itens
    CONSTRAINT check_options_length CHECK (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) = 4)
);

-- 4. Tabela de Fontes Regulatórias (D003)
CREATE TABLE IF NOT EXISTS public.question_sources (
    question_id TEXT PRIMARY KEY REFERENCES public.questions(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('official', 'licensed', 'demo')),
    document TEXT,
    provision TEXT,
    url TEXT,
    checked_at TIMESTAMPTZ,
    effective_from DATE,
    effective_until DATE,
    source_version TEXT,
    license_note TEXT,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'pending', 'not_applicable'))
);

-- 5. Tabela de Auditoria e Homologação Editorial (D003, D011)
CREATE TABLE IF NOT EXISTS public.question_reviews (
    question_id TEXT PRIMARY KEY REFERENCES public.questions(id) ON DELETE CASCADE,
    generator_model TEXT,
    verifier_model TEXT,
    verification_notes TEXT,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,

    -- Invariante D003: modelo verificador deve ser distinto do gerador
    CONSTRAINT check_different_models CHECK (
        generator_model IS NULL OR verifier_model IS NULL OR generator_model <> verifier_model
    )
);

-- 6. Índices para Otimização de Consultas
CREATE INDEX IF NOT EXISTS idx_questions_status_topic ON public.questions (status, topic);
CREATE INDEX IF NOT EXISTS idx_questions_ufs ON public.questions USING gin (ufs);
CREATE INDEX IF NOT EXISTS idx_questions_categories ON public.questions USING gin (categories);

-- 7. Habilitação de Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_reviews ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de RLS
-- Profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Questions (Alunos leem apenas aprovadas ou demonstrativas; anon também pode ler lição demonstrativa ou aprovada pública)
DROP POLICY IF EXISTS "questions_select_student" ON public.questions;
CREATE POLICY "questions_select_student"
    ON public.questions FOR SELECT
    TO authenticated, anon
    USING (
        status = 'aprovada'
        OR (is_example = true AND status = 'rascunho')
    );

DROP POLICY IF EXISTS "questions_admin_all" ON public.questions;
CREATE POLICY "questions_admin_all"
    ON public.questions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Question Sources
DROP POLICY IF EXISTS "sources_select_student" ON public.question_sources;
CREATE POLICY "sources_select_student"
    ON public.question_sources FOR SELECT
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM public.questions
            WHERE questions.id = question_sources.question_id
            AND (questions.status = 'aprovada' OR (questions.is_example = true AND questions.status = 'rascunho'))
        )
    );

-- Question Reviews
DROP POLICY IF EXISTS "reviews_select_student" ON public.question_reviews;
CREATE POLICY "reviews_select_student"
    ON public.question_reviews FOR SELECT
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM public.questions
            WHERE questions.id = question_reviews.question_id
            AND (questions.status = 'aprovada' OR (questions.is_example = true AND questions.status = 'rascunho'))
        )
    );

-- 9. Permissões de Acesso (GRANTs para PostgREST)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.questions TO anon, authenticated;
GRANT SELECT ON TABLE public.question_sources TO anon, authenticated;
GRANT SELECT ON TABLE public.question_reviews TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
