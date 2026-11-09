import { describe, it, expect } from 'vitest';
import { getApprovedQuestionsByTopic } from '@/features/lesson/server/questionRepository';
import { isQuestionEligibleForStudents } from '@/features/lesson/schemas/questionSchema';
import { createBrowserClient } from '@supabase/ssr';

describe('Validação em Nuvem do Supabase — Live Integration & Auditoria por Status', () => {
  it(
    'conecta ao Supabase, verifica separadamente quantidades por status e valida que apenas questões elegíveis são retornadas',
    async () => {
      // 1. Consulta através do questionRepository com fallbackToLocal: false
      const repoQuestions = await getApprovedQuestionsByTopic('Sinalização de Trânsito', {
        fallbackToLocal: false,
      });

      expect(repoQuestions).toBeDefined();
      expect(repoQuestions.length).toBeGreaterThanOrEqual(20);

      // Valida que 100% das questões retornadas pelo repositório são aprovadas e elegíveis
      for (const q of repoQuestions) {
        expect(isQuestionEligibleForStudents(q)).toBe(true);
        expect(q.status).toBe('aprovada');
        expect(q.isExample).toBe(false);
        expect(q.options).toHaveLength(4);
        expect(q.source.kind).toBe('official');
      }

      // 2. Consulta direta física ao Supabase para auditar a distribuição por status no banco
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createBrowserClient(supabaseUrl, supabaseAnonKey);

      const { data: dbRows, error } = await client
        .from('questions')
        .select('id, status, topic');

      expect(error).toBeNull();
      expect(dbRows).toBeDefined();
      expect(dbRows?.length).toBeGreaterThanOrEqual(20);

      const approvedDbRows = dbRows!.filter((r) => r.status === 'aprovada');
      const inReviewDbRows = dbRows!.filter((r) => r.status === 'em_revisao');
      const otherDbRows = dbRows!.filter((r) => !['aprovada', 'em_revisao'].includes(r.status));

      expect(approvedDbRows.length).toBeGreaterThanOrEqual(20);

      // Registra e audita IDs elegíveis vs em revisão
      const approvedIds = new Set(approvedDbRows.map((r) => r.id));
      const inReviewIds = new Set(inReviewDbRows.map((r) => r.id));

      // Comprova que todos os IDs retornados pelo repositório são de fato do conjunto de aprovadas no banco
      for (const q of repoQuestions) {
        expect(approvedIds.has(q.id)).toBe(true);
        expect(inReviewIds.has(q.id)).toBe(false);
      }

      // Comprova que nenhuma questão com status outro que aprovada é retornada
      expect(repoQuestions.some((q) => inReviewIds.has(q.id))).toBe(false);
      expect(otherDbRows).toHaveLength(0);
    },
    35000
  );
});
