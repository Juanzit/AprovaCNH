-- Fase 6.1 — Metadados do BNQ v1.0 e vínculos visuais de sinalização
-- Esta migration altera apenas o schema. A carga em lote fica em scripts/ingest-bnq.mjs.
BEGIN;

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS source_question_id TEXT,
  ADD COLUMN IF NOT EXISTS difficulty TEXT,
  ADD COLUMN IF NOT EXISTS sign_code TEXT,
  ADD COLUMN IF NOT EXISTS sign_asset_codes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.question_reviews
  ADD COLUMN IF NOT EXISTS approval_method TEXT,
  ADD COLUMN IF NOT EXISTS approval_batch_id TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'questions_difficulty_check'
      AND conrelid = 'public.questions'::regclass
  ) THEN
    ALTER TABLE public.questions
      ADD CONSTRAINT questions_difficulty_check
      CHECK (difficulty IS NULL OR difficulty IN ('facil', 'intermediario', 'dificil'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'question_reviews_approval_method_check'
      AND conrelid = 'public.question_reviews'::regclass
  ) THEN
    ALTER TABLE public.question_reviews
      ADD CONSTRAINT question_reviews_approval_method_check
      CHECK (
        approval_method IS NULL
        OR approval_method IN ('individual_human_review', 'authorized_official_batch')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'question_reviews_batch_id_check'
      AND conrelid = 'public.question_reviews'::regclass
  ) THEN
    ALTER TABLE public.question_reviews
      ADD CONSTRAINT question_reviews_batch_id_check
      CHECK (
        approval_method <> 'authorized_official_batch'
        OR approval_batch_id IS NOT NULL AND length(trim(approval_batch_id)) > 0
      );
  END IF;
END;
$$;

UPDATE public.exam_configs
SET name = 'Simulado Multidisciplinar Proporcional — BNQ v1.0'
WHERE uf = 'MG' AND is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_source_question_id
  ON public.questions (source_question_id)
  WHERE source_question_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_questions_sign_code
  ON public.questions (sign_code)
  WHERE sign_code IS NOT NULL;

COMMENT ON COLUMN public.questions.source_question_id IS
  'ID original do registro no BNQ v1.0 SENATRAN, preservado para rastreabilidade.';
COMMENT ON COLUMN public.questions.difficulty IS
  'Nível de dificuldade conforme campo do registro BNQ v1.0.';
COMMENT ON COLUMN public.questions.sign_code IS
  'Código de sinalização informado pelo registro-fonte BNQ; pode existir sem SVG local.';
COMMENT ON COLUMN public.questions.sign_asset_codes IS
  'Códigos com SVG local auditado e efetivamente disponível em public/signs; não substitui sign_code.';
COMMENT ON COLUMN public.question_reviews.approval_method IS
  'Método de aprovação: revisão humana individual ou autorização oficial em lote documentada.';
COMMENT ON COLUMN public.question_reviews.approval_batch_id IS
  'Identificador estável do lote autorizado pelo responsável do produto.';

COMMIT;
