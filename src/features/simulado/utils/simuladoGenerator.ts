import type { Question } from '@/features/lesson/types/question';
import type {
  ExamConfig,
  SimuladoEvaluatedItem,
  SimuladoQuestionItem,
  SimuladoResult,
  SimuladoSubmissionPayload,
} from '../types/simulado';

/**
 * Gerador pseudo-aleatório determinístico opcional (Mulberry32) para reprodutibilidade em testes.
 */
function createRng(seed?: number): () => number {
  if (seed === undefined) {
    return () => Math.random();
  }
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Embaralhamento Fisher-Yates imutável.
 */
export function shuffleArray<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Seleciona e ordena as questões oficiais para o Simulado Configurável (padrão: 30 questões).
 * Filtra por status 'aprovada', isExample === false e compatibilidade com a UF (ou nacional ufs=[]).
 * Se o banco possuir menos questões únicas que `totalQuestions` (ex.: 20 questões da Unidade 1 para 30 vagas),
 * inclui todas as questões únicas primeiro e complementa os slots restantes com amostragem embaralhada.
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
  const targetUf = options.uf?.trim().toUpperCase() || null;
  const rng = createRng(options.seed);

  const eligiblePool = questionBank.filter((q) => {
    if (q.status !== 'aprovada' || q.isExample) return false;
    if (!targetUf || q.ufs.length === 0) return true;
    return q.ufs.includes(targetUf);
  });

  const basePool = eligiblePool.length > 0 ? eligiblePool : [...questionBank];
  if (basePool.length === 0) {
    return [];
  }

  const selectedQuestions: Question[] = [];
  while (selectedQuestions.length < totalQuestions) {
    const shuffledPass = shuffleArray(basePool, rng);
    const remainingNeeded = totalQuestions - selectedQuestions.length;
    selectedQuestions.push(...shuffledPass.slice(0, remainingNeeded));
  }

  return selectedQuestions.slice(0, totalQuestions).map((question, idx) => ({
    questionOrder: idx + 1,
    question,
  }));
}

/**
 * Avalia de forma determinística e autoritativa uma submissão de simulado contra o gabarito oficial.
 */
export function evaluateSimuladoSubmission(
  payload: SimuladoSubmissionPayload,
  questionBank: readonly Question[],
  config: ExamConfig,
  finishedAtIso: string = new Date().toISOString()
): SimuladoResult {
  const questionMap = new Map<string, Question>();
  for (const q of questionBank) {
    questionMap.set(q.id, q);
  }

  const sortedItems = [...payload.items].sort((a, b) => a.questionOrder - b.questionOrder);

  let score = 0;
  let answeredCount = 0;
  const evaluatedItems: SimuladoEvaluatedItem[] = [];

  for (const item of sortedItems) {
    const question = questionMap.get(item.questionId);
    if (!question) {
      continue;
    }

    if (item.selectedOptionId !== null) {
      answeredCount++;
    }

    const isCorrect =
      item.selectedOptionId !== null && item.selectedOptionId === question.correctOptionId;

    if (isCorrect) {
      score++;
    }

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
  const xpEarned = isApproved ? 100 : 30;

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
    xpEarned,
    evaluatedItems,
  };
}

/**
 * Formata segundos em MM:SS (ex.: 3600 -> "60:00", 295 -> "04:55").
 */
export function formatDurationMmSs(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Formata segundos em descrição legível (ex.: 2538 -> "42 min 18 seg").
 */
export function formatDurationHuman(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  if (minutes === 0) {
    return `${seconds} seg`;
  }
  return `${minutes} min ${String(seconds).padStart(2, '0')} seg`;
}
