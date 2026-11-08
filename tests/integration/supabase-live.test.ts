import { describe, it, expect } from 'vitest';
import { getApprovedQuestionsByTopic } from '@/features/lesson/server/questionRepository';
import { createBrowserClient } from '@supabase/ssr';

describe('Validação em Nuvem do Supabase (Live Integration)', () => {
  it(
    'conecta diretamente ao Supabase e busca as 20 questões homologadas sem fallback local',
    async () => {
      // 1. Testa consulta através do repositório com fallbackToLocal: false
      const questions = await getApprovedQuestionsByTopic('Sinalização de Trânsito', {
        fallbackToLocal: false,
      });

      expect(questions).toBeDefined();
      expect(questions.length).toBe(20);

      // Valida integridade das 20 questões vindas do Supabase
      for (const q of questions) {
        expect(q.status).toBe('aprovada');
        expect(q.isExample).toBe(false);
        expect(q.options).toHaveLength(4);
        expect(q.source.kind).toBe('official');
        expect(q.source.verificationStatus).toBe('verified');
        expect(q.source.document).toContain('Resolução CONTRAN nº 985/2022');
        expect(q.review?.approvedBy).toBe('Tech Lead / Responsável pelo Produto');
      }

      // 2. Consulta direta à tabela questions via cliente para comprovar presença física
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createBrowserClient(supabaseUrl, supabaseAnonKey);

      const { data: dbRows, error } = await client
        .from('questions')
        .select('id, status, topic')
        .eq('status', 'aprovada');

      expect(error).toBeNull();
      expect(dbRows).toBeDefined();
      expect(dbRows?.length).toBe(20);
    },
    20000
  );
});
