-- Migration: 20261109000009_protect_internal_columns_and_reviews.sql
-- Objetivo: Sanar a exposição P0 de colunas internas (correct_option_id e explanation)
--           e revogar acesso direto de estudantes (anon, authenticated) à tabela question_reviews.
-- Contexto: RLS filtra linhas (tuplas), mas não colunas quando GRANT SELECT é irrestrito.
--           Esta migration estabelece Column-Level Security (CLS), revoga permissões públicas
--           sobre question_reviews, cria a View Sanitizada student_questions e introduz
--           a RPC segura verify_student_answer para conferência autoritativa no servidor.
-- Status: Proposta técnica versionada em branch isolada (NÃO APLICADA NO SUPABASE REMOTO).

BEGIN;

-- ==============================================================================
-- 1. REVOGAÇÃO DE ACESSO DIRETO A question_reviews (P0 - Governança e Auditoria)
-- ==============================================================================
-- Alunos e visitantes anônimos não possuem necessidade de negócio para inspecionar
-- anotações de auditoria editorial (verification_notes), modelos de IA (generator_model, verifier_model)
-- ou identificação de revisores/datas (approved_by, approved_at).
-- O painel editorial e tarefas administrativas preservam seu acesso via service_role ou
-- papéis administrativos dedicados.

REVOKE ALL ON public.question_reviews FROM anon, authenticated;
DROP POLICY IF EXISTS reviews_select_student ON public.question_reviews;

-- ==============================================================================
-- 2. COLUMN-LEVEL SECURITY (CLS) EM public.questions (P0 - Anti-Cheat e Gabarito)
-- ==============================================================================
-- Revoga o SELECT amplo em todas as colunas da tabela questions para anon e authenticated.
REVOKE SELECT ON public.questions FROM anon, authenticated;

-- Concede SELECT exclusivamente nas colunas pedagógicas seguras necessárias para
-- a renderização de enunciados e alternativas para o estudante.
-- correct_option_id e explanation são deliberadamente omitidos deste GRANT.
GRANT SELECT (
  id,
  version,
  statement,
  options,
  topic,
  subtopic,
  ufs,
  categories,
  status,
  is_example
) ON public.questions TO anon, authenticated;

-- ==============================================================================
-- 3. INTERFACE SANITIZADA DISCENTE (View student_questions)
-- ==============================================================================
-- Avaliação de RLS, Privilégios e security_invoker:
-- A view student_questions simplifica o consumo de questões aprovadas e desassocia
-- os clientes públicos das colunas internas.
-- A opção security_invoker = true garante que o PostgreSQL execute a view sob o
-- contexto de segurança de quem a consulta (anon/authenticated), respeitando tanto
-- a política de RLS questions_select_student (migration 000008) quanto as restrições
-- de coluna (CLS) definidas acima.
CREATE OR REPLACE VIEW public.student_questions
WITH (security_invoker = true)
AS
SELECT
  q.id,
  q.version,
  q.statement,
  q.options,
  q.topic,
  q.subtopic,
  q.ufs,
  q.categories,
  q.status,
  q.is_example
FROM public.questions q
WHERE q.status = 'aprovada' AND q.is_example = false;

GRANT SELECT ON public.student_questions TO anon, authenticated;

-- ==============================================================================
-- 4. RPC AUTORITATIVA DE CONFERÊNCIA DE RESPOSTA (verify_student_answer)
-- ==============================================================================
-- Como o gabarito e a explicação não são acessíveis antes da resposta, esta RPC
-- executa com SECURITY DEFINER (contexto do proprietário/postgres) para conferir
-- a alternativa escolhida e liberar o feedback didático APENAS APÓS a submissão.
CREATE OR REPLACE FUNCTION public.verify_student_answer(
  p_question_id text,
  p_selected_option_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correct_option_id text;
  v_explanation text;
  v_status text;
  v_is_example boolean;
BEGIN
  -- Busca a questão elegível
  SELECT correct_option_id, explanation, status, is_example
  INTO v_correct_option_id, v_explanation, v_status, v_is_example
  FROM public.questions
  WHERE id = p_question_id;

  -- Se a questão não existir ou não estiver aprovada/elegível, recusa a validação
  IF NOT FOUND OR v_status != 'aprovada' OR v_is_example = true THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Questão não encontrada ou não elegível para resolução.'
    );
  END IF;

  -- Retorna o resultado da conferência com a explicação liberada no momento oportuno
  RETURN jsonb_build_object(
    'success', true,
    'question_id', p_question_id,
    'is_correct', (v_correct_option_id = p_selected_option_id),
    'correct_option_id', v_correct_option_id,
    'explanation', v_explanation
  );
END;
$$;

-- Concede execução da RPC para usuários autenticados e anônimos (avaliação formativa)
GRANT EXECUTE ON FUNCTION public.verify_student_answer(text, text) TO anon, authenticated;

COMMIT;
