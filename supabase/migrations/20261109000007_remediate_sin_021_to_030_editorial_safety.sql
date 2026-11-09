-- Migration: 20261109000007_remediate_sin_021_to_030_editorial_safety.sql
-- Saneamento exclusivo e cirúrgico de aprovações fictícias identificáveis (T006 P0 / D010).
-- ATENÇÃO: NÃO APLICAR AUTOMATICAMENTE. Proposta estritamente isolada para revisão editorial.
--
-- Princípios e Invariantes desta Migration:
-- 1. NÃO sobrescreve statement, options, correct_option_id ou explanation.
-- 2. NÃO sobrescreve question_sources (document, provision, url, verification_status).
-- 3. NÃO sobrescreve verification_notes em question_reviews.
-- 4. NÃO apaga responsável ou data de aprovação humana legítima.
-- 5. NÃO infere aprovação editorial a partir de verification_status = 'verified'.
-- 6. Separa categoricamente verificação documental de fonte da aprovação editorial da questão.
-- 7. Identifica valores fictícios por condição estrita e explícita:
--    ('Tech Lead / Responsável pelo Produto', 'Antigravity')
-- 8. Idempotência garantida: reexecuções produzem exatamente o mesmo estado estável.
-- 9. Se não for possível distinguir aprovação humana de fictícia, o registro é preservado intocado.

BEGIN;

-- 1. Remoção cirúrgica de aprovador fictício em question_reviews
-- Afeta EXCLUSIVAMENTE os registros onde o campo approved_by contenha um valor fictício conhecido.
-- Preserva intactos: verification_notes, generator_model, verifier_model e aprovadores humanos legítimos.
UPDATE public.question_reviews
SET
    approved_by = NULL,
    approved_at = NULL
WHERE question_id IN ('sin-021', 'sin-022', 'sin-023', 'sin-024', 'sin-025', 'sin-026', 'sin-027', 'sin-028', 'sin-029', 'sin-030')
  AND approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity');

-- 2. Atualização de status em public.questions para 'em_revisao'
-- Aplica-se exclusivamente se a questão estiver como 'aprovada' e NÃO possuir um aprovador humano legítimo
-- em question_reviews (ou seja, quando approved_by for NULL ou tenha sido limpo por ser fictício).
-- Se a questão possuir um aprovador humano legítimo (diferente dos fictícios e não nulo), seu status é PRESERVADO.
UPDATE public.questions q
SET
    status = 'em_revisao',
    updated_at = timezone('utc'::text, now())
WHERE q.id IN ('sin-021', 'sin-022', 'sin-023', 'sin-024', 'sin-025', 'sin-026', 'sin-027', 'sin-028', 'sin-029', 'sin-030')
  AND q.status = 'aprovada'
  AND NOT EXISTS (
      SELECT 1
      FROM public.question_reviews r
      WHERE r.question_id = q.id
        AND r.approved_by IS NOT NULL
        AND r.approved_by NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')
  );

COMMIT;
