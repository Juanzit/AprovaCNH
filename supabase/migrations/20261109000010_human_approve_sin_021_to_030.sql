-- Migration: 20261109000010_human_approve_sin_021_to_030.sql
-- Homologação humana formal das questões sin-021..sin-030, autorizada pelo responsável do produto.
-- A aprovação editorial é registrada em questions.status e question_reviews.
-- O estado documental das fontes (question_sources.verification_status) é preservado sem inferência.

BEGIN;

DO $$
DECLARE
  v_target_count INTEGER;
BEGIN
  SELECT COUNT(*)
    INTO v_target_count
  FROM public.questions
  WHERE id IN (
    'sin-021', 'sin-022', 'sin-023', 'sin-024', 'sin-025',
    'sin-026', 'sin-027', 'sin-028', 'sin-029', 'sin-030'
  )
    AND is_example = false;

  IF v_target_count <> 10 THEN
    RAISE EXCEPTION
      'Homologação abortada: esperado encontrar 10 questões não demonstrativas, encontradas %.',
      v_target_count;
  END IF;
END $$;

UPDATE public.questions
SET
  status = 'aprovada',
  updated_at = timezone('utc'::text, now())
WHERE id IN (
  'sin-021', 'sin-022', 'sin-023', 'sin-024', 'sin-025',
  'sin-026', 'sin-027', 'sin-028', 'sin-029', 'sin-030'
)
  AND is_example = false;

INSERT INTO public.question_reviews AS existing_review (
  question_id,
  approved_by,
  approved_at,
  verification_notes
)
SELECT
  q.id,
  'Responsável humano pelo projeto / Tech Lead',
  timezone('utc'::text, now()),
  'Homologação humana formal aprovada em 09/11/2026. A verificação documental da fonte permanece independente e não foi alterada por esta migration.'
FROM public.questions q
WHERE q.id IN (
  'sin-021', 'sin-022', 'sin-023', 'sin-024', 'sin-025',
  'sin-026', 'sin-027', 'sin-028', 'sin-029', 'sin-030'
)
ON CONFLICT (question_id) DO UPDATE SET
  approved_by = EXCLUDED.approved_by,
  approved_at = COALESCE(existing_review.approved_at, EXCLUDED.approved_at),
  verification_notes = CASE
    WHEN position('Homologação humana formal aprovada em 09/11/2026.' IN COALESCE(existing_review.verification_notes, '')) > 0
      THEN existing_review.verification_notes
    ELSE concat_ws(
      E'\n',
      NULLIF(existing_review.verification_notes, ''),
      EXCLUDED.verification_notes
    )
  END;

COMMIT;
