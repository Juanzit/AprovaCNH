-- Migration: 20261109000008_harden_rls_student_eligibility.sql
-- Alinhamento estrito das políticas de Row Level Security (RLS) à regra de elegibilidade discente P0 (D010 / AGENTS.md).
-- ATENÇÃO: NÃO APLICADA NO BANCO REMOTO. Proposta isolada para revisão e autorização do Tech Lead.
--
-- Motivação Técnica e Segurança de Publicação (P0):
-- A migration histórica 20261108000000_create_initial_schema.sql definiu as políticas de leitura discente com:
--   status = 'aprovada' OR (is_example = true AND status = 'rascunho')
-- nas tabelas public.questions, public.question_sources e public.question_reviews.
-- Essa permissão expunha à leitura pública direta (via API PostgREST por roles 'anon' e 'authenticated'):
-- 1. Questões com status='rascunho' caso estivessem marcadas como is_example=true.
-- 2. Questões com status='aprovada' mas marcadas como is_example=true (questões demonstrativas).
-- 3. Registros associados em question_sources e question_reviews (incluindo notas de auditoria e modelos).
--
-- Esta migration incremental revoga as políticas antigas e estabelece a regra unificada e inviolável:
--   status = 'aprovada' AND is_example = false
-- garantindo que nenhuma questão em rascunho, em revisão ou demonstrativa seja acessível diretamente via API.

BEGIN;

-- 1. Política de leitura discente para public.questions
DROP POLICY IF EXISTS "questions_select_student" ON public.questions;
CREATE POLICY "questions_select_student"
    ON public.questions FOR SELECT
    TO authenticated, anon
    USING (
        status = 'aprovada'
        AND is_example = false
    );

-- 2. Política de leitura discente para public.question_sources
-- Condicionada à existência de questão aprovada e não demonstrativa
DROP POLICY IF EXISTS "sources_select_student" ON public.question_sources;
CREATE POLICY "sources_select_student"
    ON public.question_sources FOR SELECT
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM public.questions
            WHERE questions.id = question_sources.question_id
              AND questions.status = 'aprovada'
              AND questions.is_example = false
        )
    );

-- 3. Política de leitura discente para public.question_reviews
-- Condicionada à existência de questão aprovada e não demonstrativa
DROP POLICY IF EXISTS "reviews_select_student" ON public.question_reviews;
CREATE POLICY "reviews_select_student"
    ON public.question_reviews FOR SELECT
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM public.questions
            WHERE questions.id = question_reviews.question_id
              AND questions.status = 'aprovada'
              AND questions.is_example = false
        )
    );

COMMIT;
