import { describe, it, expect } from 'vitest';
import rawQuestions from '@/data/questions-sinalizacao.json';
import { questionBankSchema } from '@/features/lesson/schemas/questionSchema';
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
} from '@/features/simulado/utils/simuladoGenerator';

describe('Simulado Configurável — Regras D007, Seleção de 30 Questões e Avaliação', () => {
  const questionBank = questionBankSchema.parse(rawQuestions);

  it('valida a configuração oficial padrão (30 questões, 60 min, corte 20 — Res. CONTRAN 1.020/2025)', () => {
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

  it('gera exatamente 30 questões ordenadas de 1 a 30 com 100% de questões únicas sem duplicação', () => {
    const items = generateSimuladoQuestions(questionBank, {
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

  it('produz a mesma sequência de questões quando a mesma semente (seed) é informada', () => {
    const run1 = generateSimuladoQuestions(questionBank, { totalQuestions: 30, seed: 12345 });
    const run2 = generateSimuladoQuestions(questionBank, { totalQuestions: 30, seed: 12345 });

    expect(run1.map((i) => i.question.id)).toEqual(run2.map((i) => i.question.id));
  });

  it('aprova o estudante com exatamente 20 acertos (nota de corte D007) e concede 100 XP', () => {
    const items = generateSimuladoQuestions(questionBank, { totalQuestions: 30, seed: 99 });

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

    const result = evaluateSimuladoSubmission(submission, questionBank, DEFAULT_EXAM_CONFIG);
    expect(result.score).toBe(20);
    expect(result.totalQuestions).toBe(30);
    expect(result.isApproved).toBe(true);
    expect(result.xpEarned).toBe(100);
    expect(result.accuracyPercent).toBe(67);
    expect(result.status).toBe('completed');
  });

  it('reprova o estudante com 19 acertos (abaixo do corte de 20), contabiliza questões em branco e concede 30 XP', () => {
    const items = generateSimuladoQuestions(questionBank, { totalQuestions: 30, seed: 99 });

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

    const result = evaluateSimuladoSubmission(submission, questionBank, DEFAULT_EXAM_CONFIG);
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
