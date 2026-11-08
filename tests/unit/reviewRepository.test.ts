import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getReviewDashboardData,
  getPriorityReviewQuestions,
  submitReviewSession,
  inMemoryGuestAnswers,
} from '@/features/review/server/reviewRepository';

// Mock do supabase server para testes unitários sem rede
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}));

describe('reviewRepository (Repositório do Centro de Revisão)', () => {
  beforeEach(() => {
    inMemoryGuestAnswers.length = 0;
  });

  it('retorna dados estruturados de diagnóstico com 4 subtemas mesmo para visitante sem respostas', async () => {
    const dashboard = await getReviewDashboardData('guest-123');

    expect(dashboard.subtopics).toHaveLength(4);
    expect(dashboard.subtopics[0].subtopic).toContain('Art. 195');
    expect(dashboard.subtopics[0].status).toBe('nao_praticado');
    expect(dashboard.queue).toHaveLength(0);
    expect(dashboard.totalOverdue).toBe(0);
    expect(dashboard.totalRecentErrors).toBe(0);
  });

  it('inclui questões erradas no topo da fila de revisão', async () => {
    // Simula resposta errada para sin-001
    inMemoryGuestAnswers.push({
      id: 'ans-1',
      question_id: 'sin-001',
      session_id: 1,
      selected_option_id: 'c', // incorreta
      is_correct: false,
      answered_at: new Date().toISOString(),
    });

    const dashboard = await getReviewDashboardData();
    expect(dashboard.queue).toHaveLength(1);
    expect(dashboard.queue[0].question.id).toBe('sin-001');
    expect(dashboard.queue[0].stats.lastIsCorrect).toBe(false);
    expect(dashboard.totalRecentErrors).toBe(1);
    expect(dashboard.subtopics[0].status).toBe('critico');
  });

  it('getPriorityReviewQuestions retorna 5 questões completando a fila se houver menos de 5 pendências', async () => {
    inMemoryGuestAnswers.push({
      id: 'ans-1',
      question_id: 'sin-003',
      session_id: 1,
      selected_option_id: 'a',
      is_correct: false,
      answered_at: new Date().toISOString(),
    });

    const questions = await getPriorityReviewQuestions(5);
    expect(questions).toHaveLength(5);
    expect(questions[0].id).toBe('sin-003'); // A errada deve ser a primeira
  });

  it('submitReviewSession avalia respostas e adiciona ao histórico', async () => {
    const submission = [
      { questionId: 'sin-001', selectedOptionId: 'b' }, // Correta (Art. 195 - ordem do agente)
    ];

    const result = await submitReviewSession(submission);
    expect(result.success).toBe(true);
    expect(result.totalAnswers).toBe(1);
    expect(result.correctCount).toBe(1);
    expect(result.results[0].is_correct).toBe(true);
    expect(inMemoryGuestAnswers.length).toBe(1);
  });
});
