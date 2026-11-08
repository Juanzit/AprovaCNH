import { describe, it, expect } from 'vitest';
import {
  calculateQuestionMastery,
  getMasteryStatus,
  calculateSubtopicMastery,
  calculateAllSubtopicsMastery,
  UNIT_1_SUBTOPICS,
} from '@/features/review/utils/masteryCalculator';
import type { UserAnswerRecord } from '@/features/review/types/review';

describe('masteryCalculator (Diagnóstico de Domínio por Subtema e Artigo)', () => {
  describe('calculateQuestionMastery', () => {
    it('retorna 0 quando não há respostas', () => {
      expect(calculateQuestionMastery([])).toBe(0);
    });

    it('retorna 100 quando a única tentativa é um acerto', () => {
      const records: UserAnswerRecord[] = [
        { id: '1', question_id: 'q1', session_id: 1, selected_option_id: 'a', is_correct: true, answered_at: '2026-11-08T10:00:00Z' },
      ];
      // 0.7 * 100 + 0.3 * 100 = 100
      expect(calculateQuestionMastery(records)).toBe(100);
    });

    it('retorna 0 quando a única tentativa é um erro', () => {
      const records: UserAnswerRecord[] = [
        { id: '1', question_id: 'q1', session_id: 1, selected_option_id: 'b', is_correct: false, answered_at: '2026-11-08T10:00:00Z' },
      ];
      // 0.7 * 0 + 0.3 * 0 = 0
      expect(calculateQuestionMastery(records)).toBe(0);
    });

    it('privilegia a recuperação recente após erro inicial', () => {
      const records: UserAnswerRecord[] = [
        { id: '1', question_id: 'q1', session_id: 1, selected_option_id: 'b', is_correct: false, answered_at: '2026-11-01T10:00:00Z' },
        { id: '2', question_id: 'q1', session_id: 1, selected_option_id: 'a', is_correct: true, answered_at: '2026-11-08T10:00:00Z' },
      ];
      // lastScore = 100 -> 70. acertos = 1/2 (50%) -> 15. Total = 85.
      expect(calculateQuestionMastery(records)).toBe(85);
    });

    it('penaliza o domínio se o aluno cometer um erro recente', () => {
      const records: UserAnswerRecord[] = [
        { id: '1', question_id: 'q1', session_id: 1, selected_option_id: 'a', is_correct: true, answered_at: '2026-11-01T10:00:00Z' },
        { id: '2', question_id: 'q1', session_id: 1, selected_option_id: 'b', is_correct: false, answered_at: '2026-11-08T10:00:00Z' },
      ];
      // lastScore = 0 -> 0. acertos = 1/2 (50%) -> 15. Total = 15.
      expect(calculateQuestionMastery(records)).toBe(15);
    });
  });

  describe('getMasteryStatus', () => {
    it('retorna nao_praticado quando nenhuma questão foi tentada', () => {
      expect(getMasteryStatus(0, 0)).toEqual({
        status: 'nao_praticado',
        statusLabel: 'Não praticado',
      });
    });

    it('retorna critico para pontuação abaixo de 60%', () => {
      expect(getMasteryStatus(59, 3)).toEqual({
        status: 'critico',
        statusLabel: 'Crítico',
      });
    });

    it('retorna em_progresso para pontuação entre 60% e 79%', () => {
      expect(getMasteryStatus(60, 5)).toEqual({
        status: 'em_progresso',
        statusLabel: 'Em Progresso',
      });
      expect(getMasteryStatus(79, 5)).toEqual({
        status: 'em_progresso',
        statusLabel: 'Em Progresso',
      });
    });

    it('retorna dominado para pontuação igual ou superior a 80%', () => {
      expect(getMasteryStatus(80, 5)).toEqual({
        status: 'dominado',
        statusLabel: 'Dominado',
      });
      expect(getMasteryStatus(100, 5)).toEqual({
        status: 'dominado',
        statusLabel: 'Dominado',
      });
    });
  });

  describe('calculateSubtopicMastery e calculateAllSubtopicsMastery', () => {
    it('calcula domínio de 100% (Dominado) quando todas as 5 questões da Sessão 1 foram acertadas', () => {
      const map = new Map<string, UserAnswerRecord[]>();
      for (const qId of UNIT_1_SUBTOPICS[0].questionIds) {
        map.set(qId, [
          { id: qId, question_id: qId, session_id: 1, selected_option_id: 'a', is_correct: true, answered_at: '2026-11-08T10:00:00Z' },
        ]);
      }

      const result = calculateSubtopicMastery(UNIT_1_SUBTOPICS[0], map);
      expect(result.masteryScore).toBe(100);
      expect(result.status).toBe('dominado');
      expect(result.attemptedQuestions).toBe(5);
    });

    it('gera lista com os 4 subtemas oficiais da Unidade 1', () => {
      const map = new Map<string, UserAnswerRecord[]>();
      const all = calculateAllSubtopicsMastery(map);

      expect(all).toHaveLength(4);
      expect(all[0].sessionId).toBe(1);
      expect(all[0].legalProvision).toContain('Art. 195');
      expect(all[0].status).toBe('nao_praticado');

      expect(all[3].sessionId).toBe(4);
      expect(all[3].legalProvision).toContain('Art. 208');
    });
  });
});
