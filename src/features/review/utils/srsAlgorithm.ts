import type { UserAnswerRecord, QuestionReviewStats } from '../types/review';

/**
 * Retorna o intervalo ideal de revisão em dias com base na sequência de acertos consecutivos.
 */
export function getIdealIntervalDays(consecutiveCorrect: number): number {
  if (consecutiveCorrect <= 0) return 0;
  if (consecutiveCorrect === 1) return 1;
  if (consecutiveCorrect === 2) return 3;
  if (consecutiveCorrect === 3) return 7;
  return 14;
}

/**
 * Calcula os acertos consecutivos a partir de um histórico de respostas ordenado cronologicamente.
 */
export function calculateConsecutiveCorrect(answersSortedAsc: UserAnswerRecord[]): number {
  if (answersSortedAsc.length === 0) return 0;

  let streak = 0;
  for (let i = answersSortedAsc.length - 1; i >= 0; i--) {
    if (answersSortedAsc[i].is_correct) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Gera estatísticas de repetição espaçada e pontuação de prioridade para uma questão.
 */
export function calculateQuestionReviewStats(
  questionId: string,
  answers: UserAnswerRecord[],
  referenceDate: Date = new Date()
): QuestionReviewStats | null {
  if (!answers || answers.length === 0) {
    return null;
  }

  // Ordena cronologicamente crescente
  const sorted = [...answers].sort(
    (a, b) => new Date(a.answered_at).getTime() - new Date(b.answered_at).getTime()
  );

  const totalAttempts = sorted.length;
  const correctAttempts = sorted.filter((a) => a.is_correct).length;
  const incorrectAttempts = totalAttempts - correctAttempts;
  const errorRate = totalAttempts > 0 ? incorrectAttempts / totalAttempts : 0;

  const lastAnswer = sorted[sorted.length - 1];
  const lastIsCorrect = lastAnswer.is_correct;
  const lastAnsweredAt = lastAnswer.answered_at;

  const consecutiveCorrect = calculateConsecutiveCorrect(sorted);
  const idealIntervalDays = getIdealIntervalDays(consecutiveCorrect);

  const lastDate = new Date(lastAnsweredAt);
  const diffMs = referenceDate.getTime() - lastDate.getTime();
  const daysSinceLastAnswer = Math.max(0, diffMs / (1000 * 60 * 60 * 24));

  const isOverdue = daysSinceLastAnswer >= idealIntervalDays;

  // 1. Peso do Status Imediato (W_status): 100 pontos se errou na última tentativa
  const wStatus = lastIsCorrect ? 0 : 100;

  // 2. Peso da Taxa Histórica de Erro (W_erro): até 40 pontos
  const wErro = 40 * errorRate;

  // 3. Peso do Atraso Temporal (W_atraso): até 30+ pontos se venceu o ciclo
  let wAtraso = 0;
  if (isOverdue) {
    wAtraso = 30 * (1 + (daysSinceLastAnswer - idealIntervalDays) / (idealIntervalDays + 1));
  }

  const priorityScore = Math.round((wStatus + wErro + wAtraso) * 100) / 100;

  // Motivo pedagógico transparente
  let explanationReason = 'Fixação periódica de conteúdo';
  if (!lastIsCorrect) {
    explanationReason = 'Você errou esta questão na última tentativa';
  } else if (isOverdue) {
    explanationReason = `Venceu o intervalo de revisão (${idealIntervalDays} dia${idealIntervalDays > 1 ? 's' : ''} sem praticar)`;
  } else if (incorrectAttempts >= 2) {
    explanationReason = 'Tópico com histórico de reincidência de erros';
  }

  return {
    questionId,
    totalAttempts,
    correctAttempts,
    incorrectAttempts,
    errorRate: Math.round(errorRate * 100) / 100,
    lastIsCorrect,
    lastAnsweredAt,
    consecutiveCorrect,
    priorityScore,
    idealIntervalDays,
    daysSinceLastAnswer: Math.round(daysSinceLastAnswer * 10) / 10,
    isOverdue,
    explanationReason,
  };
}

/**
 * Compara e ordena itens da fila de revisão segundo prioridade decrescente e critérios de desempate determinísticos.
 */
export function sortReviewQueue<T extends { stats: QuestionReviewStats }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // 1. Prioridade maior primeiro
    const diffPriority = b.stats.priorityScore - a.stats.priorityScore;
    if (Math.abs(diffPriority) > 0.001) {
      return diffPriority;
    }

    // 2. Desempate: estudado há mais tempo (data mais antiga primeiro)
    const timeA = new Date(a.stats.lastAnsweredAt).getTime();
    const timeB = new Date(b.stats.lastAnsweredAt).getTime();
    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // 3. Desempate final: ordem alfabética do ID da questão
    return a.stats.questionId.localeCompare(b.stats.questionId);
  });
}
