import { describe, it, expect } from 'vitest';
import { getApprovedQuestionsByTopic } from '@/features/lesson/server/questionRepository';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const hasSupabaseIntegrationEnv = Boolean(supabaseUrl && supabaseAnonKey);

describe.skipIf(!hasSupabaseIntegrationEnv)('Validação em Nuvem do Supabase (Live Integration)', () => {
  it(
    'conecta diretamente ao Supabase e busca as questões homologadas sem fallback local',
    async () => {
      const questions = await getApprovedQuestionsByTopic('Sinalização de Trânsito', {
        fallbackToLocal: false,
      });

      expect(questions).toBeDefined();
      expect(questions.length).toBeGreaterThanOrEqual(20);

      for (const question of questions) {
        expect(question.isExample).toBe(false);
        expect(question.options).toHaveLength(4);
        expect(question.source.kind).toBe('official');
      }

      const client = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
      const { data: dbRows, error } = await client
        .from('questions')
        .select('id, status, topic');

      expect(error).toBeNull();
      expect(dbRows).toBeDefined();
      expect(dbRows?.length).toBeGreaterThanOrEqual(20);
    },
    20000
  );
});
