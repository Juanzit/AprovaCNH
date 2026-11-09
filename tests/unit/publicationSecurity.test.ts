import { describe, it, expect } from 'vitest';
import rawQuestions from '@/data/questions-sinalizacao.json';
import {
  isQuestionEligibleForStudents,
  questionBankSchema,
  type ValidatedQuestion,
} from '@/features/lesson/schemas/questionSchema';
import {
  getApprovedQuestionsByTopic,
  getFallbackApprovedQuestions,
} from '@/features/lesson/server/questionRepository';
import {
  getPriorityReviewQuestions,
  getReviewDashboardData,
} from '@/features/review/server/reviewRepository';
import {
  generateSimuladoQuestions,
  InsufficientApprovedQuestionsError,
} from '@/features/simulado/utils/simuladoGenerator';

describe('Segurança de Publicação e Elegibilidade Editorial nos Caminhos Discentes — P0 (AGENTS.md / D010)', () => {
  const parsedBank = questionBankSchema.parse(rawQuestions);

  function createMockApprovedBank(count: number): ValidatedQuestion[] {
    const base = parsedBank.filter((q) => q.status === 'aprovada');
    const result: ValidatedQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const template = base[i % base.length];
      result.push({
        ...template,
        id: `mock-sec-${i + 1}`,
        status: 'aprovada',
        isExample: false,
      });
    }
    return result;
  }

  // 1. Regra Central de Elegibilidade
  it('isQuestionEligibleForStudents aceita exclusivamente questões com status "aprovada" e isExample === false', () => {
    expect(isQuestionEligibleForStudents({ status: 'aprovada', isExample: false })).toBe(true);
    expect(isQuestionEligibleForStudents({ status: 'aprovada', isExample: true })).toBe(false);
    expect(isQuestionEligibleForStudents({ status: 'em_revisao', isExample: false })).toBe(false);
    expect(isQuestionEligibleForStudents({ status: 'rascunho', isExample: false })).toBe(false);
    expect(isQuestionEligibleForStudents({ status: 'suspensa', isExample: false })).toBe(false);
    expect(isQuestionEligibleForStudents({ status: 'obsoleta', isExample: false })).toBe(false);
  });

  // 2. Não utilizar verificationStatus como substituto de aprovação editorial
  it('não permite publicação de questão com verificationStatus="verified" se o status editorial não for "aprovada"', () => {
    const questionWithVerifiedSource = {
      ...parsedBank[0],
      status: 'em_revisao' as const,
      source: {
        ...parsedBank[0].source,
        verificationStatus: 'verified' as const,
      },
    };

    expect(isQuestionEligibleForStudents(questionWithVerifiedSource)).toBe(false);
  });

  // 3. Não inferir aprovação pela existência de fonte oficial
  it('não permite publicação de questão com fonte oficial se o status for "em_revisao"', () => {
    const officialInReview = parsedBank.find((q) => q.id === 'sin-021')!;
    expect(officialInReview.source.kind).toBe('official');
    expect(officialInReview.status).toBe('em_revisao');
    expect(isQuestionEligibleForStudents(officialInReview)).toBe(false);
  });

  // 4. Caminho 1: Fallback local — retorna somente as 20 questões homologadas
  it('Caminho 1 (Fallback Local): retorna somente as 20 questões homologadas, sem vazar as 10 em revisão', () => {
    const fallback = getFallbackApprovedQuestions();
    expect(fallback).toHaveLength(20);

    const ids = fallback.map((q) => q.id);
    expect(ids).toContain('sin-001');
    expect(ids).toContain('sin-020');
    expect(ids).not.toContain('sin-021');
    expect(ids).not.toContain('sin-030');

    for (const q of fallback) {
      expect(isQuestionEligibleForStudents(q)).toBe(true);
      expect(q.status).toBe('aprovada');
      expect(q.isExample).toBe(false);
    }
  });

  // 5. Caminho 2: Lições Interativas — getApprovedQuestionsByTopic entrega apenas elegíveis
  it('Caminho 2 (Lições): getApprovedQuestionsByTopic entrega exclusivamente questões elegíveis para estudantes', async () => {
    const lessonQuestions = await getApprovedQuestionsByTopic('Sinalização de Trânsito');
    expect(lessonQuestions.length).toBeGreaterThanOrEqual(20);

    for (const q of lessonQuestions) {
      expect(isQuestionEligibleForStudents(q)).toBe(true);
      expect(q.status).toBe('aprovada');
      expect(q.isExample).toBe(false);
      expect(q.options).toHaveLength(4);
    }
  });

  // 6. Caminho 3: Revisão Espaçada (SRS) — Painel e Fila Prática contêm apenas questões elegíveis
  it('Caminho 3 (Revisão Espaçada): getReviewDashboardData e getPriorityReviewQuestions usam somente questões elegíveis', async () => {
    const dashboard = await getReviewDashboardData();
    for (const item of dashboard.queue) {
      expect(isQuestionEligibleForStudents(item.question)).toBe(true);
      expect(item.question.status).toBe('aprovada');
      expect(item.question.isExample).toBe(false);
    }

    const priorityQuestions = await getPriorityReviewQuestions(5);
    expect(priorityQuestions).toHaveLength(5);
    for (const q of priorityQuestions) {
      expect(isQuestionEligibleForStudents(q)).toBe(true);
      expect(q.status).toBe('aprovada');
      expect(q.isExample).toBe(false);
    }
  });

  // 7. Caminho 4: Gerador de Simulado — Rejeita conjunto insuficiente e descarta itens não elegíveis
  it('Caminho 4 (Simulado): falha com InsufficientApprovedQuestionsError no fallback de 20 e não usa itens em revisão', () => {
    const fallback = getFallbackApprovedQuestions();
    expect(() =>
      generateSimuladoQuestions(fallback, { totalQuestions: 30 })
    ).toThrow(InsufficientApprovedQuestionsError);

    // Tentativa com 29 aprovadas + 10 em revisão
    const twentyNineApproved = createMockApprovedBank(29);
    const mixed = [
      ...twentyNineApproved,
      ...rawQuestions.filter((q) => q.status === 'em_revisao'),
    ];

    expect(() =>
      generateSimuladoQuestions(mixed as ValidatedQuestion[], { totalQuestions: 30 })
    ).toThrow(InsufficientApprovedQuestionsError);
  });
});
