import { describe, it, expect } from 'vitest';
import rawBnq from '@/data/bnq-v1.0-clean.json';
import { questionBankSchema } from '@/features/lesson/schemas/questionSchema';
import {
  DEFAULT_EXAM_CONFIG,
  examConfigSchema,
  type SimuladoSubmissionPayload,
} from '@/features/simulado/types/simulado';
import {
  calculateProportionalTopicQuotas,
  evaluateSimuladoSubmission,
  formatDurationHuman,
  formatDurationMmSs,
  generateSimuladoQuestions,
  InsufficientApprovedQuestionsError,
} from '@/features/simulado/utils/simuladoGenerator';

describe('Simulado Multidisciplinar Proporcional — BNQ v1.0 (Fase 6.1)', () => {
  const questionBank = questionBankSchema.parse(rawBnq);

  it('valida a configuração padrão do exame (30 questões, 60 min, corte 20)', () => {
    const parsed = examConfigSchema.safeParse(DEFAULT_EXAM_CONFIG);
    expect(parsed.success).toBe(true);
    expect(DEFAULT_EXAM_CONFIG.totalQuestions).toBe(30);
    expect(DEFAULT_EXAM_CONFIG.durationMinutes).toBe(60);
    expect(DEFAULT_EXAM_CONFIG.passingScore).toBe(20);
    expect(DEFAULT_EXAM_CONFIG.uf).toBe('MG');
    expect(DEFAULT_EXAM_CONFIG.name).toContain('BNQ v1.0');
  });

  it('rejeita a sigla BR como UF na configuração do exame', () => {
    expect(examConfigSchema.safeParse({ ...DEFAULT_EXAM_CONFIG, uf: 'BR' }).success).toBe(false);
  });

  it('calcula quotas proporcionais pelo método dos maiores restos', () => {
    const quotas = calculateProportionalTopicQuotas({ A: 600, B: 400 }, 10);
    expect(Object.fromEntries(quotas)).toEqual({ A: 6, B: 4 });
    expect([...quotas.values()].reduce((sum, value) => sum + value, 0)).toBe(10);
  });

  it('gera 30 questões únicas, somente BNQ aprovadas, e respeita as quotas de cada disciplina', () => {
    const items = generateSimuladoQuestions(questionBank, {
      totalQuestions: 30,
      uf: 'MG',
      seed: 42,
    });

    expect(items).toHaveLength(30);
    expect(items[0].questionOrder).toBe(1);
    expect(items[29].questionOrder).toBe(30);
    expect(new Set(items.map((item) => item.question.id)).size).toBe(30);

    items.forEach(({ question }) => {
      expect(question.id).toMatch(/^bnq-p/);
      expect(question.status).toBe('aprovada');
      expect(question.isExample).toBe(false);
      expect(question.review?.approvalMethod).toBe('authorized_official_batch');
    });

    const allCounts = questionBank.reduce<Record<string, number>>((counts, question) => {
      counts[question.topic] = (counts[question.topic] ?? 0) + 1;
      return counts;
    }, {});
    const expected = calculateProportionalTopicQuotas(allCounts, 30);
    const actual = items.reduce<Record<string, number>>((counts, item) => {
      counts[item.question.topic] = (counts[item.question.topic] ?? 0) + 1;
      return counts;
    }, {});
    expect(actual).toEqual(Object.fromEntries(expected));
  });

  it('reproduz a mesma sequência com a mesma seed e varia a seleção com outra seed', () => {
    const run1 = generateSimuladoQuestions(questionBank, { totalQuestions: 30, seed: 12345 });
    const run2 = generateSimuladoQuestions(questionBank, { totalQuestions: 30, seed: 12345 });
    const run3 = generateSimuladoQuestions(questionBank, { totalQuestions: 30, seed: 12346 });
    expect(run1.map((item) => item.question.id)).toEqual(run2.map((item) => item.question.id));
    expect(run1.map((item) => item.question.id)).not.toEqual(run3.map((item) => item.question.id));
  });

  it('falha de forma segura se houver menos de 30 aprovadas, mesmo que existam questões em revisão', () => {
    const onlyTwentyNineApproved = [
      ...questionBank.slice(0, 29),
      { ...questionBank[29], status: 'em_revisao' as const },
    ];
    expect(() =>
      generateSimuladoQuestions(onlyTwentyNineApproved, { totalQuestions: 30, seed: 1 })
    ).toThrow(InsufficientApprovedQuestionsError);
  });

  it('atinge 20 acertos e concede 100 XP na meta pedagógica', () => {
    const items = generateSimuladoQuestions(questionBank, { totalQuestions: 30, seed: 99 });
    const submission: SimuladoSubmissionPayload = {
      simuladoId: 'sim-test-pass',
      configId: DEFAULT_EXAM_CONFIG.id,
      startedAt: '2026-11-09T18:00:00.000Z',
      durationSeconds: 1850,
      timedOut: false,
      items: items.map((item, index) => ({
        questionOrder: item.questionOrder,
        questionId: item.question.id,
        selectedOptionId:
          index < 20
            ? item.question.correctOptionId
            : item.question.correctOptionId === 'a'
              ? 'b'
              : 'a',
        isMarkedForReview: false,
      })),
    };
    const result = evaluateSimuladoSubmission(submission, questionBank, DEFAULT_EXAM_CONFIG);
    expect(result.score).toBe(20);
    expect(result.totalQuestions).toBe(30);
    expect(result.isApproved).toBe(true);
    expect(result.xpEarned).toBe(100);
    expect(result.accuracyPercent).toBe(67);
    expect(result.status).toBe('completed');
  });

  it('reprova com 19 acertos, contabiliza 11 em branco e concede 30 XP', () => {
    const items = generateSimuladoQuestions(questionBank, { totalQuestions: 30, seed: 99 });
    const submission: SimuladoSubmissionPayload = {
      simuladoId: 'sim-test-fail',
      configId: DEFAULT_EXAM_CONFIG.id,
      startedAt: '2026-11-09T18:00:00.000Z',
      durationSeconds: 3600,
      timedOut: true,
      items: items.map((item, index) => ({
        questionOrder: item.questionOrder,
        questionId: item.question.id,
        selectedOptionId: index < 19 ? item.question.correctOptionId : null,
        isMarkedForReview: index === 25,
      })),
    };
    const result = evaluateSimuladoSubmission(submission, questionBank, DEFAULT_EXAM_CONFIG);
    expect(result.score).toBe(19);
    expect(result.answeredCount).toBe(19);
    expect(result.unansweredCount).toBe(11);
    expect(result.isApproved).toBe(false);
    expect(result.xpEarned).toBe(30);
    expect(result.status).toBe('timed_out');
  });

  it('formata o tempo em MM:SS e texto legível', () => {
    expect(formatDurationMmSs(3600)).toBe('60:00');
    expect(formatDurationMmSs(295)).toBe('04:55');
    expect(formatDurationMmSs(5)).toBe('00:05');
    expect(formatDurationHuman(2538)).toBe('42 min 18 seg');
    expect(formatDurationHuman(45)).toBe('45 seg');
  });
});
