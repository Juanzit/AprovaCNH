-- Migration: 20261108000003_add_review_indexes.sql
-- Fase 5 (T005): Índice otimizado para agregação e consulta da fila de repetição espaçada

-- Índice composto cobrindo user_id e answered_at decrescente
CREATE INDEX IF NOT EXISTS idx_user_answers_user_answered
ON public.user_answers (user_id, answered_at DESC);
