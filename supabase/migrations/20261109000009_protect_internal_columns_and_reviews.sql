-- Migration: 20261109000009_protect_internal_columns_and_reviews.sql
-- Objetivo: Sanar a exposição P0 de colunas internas (correct_option_id e explanation),
--           revogar acesso direto de estudantes (anon, authenticated) à tabela question_reviews,
--           e criar RPCs transacionais blindadas vinculadas a sessões persistidas (Anti-Oráculo).
-- Status: Proposta técnica versionada em branch isolada (NÃO APLICADA NO SUPABASE REMOTO).

BEGIN;

-- ==============================================================================
-- 1. REVOGAÇÃO DE ACESSO DIRETO A question_reviews (P0 - Governança e Auditoria)
-- ==============================================================================
-- Alunos e visitantes anônimos não possuem necessidade de negócio para inspecionar
-- anotações de auditoria editorial (verification_notes), modelos de IA (generator_model, verifier_model)
-- ou identificação de revisores/datas (approved_by, approved_at).
-- O painel editorial e tarefas administrativas preservam seu acesso via service_role ou
-- papéis administrativos dedicados no servidor.

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
-- 4. ADIÇÃO DE guest_token EM simulado_sessions PARA VALIDAÇÃO DE CONVIDADOS
-- ==============================================================================
ALTER TABLE public.simulado_sessions
ADD COLUMN IF NOT EXISTS guest_token TEXT;

-- ==============================================================================
-- 5. RPC TRANSACIONAL DE SUBMISSÃO DE RESPOSTA (record_simulado_answer)
-- ==============================================================================
-- Anti-Oráculo: Rejeita chamadas sem tentativa ativa no banco, exige propriedade,
-- garante a imutabilidade da 1ª resposta e JAMAIS retorna correct_option_id ou explanation.
CREATE OR REPLACE FUNCTION public.record_simulado_answer(
  p_session_id UUID,
  p_question_id VARCHAR(64),
  p_selected_option_id VARCHAR(10),
  p_guest_token TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_session public.simulado_sessions%ROWTYPE;
  v_existing_answer public.simulado_answers%ROWTYPE;
BEGIN
  -- 1. Validar existência e status da sessão
  SELECT * INTO v_session
  FROM public.simulado_sessions
  WHERE id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tentativa não encontrada (sessão inválida).';
  END IF;

  IF v_session.status != 'in_progress' THEN
    RAISE EXCEPTION 'A tentativa não está em andamento (status: %).', v_session.status;
  END IF;

  -- 2. Validar propriedade da tentativa e identidade do usuário
  IF v_session.user_id IS NOT NULL THEN
    IF auth.uid() IS NULL OR auth.uid() != v_session.user_id THEN
      RAISE EXCEPTION 'Não autorizado: esta tentativa pertence a outro usuário.';
    END IF;
  ELSE
    IF p_guest_token IS NULL OR v_session.guest_token IS DISTINCT FROM p_guest_token THEN
      RAISE EXCEPTION 'Não autorizado: token opaco de convidado inválido.';
    END IF;
  END IF;

  -- 3. Validar se a questão pertence a esta sessão e verificar duplicidade
  SELECT * INTO v_existing_answer
  FROM public.simulado_answers
  WHERE simulado_id = p_session_id AND question_id = p_question_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Questão não atribuída a esta tentativa de simulado.';
  END IF;

  -- Imutabilidade da primeira submissão: rejeita tentativas repetidas
  IF v_existing_answer.selected_option_id IS NOT NULL THEN
    RAISE EXCEPTION 'Resposta já submetida e imutável para esta questão nesta tentativa.';
  END IF;

  -- 4. Registrar a resposta de forma imutável
  UPDATE public.simulado_answers
  SET selected_option_id = p_selected_option_id,
      answered_at = timezone('utc'::text, now())
  WHERE simulado_id = p_session_id AND question_id = p_question_id;

  -- RETORNO SEGURO: Não revela gabarito nem explicação
  RETURN jsonb_build_object(
    'success', true,
    'session_id', p_session_id,
    'question_id', p_question_id,
    'recorded_at', timezone('utc'::text, now())
  );
END;
$$;

-- ==============================================================================
-- 6. RPC AUTORITATIVA DE FINALIZAÇÃO E CORREÇÃO (finish_and_evaluate_simulado)
-- ==============================================================================
-- Libera o gabarito e as explicações didáticas EXCLUSIVAMENTE após a conclusão formal.
CREATE OR REPLACE FUNCTION public.finish_and_evaluate_simulado(
  p_session_id UUID,
  p_guest_token TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_session public.simulado_sessions%ROWTYPE;
  v_score INTEGER := 0;
  v_total INTEGER := 0;
  v_is_approved BOOLEAN := false;
  v_evaluated_items JSONB := '[]'::jsonb;
  r RECORD;
BEGIN
  -- 1. Validar existência da sessão
  SELECT * INTO v_session
  FROM public.simulado_sessions
  WHERE id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tentativa não encontrada.';
  END IF;

  -- Idempotência: se já concluída, retorna os resultados previamente consolidados
  IF v_session.status = 'completed' THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'question_id', sa.question_id,
        'question_order', sa.question_order,
        'selected_option_id', sa.selected_option_id,
        'correct_option_id', q.correct_option_id,
        'is_correct', sa.is_correct,
        'explanation', q.explanation
      ) ORDER BY sa.question_order
    ) INTO v_evaluated_items
    FROM public.simulado_answers sa
    JOIN public.questions q ON q.id = sa.question_id
    WHERE sa.simulado_id = p_session_id;

    RETURN jsonb_build_object(
      'success', true,
      'session_id', p_session_id,
      'status', v_session.status,
      'score', v_session.score,
      'is_approved', v_session.is_approved,
      'items', COALESCE(v_evaluated_items, '[]'::jsonb)
    );
  END IF;

  IF v_session.status != 'in_progress' THEN
    RAISE EXCEPTION 'Tentativa não está em andamento (status: %).', v_session.status;
  END IF;

  -- 2. Validar propriedade
  IF v_session.user_id IS NOT NULL THEN
    IF auth.uid() IS NULL OR auth.uid() != v_session.user_id THEN
      RAISE EXCEPTION 'Não autorizado: esta tentativa pertence a outro usuário.';
    END IF;
  ELSE
    IF p_guest_token IS NULL OR v_session.guest_token IS DISTINCT FROM p_guest_token THEN
      RAISE EXCEPTION 'Não autorizado: token opaco de convidado inválido.';
    END IF;
  END IF;

  -- 3. Avaliar as respostas comparando com o gabarito oficial em public.questions
  FOR r IN
    SELECT
      sa.id AS answer_id,
      sa.question_id,
      sa.question_order,
      sa.selected_option_id,
      q.correct_option_id,
      q.explanation,
      (sa.selected_option_id IS NOT NULL AND sa.selected_option_id = q.correct_option_id) AS is_correct
    FROM public.simulado_answers sa
    JOIN public.questions q ON q.id = sa.question_id
    WHERE sa.simulado_id = p_session_id
    ORDER BY sa.question_order
  LOOP
    v_total := v_total + 1;
    IF r.is_correct THEN
      v_score := v_score + 1;
    END IF;

    UPDATE public.simulado_answers
    SET is_correct = r.is_correct
    WHERE id = r.answer_id;

    v_evaluated_items := v_evaluated_items || jsonb_build_object(
      'question_id', r.question_id,
      'question_order', r.question_order,
      'selected_option_id', r.selected_option_id,
      'correct_option_id', r.correct_option_id,
      'is_correct', r.is_correct,
      'explanation', r.explanation
    );
  END LOOP;

  v_is_approved := (v_score >= v_session.passing_score);

  -- 4. Atualizar a sessão para completed
  UPDATE public.simulado_sessions
  SET status = 'completed',
      finished_at = timezone('utc'::text, now()),
      score = v_score,
      is_approved = v_is_approved,
      duration_seconds = EXTRACT(EPOCH FROM (timezone('utc'::text, now()) - v_session.started_at))::INTEGER
  WHERE id = p_session_id;

  -- Retornar os itens avaliados com gabarito e explicação liberados no momento autorizado
  RETURN jsonb_build_object(
    'success', true,
    'session_id', p_session_id,
    'status', 'completed',
    'score', v_score,
    'passing_score', v_session.passing_score,
    'is_approved', v_is_approved,
    'total_questions', v_total,
    'items', v_evaluated_items
  );
END;
$$;

-- ==============================================================================
-- 7. PERMISSÕES MÍNIMAS EXPLÍCITAS
-- ==============================================================================
REVOKE EXECUTE ON FUNCTION public.record_simulado_answer(UUID, VARCHAR(64), VARCHAR(10), TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.finish_and_evaluate_simulado(UUID, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.record_simulado_answer(UUID, VARCHAR(64), VARCHAR(10), TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_and_evaluate_simulado(UUID, TEXT) TO anon, authenticated;

COMMIT;
