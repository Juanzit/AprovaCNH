import { describe, it, expect } from 'vitest';
import {
  getIdealIntervalDays,
  calculateConsecutiveCorrect,
  calculateQuestionReviewStats,
  sortReviewQueue,
} from '@/features/review/utils/srsAlgorithm';
import type { UserAnswerRecord, QuestionReviewStats } from '@/features/review/types/review';

describe('srsAlgorithm (Algoritmo Determinístico de Repetição Espaçada — D018)', () => {
  describe('getIdealIntervalDays', () => {
    it('retorna 0 dias para 0 ou menos acertos consecutivos', () => {
      expect(getIdealIntervalDays(0)).toBe(0);
      expect(getIdealIntervalDays(-1)).toBe(0);
    });

    it('retorna 1 dia para 1 acerto consecutivo', () => {
      expect(getIdealIntervalDays(1)).toBe(1);
    });

    it('retorna 3 dias para 2 acertos consecutivos', () => {
      expect(getIdealIntervalDays(2)).toBe(3);
    });

    it('retorna 7 dias para 3 acertos consecutivos', () => {
      expect(getIdealIntervalDays(3)).toBe(7);
    });

    it('retorna 14 dias para 4 ou mais acertos consecutivos', () => {
      expect(getIdealIntervalDays(4)).toBe(14);
      expect(getIdealIntervalDays(10)).toBe(14);
    });
  });

  describe('calculateConsecutiveCorrect', () => {
    it('retorna 0 para histórico vazio', () => {
      expect(calculateConsecutiveCorrect([])).toBe(0);
    });

    it('retorna 0 se a última resposta foi erro', () => {
      const records: UserAnswerRecord[] = [
        { id: '1', question_id: 'q1', session_id: 1, selected_option_id: 'a', is_correct: true, answered_at: '2026-11-01T10:00:00Z' },
        { id: '2', question_id: 'q1', session_id: 1, selected_option_id: 'b', is_correct: false, answered_at: '2026-11-02T10:00:00Z' },
      ];
      expect(calculateConsecutiveCorrect(records)).toBe(0);
    });

    it('retorna a contagem de acertos consecutivos a partir do final', () => {
      const records: UserAnswerRecord[] = [
        { id: '1', question_id: 'q1', session_id: 1, selected_option_id: 'b', is_correct: false, answered_at: '2026-11-01T10:00:00Z' },
        { id: '2', question_id: 'q1', session_id: 1, selected_option_id: 'a', is_correct: true, answered_at: '2026-11-02T10:00:00Z' },
        { id: '3', question_id: 'q1', session_id: 1, selected_option_id: 'a', is_correct: true, answered_at: '2026-11-03T10:00:00Z' },
      ];
      expect(calculateConsecutiveCorrect(records)).toBe(2);
    });
  });

  describe('calculateQuestionReviewStats', () => {
    const fixedNow = new Date('2026-11-08T12:00:00Z');

    it('retorna null quando não há respostas', () => {
      expect(calculateQuestionReviewStats('q1', [], fixedNow)).toBeNull();
    });

    it('atribui prioridade máxima quando a última resposta é um erro recente', () => {
      const records: UserAnswerRecord[] = [
        {
          id: '1',
          question_id: 'sin-001',
          session_id: 1,
          selected_option_id: 'c',
          is_correct: false,
          answered_at: '2026-11-08T10:00:00Z',
        },
      ];

      const stats = calculateQuestionReviewStats('sin-001', records, fixedNow);
      expect(stats).not.toBeNull();
      expect(stats?.lastIsCorrect).toBe(false);
      expect(stats?.consecutiveCorrect).toBe(0);
      expect(stats?.idealIntervalDays).toBe(0);
      // wStatus (100) + wErro (40 * 1.0) = 140 pontos + atraso imediato
      expect(stats?.priorityScore).toBeGreaterThanOrEqual(140);
      expect(stats?.explanationReason).toBe('Você errou esta questão na última tentativa');
      expect(stats?.isOverdue).toBe(true);
    });

    it('calcula pontuação baixa para questão acertada hoje', () => {
      const records: UserAnswerRecord[] = [
        {
          id: '1',
          question_id: 'sin-002',
          session_id: 1,
          selected_option_id: 'a',
          is_correct: true,
          answered_at: '2026-11-08T11:00:00Z',
        },
      ];

      const stats = calculateQuestionReviewStats('sin-002', records, fixedNow);
      expect(stats).not.toBeNull();
      expect(stats?.lastIsCorrect).toBe(true);
      expect(stats?.consecutiveCorrect).toBe(1);
      expect(stats?.idealIntervalDays).toBe(1);
      expect(stats?.isOverdue).toBe(false);
      expect(stats?.priorityScore).toBe(0); // wStatus=0, wErro=0, wAtraso=0
    });

    it('identifica questão vencida pelo ciclo de espaçamento (overdue)', () => {
      const records: UserAnswerRecord[] = [
        {
          id: '1',
          question_id: 'sin-003',
          session_id: 1,
          selected_option_id: 'a',
          is_correct: true,
          answered_at: '2026-11-05T12:00:00Z', // há 3 dias (intervalo era 1 dia)
        },
      ];

      const stats = calculateQuestionReviewStats('sin-003', records, fixedNow);
      expect(stats).not.toBeNull();
      expect(stats?.lastIsCorrect).toBe(true);
      expect(stats?.isOverdue).toBe(true);
      expect(stats?.priorityScore).toBeGreaterThan(0);
      expect(stats?.explanationReason).toContain('Venceu o intervalo de revisão (1 dia sem praticar)');
    });
  });

  describe('sortReviewQueue (Ordenação Determinística)', () => {
    it('ordena por prioridade decrescente com desempate por recência e ID', () => {
      const item1 = {
        questionId: 'sin-001',
        stats: {
          questionId: 'sin-001',
          priorityScore: 50,
          lastAnsweredAt: '2026-11-05T10:00:00Z',
        } as QuestionReviewStats,
      };

      const item2 = {
        questionId: 'sin-002',
        stats: {
          questionId: 'sin-002',
          priorityScore: 140, // Maior prioridade
          lastAnsweredAt: '2026-11-08T10:00:00Z',
        } as QuestionReviewStats,
      };

      const item3 = {
        questionId: 'sin-003',
        stats: {
          questionId: 'sin-003',
          priorityScore: 50,
          lastAnsweredAt: '2026-11-04T10:00:00Z', // Mais antigo que item1
        } as QuestionReviewStats,
      };

      const sorted = sortReviewQueue([item1, item2, item3]);
      expect(sorted[0].questionId).toBe('sin-002'); // Maior prioridade (140)
      expect(sorted[1].questionId).toBe('sin-003'); // Empatou em 50 com item1, mas é mais antigo
      expect(sorted[2].questionId).toBe('sin-001'); // 50, mais recente
    });
  });
});
