import { describe, it, expect } from 'vitest';
import rawQuestions from '@/data/questions-sinalizacao.json';
import { questionBankSchema, type ValidatedQuestion } from '@/features/lesson/schemas/questionSchema';
import {
  DEFAULT_EXAM_CONFIG,
  examConfigSchema,
  type SimuladoSubmissionPayload,
} from '@/features/simulado/types/simulado';
import {
  evaluateSimuladoSubmission,
  formatDurationHuman,
  formatDurationMmSs,
  generateSimuladoQuestions,
  InsufficientApprovedQuestionsError,
} from '@/features/simulado/utils/simuladoGenerator';

describe('Simulado Configurável — Regras D007, Segurança Editorial e Validações', () => {
  const questionBank = questionBankSchema.parse(rawQuestions);

  // Helper para criar um banco sintético controlado de questões aprovadas e distintas
  function createMockApprovedBank(count: number): ValidatedQuestion[] {
    const base = questionBank.filter((q) => q.status === 'aprovada');
    const result: ValidatedQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const template = base[i % base.length];
      result.push({
        ...template,
        id: `mock-approved-${i + 1}`,
        status: 'aprovada',
        isExample: false,
      });
    }
    return result;
  }

  it('valida a configuração padrão do simulado temático (30 questões, 60 min, corte 20 — Res. CONTRAN 1.020/2025)', () => {
    const parsed = examConfigSchema.safeParse(DEFAULT_EXAM_CONFIG);
    expect(parsed.success).toBe(true);
    expect(DEFAULT_EXAM_CONFIG.totalQuestions).toBe(30);
    expect(DEFAULT_EXAM_CONFIG.durationMinutes).toBe(60);
    expect(DEFAULT_EXAM_CONFIG.passingScore).toBe(20);
    expect(DEFAULT_EXAM_CONFIG.uf).toBe('MG');
  });

  it('rejeita a sigla "BR" como UF na configuração do exame (Regra D014)', () => {
    const invalid = examConfigSchema.safeParse({
      ...DEFAULT_EXAM_CONFIG,
      uf: 'BR',
    });
    expect(invalid.success).toBe(false);
  });

  // Requisito Obrigatório 2: O gerador não inicia uma prova de 30 questões quando existem somente 20 aprovadas
  it('lança InsufficientApprovedQuestionsError quando existem somente 20 questões aprovadas no acervo', () => {
    // questionBank possui 20 aprovadas e 10 em_revisao
    expect(() =>
      generateSimuladoQuestions(questionBank, {
        totalQuestions: 30,
        uf: 'MG',
      })
    ).toThrow(InsufficientApprovedQuestionsError);

    try {
      generateSimuladoQuestions(questionBank, { totalQuestions: 30 });
    } catch (err) {
      expect(err).toBeInstanceOf(InsufficientApprovedQuestionsError);
      const domainErr = err as InsufficientApprovedQuestionsError;
      expect(domainErr.requiredCount).toBe(30);
      expect(domainErr.availableCount).toBe(20);
    }
  });

  // Requisito Obrigatório 3: Um conjunto com 29 aprovadas e outras questões pendentes também não inicia
  it('lança InsufficientApprovedQuestionsError em um conjunto com 29 aprovadas e outras questões pendentes', () => {
    const twentyNineApproved = createMockApprovedBank(29);
    // Adiciona questões em revisão, rascunho e suspensa para testar que não são usadas para completar
    const mixedBank = [
      ...twentyNineApproved,
      { ...twentyNineApproved[0], id: 'pending-1', status: 'em_revisao' as const },
      { ...twentyNineApproved[0], id: 'pending-2', status: 'rascunho' as const },
      { ...twentyNineApproved[0], id: 'pending-3', status: 'suspensa' as const },
    ];

    expect(() =>
      generateSimuladoQuestions(mixedBank, {
        totalQuestions: 30,
        uf: 'MG',
      })
    ).toThrow(InsufficientApprovedQuestionsError);
  });

  // Requisito Obrigatório 4: Um conjunto com 30 aprovadas gera exatamente 30 questões distintas
  it('gera exatamente 30 questões ordenadas de 1 a 30 com 100% de itens únicos quando existem 30 aprovadas', () => {
    const thirtyApproved = createMockApprovedBank(30);
    const items = generateSimuladoQuestions(thirtyApproved, {
      totalQuestions: 30,
      uf: 'MG',
      seed: 42,
    });

    expect(items).toHaveLength(30);
    expect(items[0].questionOrder).toBe(1);
    expect(items[29].questionOrder).toBe(30);

    const uniqueIds = new Set(items.map((i) => i.question.id));
    expect(uniqueIds.size).toBe(30);
  });

  // Requisito Obrigatório 5: Nenhuma questão em revisão chega ao simulado gerado
  it('garante que 100% das questões selecionadas possuem status "aprovada" e isExample === false', () => {
    const thirtyApproved = createMockApprovedBank(30);
    const bankWithPending = [
      ...thirtyApproved,
      { ...thirtyApproved[0], id: 'rev-01', status: 'em_revisao' as const },
      { ...thirtyApproved[0], id: 'rev-02', status: 'rascunho' as const },
    ];

    const items = generateSimuladoQuestions(bankWithPending, { totalQuestions: 30, seed: 10 });
    expect(items).toHaveLength(30);
    for (const item of items) {
      expect(item.question.status).toBe('aprovada');
      expect(item.question.isExample).toBe(false);
    }
  });

  it('produz a mesma sequência de questões quando a mesma semente (seed) é informada', () => {
    const thirtyApproved = createMockApprovedBank(30);
    const run1 = generateSimuladoQuestions(thirtyApproved, { totalQuestions: 30, seed: 12345 });
    const run2 = generateSimuladoQuestions(thirtyApproved, { totalQuestions: 30, seed: 12345 });

    expect(run1.map((i) => i.question.id)).toEqual(run2.map((i) => i.question.id));
  });

  it('atinge a meta pedagógica com exatamente 20 acertos (referência D007) e concede 100 XP', () => {
    const thirtyApproved = createMockApprovedBank(30);
    const items = generateSimuladoQuestions(thirtyApproved, { totalQuestions: 30, seed: 99 });

    const submission: SimuladoSubmissionPayload = {
      simuladoId: 'sim-test-pass',
      configId: DEFAULT_EXAM_CONFIG.id,
      startedAt: '2026-11-08T18:00:00.000Z',
      durationSeconds: 1850,
      timedOut: false,
      items: items.map((item, idx) => {
        const rightOpt = item.question.correctOptionId;
        const wrongOpt = rightOpt === 'a' ? 'b' : 'a';
        return {
          questionOrder: item.questionOrder,
          questionId: item.question.id,
          selectedOptionId: idx < 20 ? rightOpt : wrongOpt,
          isMarkedForReview: false,
        };
      }),
    };

    const result = evaluateSimuladoSubmission(submission, thirtyApproved, DEFAULT_EXAM_CONFIG);
    expect(result.score).toBe(20);
    expect(result.totalQuestions).toBe(30);
    expect(result.isApproved).toBe(true);
    expect(result.xpEarned).toBe(100);
    expect(result.accuracyPercent).toBe(67);
    expect(result.status).toBe('completed');
  });

  it('reprova o corte de referência com 19 acertos (abaixo de 20), contabiliza questões em branco e concede 30 XP', () => {
    const thirtyApproved = createMockApprovedBank(30);
    const items = generateSimuladoQuestions(thirtyApproved, { totalQuestions: 30, seed: 99 });

    const submission: SimuladoSubmissionPayload = {
      simuladoId: 'sim-test-fail',
      configId: DEFAULT_EXAM_CONFIG.id,
      startedAt: '2026-11-08T18:00:00.000Z',
      durationSeconds: 3600,
      timedOut: true,
      items: items.map((item, idx) => ({
        questionOrder: item.questionOrder,
        questionId: item.question.id,
        selectedOptionId: idx < 19 ? item.question.correctOptionId : null,
        isMarkedForReview: idx === 25,
      })),
    };

    const result = evaluateSimuladoSubmission(submission, thirtyApproved, DEFAULT_EXAM_CONFIG);
    expect(result.score).toBe(19);
    expect(result.answeredCount).toBe(19);
    expect(result.unansweredCount).toBe(11);
    expect(result.isApproved).toBe(false);
    expect(result.xpEarned).toBe(30);
    expect(result.status).toBe('timed_out');
  });

  it('formata corretamente o tempo em MM:SS e texto legível', () => {
    expect(formatDurationMmSs(3600)).toBe('60:00');
    expect(formatDurationMmSs(295)).toBe('04:55');
    expect(formatDurationMmSs(5)).toBe('00:05');
    expect(formatDurationHuman(2538)).toBe('42 min 18 seg');
    expect(formatDurationHuman(45)).toBe('45 seg');
  });
});
