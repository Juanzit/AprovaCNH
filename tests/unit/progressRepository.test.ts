import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  evaluateAndRecordSession,
  updateStudentProfile,
  getLessonTopicProgress,
} from '@/features/progress/server/progressRepository';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/features/lesson/server/questionRepository', () => ({
  getApprovedQuestionsByTopic: vi.fn().mockResolvedValue([
    { id: 'sin-001', correctOptionId: 'b' },
    { id: 'sin-002', correctOptionId: 'a' },
    { id: 'sin-003', correctOptionId: 'a' },
    { id: 'sin-004', correctOptionId: 'a' },
    { id: 'sin-005', correctOptionId: 'b' },
  ]),
}));

describe('progressRepository (Validação Autoritativa no Servidor)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejeita "BR" como sigla de UF no perfil (Regra D014)', async () => {
    const result = await updateStudentProfile({ uf: 'BR' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('D014');
  });

  it('avalia 5 acertos no modo visitante concedendo 70 XP em memória', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const payload = {
      topic: 'Sinalização de Trânsito',
      sessionId: 1,
      answers: [
        { questionId: 'sin-001', selectedOptionId: 'b' },
        { questionId: 'sin-002', selectedOptionId: 'a' },
        { questionId: 'sin-003', selectedOptionId: 'a' },
        { questionId: 'sin-004', selectedOptionId: 'a' },
        { questionId: 'sin-005', selectedOptionId: 'b' },
      ],
    };

    const result = await evaluateAndRecordSession(payload);
    expect(result.success).toBe(true);
    expect(result.score).toBe(5);
    expect(result.maxScore).toBe(5);
    expect(result.xpAwarded).toBe(70);
    expect(result.isFirstCompletion).toBe(true);
  });

  it('concede 70 XP apenas na primeira conclusão e 0 XP em revisões subsequentes', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockInsertAnswers = vi.fn().mockResolvedValue({ error: null });
    const mockInsertXp = vi.fn().mockResolvedValue({ error: null });
    const mockUpdateProfile = vi.fn().mockResolvedValue({ error: null });

    const { createClient } = await import('@/lib/supabase/server');

    // 1. Primeira conclusão (nenhum progresso prévio)
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'usr-123' } } }),
      },
      from: vi.fn((table: string) => {
        if (table === 'lesson_progress') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: null }), // sem conclusão prévia
                  }),
                }),
              }),
            }),
            upsert: mockUpsert,
          };
        }
        if (table === 'user_answers') {
          return { insert: mockInsertAnswers };
        }
        if (table === 'xp_transactions') {
          return { insert: mockInsertXp };
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { xp_total: 0, current_streak: 0, longest_streak: 0, last_activity_date: null },
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: mockUpdateProfile,
            }),
          };
        }
        return {};
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const payload = {
      topic: 'Sinalização de Trânsito',
      sessionId: 1,
      answers: [
        { questionId: 'sin-001', selectedOptionId: 'b' },
        { questionId: 'sin-002', selectedOptionId: 'a' },
        { questionId: 'sin-003', selectedOptionId: 'a' },
        { questionId: 'sin-004', selectedOptionId: 'a' },
        { questionId: 'sin-005', selectedOptionId: 'b' },
      ],
    };

    const firstResult = await evaluateAndRecordSession(payload);
    expect(firstResult.xpAwarded).toBe(70);
    expect(firstResult.isFirstCompletion).toBe(true);

    // 2. Revisão subsequente (sessão já concluída previamente)
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'usr-123' } } }),
      },
      from: vi.fn((table: string) => {
        if (table === 'lesson_progress') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { status: 'completed', score: 5, xp_earned: 70 }, // já concluída
                    }),
                  }),
                }),
              }),
            }),
            upsert: mockUpsert,
          };
        }
        if (table === 'user_answers') return { insert: mockInsertAnswers };
        if (table === 'xp_transactions') return { insert: mockInsertXp };
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { xp_total: 70, current_streak: 1, longest_streak: 1, last_activity_date: '2026-11-08' },
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: mockUpdateProfile,
            }),
          };
        }
        return {};
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const reviewResult = await evaluateAndRecordSession(payload);
    expect(reviewResult.xpAwarded).toBe(0); // 0 XP na revisão conforme decisão do Tech Lead!
    expect(reviewResult.isFirstCompletion).toBe(false);
    expect(reviewResult.score).toBe(5);
  });

  it('retorna as 4 sessões com status "available" no estado inicial', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const sessions = await getLessonTopicProgress('Sinalização de Trânsito');
    expect(sessions).toHaveLength(4);
    expect(sessions.map((s) => s.sessionId)).toEqual([1, 2, 3, 4]);
    sessions.forEach((s) => {
      expect(s.status).toBe('available');
    });
  });
});
