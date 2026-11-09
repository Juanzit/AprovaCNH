import { describe, it, expect } from 'vitest';
import rawQuestions from '@/data/questions-sinalizacao.json';
import {
  isQuestionEligibleForStudents,
  questionBankSchema,
  type ValidatedQuestion,
} from '@/features/lesson/schemas/questionSchema';
import { getFallbackApprovedQuestions } from '@/features/lesson/server/questionRepository';
import {
  generateSimuladoQuestions,
  InsufficientApprovedQuestionsError,
} from '@/features/simulado/utils/simuladoGenerator';

describe('Segurança de Publicação e Elegibilidade Editorial — P0 (Regra D010 / AGENTS.md)', () => {
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
  it('não permite publicação de questão oficial se o status for "em_revisao"', () => {
    const officialInReview = parsedBank.find((q) => q.id === 'sin-021')!;
    expect(officialInReview.source.kind).toBe('official');
    expect(officialInReview.status).toBe('em_revisao');
    expect(isQuestionEligibleForStudents(officialInReview)).toBe(false);
  });

  // 4. Fallback local: retorna somente 20 questões aprovadas
  it('o fallback local retorna exatamente 20 questões aprovadas do acervo de 30, sem vazar as 10 em revisão', () => {
    const fallback = getFallbackApprovedQuestions();
    expect(fallback).toHaveLength(20);

    const ids = fallback.map((q) => q.id);
    expect(ids).toContain('sin-001');
    expect(ids).toContain('sin-020');
    expect(ids).not.toContain('sin-021');
    expect(ids).not.toContain('sin-030');

    for (const q of fallback) {
      expect(q.status).toBe('aprovada');
      expect(q.isExample).toBe(false);
      expect(q.review?.approvedBy).toBeTruthy();
    }
  });

  // 5. Simulado: não inicia com 20 aprovadas
  it('o gerador de simulado falha com InsufficientApprovedQuestionsError com as 20 questões do fallback', () => {
    const fallback = getFallbackApprovedQuestions();
    expect(() =>
      generateSimuladoQuestions(fallback, { totalQuestions: 30 })
    ).toThrow(InsufficientApprovedQuestionsError);
  });

  // 6. Simulado: não inicia com 29 aprovadas
  it('o gerador de simulado falha com InsufficientApprovedQuestionsError com 29 aprovadas e não completa com pendentes', () => {
    const twentyNineApproved = createMockApprovedBank(29);
    const mixedBank = [
      ...twentyNineApproved,
      { ...twentyNineApproved[0], id: 'sin-pending', status: 'em_revisao' as const },
    ];

    expect(() =>
      generateSimuladoQuestions(mixedBank, { totalQuestions: 30 })
    ).toThrow(InsufficientApprovedQuestionsError);
  });

  // 7. Simulado: 30 aprovadas geram exatamente 30 questões distintas
  it('o gerador de simulado com 30 aprovadas gera exatamente 30 questões distintas e ordenadas de 1 a 30', () => {
    const thirtyApproved = createMockApprovedBank(30);
    const items = generateSimuladoQuestions(thirtyApproved, { totalQuestions: 30, seed: 123 });

    expect(items).toHaveLength(30);
    const uniqueIds = new Set(items.map((i) => i.question.id));
    expect(uniqueIds.size).toBe(30);

    for (let i = 0; i < 30; i++) {
      expect(items[i].questionOrder).toBe(i + 1);
      expect(items[i].question.status).toBe('aprovada');
    }
  });
});
