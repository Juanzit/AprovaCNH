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

describe('Simulado Configurável — Regras D007, Segurança Editorial e Validações P0', () => {
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

  // =========================================================================
  // BATERIA OBRIGATÓRIA P0 — OS 7 CENÁRIOS DO GERADOR DE SIMULADO
  // =========================================================================

  // Cenário 1: Pool com 30 ou mais questões aprovadas distintas
  it('Cenário 1: Pool com 30 ou mais questões aprovadas distintas gera exatamente 30 itens únicos ordenados de 1 a 30', () => {
    const thirtyApproved = createMockApprovedBank(35);
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
    for (const item of items) {
      expect(item.question.status).toBe('aprovada');
      expect(item.question.isExample).toBe(false);
    }
  });

  // Cenário 2: Pool com menos de 30 aprovadas
  it('Cenário 2: Pool com menos de 30 aprovadas lança InsufficientApprovedQuestionsError com as quantidades exatas', () => {
    const twentyApproved = createMockApprovedBank(20);
    expect(() =>
      generateSimuladoQuestions(twentyApproved, { totalQuestions: 30 })
    ).toThrow(InsufficientApprovedQuestionsError);

    try {
      generateSimuladoQuestions(twentyApproved, { totalQuestions: 30 });
    } catch (err) {
      expect(err).toBeInstanceOf(InsufficientApprovedQuestionsError);
      const domainErr = err as InsufficientApprovedQuestionsError;
      expect(domainErr.requiredCount).toBe(30);
      expect(domainErr.availableCount).toBe(20);
    }
  });

  // Cenário 3: Presença de questões pendentes
  it('Cenário 3: Presença de questões pendentes (em_revisao/rascunho) não é utilizada para completar o simulado', () => {
    const twentyNineApproved = createMockApprovedBank(29);
    const poolWithPending = [
      ...twentyNineApproved,
      { ...twentyNineApproved[0], id: 'pending-sin-1', status: 'em_revisao' as const },
      { ...twentyNineApproved[0], id: 'pending-sin-2', status: 'rascunho' as const },
    ];

    expect(poolWithPending).toHaveLength(31);
    // Mesmo tendo 31 itens brutos, apenas 29 são aprovadas -> deve recusar e lançar erro
    expect(() =>
      generateSimuladoQuestions(poolWithPending, { totalQuestions: 30 })
    ).toThrow(InsufficientApprovedQuestionsError);
  });

  // Cenário 4: Presença de questões suspensas ou rejeitadas
  it('Cenário 4: Presença de questões suspensas ou obsoletas é descartada pela filtragem de elegibilidade', () => {
    const twentyEightApproved = createMockApprovedBank(28);
    const poolWithSuspended = [
      ...twentyEightApproved,
      { ...twentyEightApproved[0], id: 'susp-1', status: 'suspensa' as const },
      { ...twentyEightApproved[0], id: 'obs-1', status: 'obsoleta' as const },
    ];

    expect(poolWithSuspended).toHaveLength(30);
    expect(() =>
      generateSimuladoQuestions(poolWithSuspended, { totalQuestions: 30 })
    ).toThrow(InsufficientApprovedQuestionsError);
  });

  // Cenário 5: Presença de exemplos
  it('Cenário 5: Questões marcadas como exemplo (isExample: true) são estritamente excluídas do pool', () => {
    const twentyNineApproved = createMockApprovedBank(29);
    const poolWithExample = [
      ...twentyNineApproved,
      { ...twentyNineApproved[0], id: 'example-1', status: 'aprovada' as const, isExample: true },
    ];

    expect(poolWithExample).toHaveLength(30);
    // A questão example-1 tem status 'aprovada', mas isExample: true -> deve ser rejeitada
    expect(() =>
      generateSimuladoQuestions(poolWithExample, { totalQuestions: 30 })
    ).toThrow(InsufficientApprovedQuestionsError);
  });

  // Cenário 6: IDs duplicados
  it('Cenário 6: IDs duplicados no pool de entrada são deduplicados sem duplicar questões na prova', () => {
    const thirtyApproved = createMockApprovedBank(30);
    // Duplica os 5 primeiros itens
    const poolWithDuplicates = [
      ...thirtyApproved,
      { ...thirtyApproved[0] },
      { ...thirtyApproved[1] },
      { ...thirtyApproved[2] },
      { ...thirtyApproved[3] },
      { ...thirtyApproved[4] },
    ];

    expect(poolWithDuplicates).toHaveLength(35);
    const items = generateSimuladoQuestions(poolWithDuplicates, { totalQuestions: 30, seed: 77 });
    expect(items).toHaveLength(30);

    const uniqueIds = new Set(items.map((i) => i.question.id));
    expect(uniqueIds.size).toBe(30);
  });

  // Cenário 7: Pool insuficiente depois da deduplicação
  it('Cenário 7: Pool com 35 itens brutos mas apenas 28 IDs distintos falha após a deduplicação', () => {
    const twentyEightApproved = createMockApprovedBank(28);
    // Adiciona 7 duplicatas de itens já existentes
    const poolWithRepeats = [
      ...twentyEightApproved,
      { ...twentyEightApproved[0] },
      { ...twentyEightApproved[1] },
      { ...twentyEightApproved[2] },
      { ...twentyEightApproved[3] },
      { ...twentyEightApproved[4] },
      { ...twentyEightApproved[5] },
      { ...twentyEightApproved[6] },
    ];

    expect(poolWithRepeats).toHaveLength(35);
    // Após deduplicação restam 28 questões distintas -> deve falhar
    expect(() =>
      generateSimuladoQuestions(poolWithRepeats, { totalQuestions: 30 })
    ).toThrow(InsufficientApprovedQuestionsError);

    try {
      generateSimuladoQuestions(poolWithRepeats, { totalQuestions: 30 });
    } catch (err) {
      const domainErr = err as InsufficientApprovedQuestionsError;
      expect(domainErr.availableCount).toBe(28);
      expect(domainErr.requiredCount).toBe(30);
    }
  });

  // =========================================================================
  // SUBMISSÃO, AVALIAÇÃO E FORMATADORES
  // =========================================================================

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
        const fullQ = thirtyApproved.find((q) => q.id === item.question.id)!;
        const rightOpt = fullQ.correctOptionId;
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
      items: items.map((item, idx) => {
        const fullQ = thirtyApproved.find((q) => q.id === item.question.id)!;
        return {
          questionOrder: item.questionOrder,
          questionId: item.question.id,
          selectedOptionId: idx < 19 ? fullQ.correctOptionId : null,
          isMarkedForReview: idx === 25,
        };
      }),
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
