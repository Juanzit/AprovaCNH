import type { Question } from '@/features/lesson/types/question';
import type {
  ExamConfig,
  SimuladoEvaluatedItem,
  SimuladoQuestionItem,
  SimuladoResult,
  SimuladoSubmissionPayload,
} from '../types/simulado';

/**
 * Erro de domínio: o simulado não inicia sem a quantidade solicitada
 * de questões aprovadas elegíveis. Questões em revisão nunca completam o pool.
 */
export class InsufficientApprovedQuestionsError extends Error {
  readonly available: number;
  readonly required: number;

  constructor(available: number, required: number) {
    super(
      `Acervo insuficiente: existem ${available} questões BNQ aprovadas elegíveis; são necessárias ${required}.`
    );
    this.name = 'InsufficientApprovedQuestionsError';
    this.available = available;
    this.required = required;
  }
}

/** Gerador pseudo-aleatório determinístico opcional (Mulberry32). */
function createRng(seed?: number): () => number {
  if (seed === undefined) return () => Math.random();
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Embaralhamento Fisher-Yates imutável. */
export function shuffleArray<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Distribui quotas pelo método dos maiores restos, proporcional ao tamanho
 * dos pools de cada disciplina. A regra é pedagógica do AprovaCNH e não
 * representa quotas oficiais de prova, que não foram publicadas pela SENATRAN.
 */
export function calculateProportionalTopicQuotas(
  topicCounts: ReadonlyMap<string, number> | Record<string, number>,
  totalQuestions: number
): Map<string, number> {
  if (!Number.isInteger(totalQuestions) || totalQuestions < 1) {
    throw new RangeError('totalQuestions deve ser um inteiro positivo.');
  }

  const entries =
    topicCounts instanceof Map ? [...topicCounts.entries()] : Object.entries(topicCounts);
  const positive = entries.filter(([, count]) => Number.isInteger(count) && count > 0);
  const available = positive.reduce((sum, [, count]) => sum + count, 0);

  if (available < totalQuestions) {
    throw new InsufficientApprovedQuestionsError(available, totalQuestions);
  }

  const allocations = positive.map(([topic, count]) => {
    const exact = (count / available) * totalQuestions;
    return { topic, base: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });

  let remaining = totalQuestions - allocations.reduce((sum, item) => sum + item.base, 0);
  allocations.sort(
    (a, b) => b.remainder - a.remainder || a.topic.localeCompare(b.topic, 'pt-BR')
  );

  for (let i = 0; i < allocations.length && remaining > 0; i++, remaining--) {
    allocations[i].base += 1;
  }

  return new Map(
    allocations
      .filter((item) => item.base > 0)
      .sort((a, b) => a.topic.localeCompare(b.topic, 'pt-BR'))
      .map((item) => [item.topic, item.base])
  );
}

/**
 * Simulado multidisciplinar do BNQ:
 * - aceita apenas questões aprovadas, não demonstrativas e identificadas como BNQ;
 * - respeita a UF (ufs=[] significa escopo nacional);
 * - distribui 30 questões proporcionalmente às disciplinas disponíveis;
 * - falha explicitamente se não houver acervo aprovado suficiente.
 */
export function generateSimuladoQuestions(
  questionBank: readonly Question[],
  options: {
    totalQuestions?: number;
    uf?: string | null;
    seed?: number;
  } = {}
): SimuladoQuestionItem[] {
  const totalQuestions = options.totalQuestions ?? 30;
  if (!Number.isInteger(totalQuestions) || totalQuestions < 1) {
    throw new RangeError('totalQuestions deve ser um inteiro positivo.');
  }

  const targetUf = options.uf?.trim().toUpperCase() || null;
  const eligiblePool = questionBank.filter((question) => {
    if (!question.id.startsWith('bnq-p')) return false;
    if (question.status !== 'aprovada' || question.isExample) return false;
    if (!targetUf || question.ufs.length === 0) return true;
    return question.ufs.some((uf) => uf.toUpperCase() === targetUf);
  });

  if (eligiblePool.length < totalQuestions) {
    throw new InsufficientApprovedQuestionsError(eligiblePool.length, totalQuestions);
  }

  const pools = new Map<string, Question[]>();
  for (const question of eligiblePool) {
    const pool = pools.get(question.topic) ?? [];
    pool.push(question);
    pools.set(question.topic, pool);
  }

  const quotas = calculateProportionalTopicQuotas(
    new Map([...pools.entries()].map(([topic, questions]) => [topic, questions.length])),
    totalQuestions
  );
  const rng = createRng(options.seed);
  const selected: Question[] = [];

  for (const [topic, quota] of quotas) {
    const topicPool = pools.get(topic) ?? [];
    if (topicPool.length < quota) {
      throw new InsufficientApprovedQuestionsError(eligiblePool.length, totalQuestions);
    }
    selected.push(...shuffleArray(topicPool, rng).slice(0, quota));
  }

  if (selected.length !== totalQuestions) {
    throw new Error(
      `Distribuição inválida: ${selected.length} de ${totalQuestions} questões foram selecionadas.`
    );
  }

  return shuffleArray(selected, rng).map((question, index) => ({
    questionOrder: index + 1,
    question,
  }));
}

/** Avalia a submissão apenas contra questões BNQ aprovadas. */
export function evaluateSimuladoSubmission(
  payload: SimuladoSubmissionPayload,
  questionBank: readonly Question[],
  config: ExamConfig,
  finishedAtIso: string = new Date().toISOString()
): SimuladoResult {
  const questionMap = new Map<string, Question>();
  for (const question of questionBank) {
    if (
      question.id.startsWith('bnq-p') &&
      question.status === 'aprovada' &&
      !question.isExample
    ) {
      questionMap.set(question.id, question);
    }
  }

  const sortedItems = [...payload.items].sort((a, b) => a.questionOrder - b.questionOrder);
  let score = 0;
  let answeredCount = 0;
  const evaluatedItems: SimuladoEvaluatedItem[] = [];

  for (const item of sortedItems) {
    const question = questionMap.get(item.questionId);
    if (!question) continue;

    if (item.selectedOptionId !== null) answeredCount++;
    const isCorrect =
      item.selectedOptionId !== null && item.selectedOptionId === question.correctOptionId;
    if (isCorrect) score++;

    evaluatedItems.push({
      questionOrder: item.questionOrder,
      question,
      selectedOptionId: item.selectedOptionId,
      isMarkedForReview: item.isMarkedForReview,
      isCorrect,
    });
  }

  const totalQuestions = evaluatedItems.length > 0 ? evaluatedItems.length : config.totalQuestions;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const accuracyPercent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isApproved = score >= config.passingScore;
  const status = payload.timedOut ? 'timed_out' : 'completed';

  return {
    simuladoId: payload.simuladoId,
    config,
    startedAt: payload.startedAt,
    finishedAt: finishedAtIso,
    durationSeconds: Math.max(0, Math.min(payload.durationSeconds, config.durationMinutes * 60)),
    totalQuestions,
    answeredCount,
    unansweredCount,
    score,
    passingScore: config.passingScore,
    accuracyPercent,
    isApproved,
    status,
    xpEarned: isApproved ? 100 : 30,
    evaluatedItems,
  };
}

/** Formata segundos em MM:SS. */
export function formatDurationMmSs(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Formata segundos em texto legível. */
export function formatDurationHuman(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  if (minutes === 0) return `${seconds} seg`;
  return `${minutes} min ${String(seconds).padStart(2, '0')} seg`;
}
