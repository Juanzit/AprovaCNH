import type { UserAnswerRecord, MasteryStatus, SubtopicMastery } from '../types/review';

export interface SubtopicMetadata {
  sessionId: number;
  subtopic: string;
  legalProvision: string;
  questionIds: string[];
}

export const UNIT_1_SUBTOPICS: SubtopicMetadata[] = [
  {
    sessionId: 1,
    subtopic: 'Gestos do Agente, Sinais Sonoros e Hierarquia (Art. 89 e Art. 195)',
    legalProvision: 'CTB Art. 89 e Art. 195 • Anexo II CONTRAN',
    questionIds: ['sin-001', 'sin-002', 'sin-003', 'sin-004', 'sin-005'],
  },
  {
    sessionId: 2,
    subtopic: 'Sinalização de Manobras, Seta e Gestos de Braço (Art. 35 e Art. 196)',
    legalProvision: 'CTB Art. 35 e Art. 196 • Anexo II CONTRAN',
    questionIds: ['sin-006', 'sin-007', 'sin-008', 'sin-009', 'sin-010'],
  },
  {
    sessionId: 3,
    subtopic: 'Conversões, Preferência em Cruzamentos e Faixas (Art. 29, Art. 38 e Art. 196)',
    legalProvision: 'CTB Art. 29, Art. 38 e Art. 196 • Anexo II CONTRAN',
    questionIds: ['sin-011', 'sin-012', 'sin-013', 'sin-014', 'sin-015'],
  },
  {
    sessionId: 4,
    subtopic: 'Semáforo, Parada Obrigatória (R-1/R-2) e Pedestres (Art. 208 e Art. 214)',
    legalProvision: 'CTB Art. 44-A, Art. 70, Art. 208 e Art. 214 • Anexo II CONTRAN',
    questionIds: ['sin-016', 'sin-017', 'sin-018', 'sin-019', 'sin-020'],
  },
];

/**
 * Calcula a pontuação individual de domínio de uma questão (0 a 100).
 * Ponderação: 70% resultado recente + 30% histórico de acertos.
 */
export function calculateQuestionMastery(answers: UserAnswerRecord[]): number {
  if (!answers || answers.length === 0) {
    return 0;
  }

  const sorted = [...answers].sort(
    (a, b) => new Date(a.answered_at).getTime() - new Date(b.answered_at).getTime()
  );

  const totalAttempts = sorted.length;
  const correctAttempts = sorted.filter((a) => a.is_correct).length;
  const accuracyPercent = (correctAttempts / totalAttempts) * 100;

  const lastAttempt = sorted[sorted.length - 1];
  const lastScore = lastAttempt.is_correct ? 100 : 0;

  const score = 0.7 * lastScore + 0.3 * accuracyPercent;
  return Math.round(score);
}

/**
 * Retorna o status e rótulo semântico com base na pontuação de domínio e tentativas.
 */
export function getMasteryStatus(score: number, attemptedCount: number): {
  status: MasteryStatus;
  statusLabel: string;
} {
  if (attemptedCount === 0) {
    return { status: 'nao_praticado', statusLabel: 'Não praticado' };
  }
  if (score < 60) {
    return { status: 'critico', statusLabel: 'Crítico' };
  }
  if (score < 80) {
    return { status: 'em_progresso', statusLabel: 'Em Progresso' };
  }
  return { status: 'dominado', statusLabel: 'Dominado' };
}

/**
 * Calcula o domínio agregado de um subtema a partir das respostas do usuário e metadados.
 */
export function calculateSubtopicMastery(
  metadata: SubtopicMetadata,
  answersByQuestionId: Map<string, UserAnswerRecord[]>
): SubtopicMastery {
  const totalQuestions = metadata.questionIds.length;
  let sumScore = 0;
  let attemptedQuestions = 0;

  for (const qId of metadata.questionIds) {
    const answers = answersByQuestionId.get(qId) || [];
    if (answers.length > 0) {
      attemptedQuestions++;
      sumScore += calculateQuestionMastery(answers);
    }
  }

  const masteryScore = totalQuestions > 0 ? Math.round(sumScore / totalQuestions) : 0;
  const { status, statusLabel } = getMasteryStatus(masteryScore, attemptedQuestions);

  return {
    subtopic: metadata.subtopic,
    legalProvision: metadata.legalProvision,
    sessionId: metadata.sessionId,
    totalQuestions,
    attemptedQuestions,
    masteryScore,
    status,
    statusLabel,
  };
}

/**
 * Calcula o diagnóstico completo de todos os subtemas da Unidade 1.
 */
export function calculateAllSubtopicsMastery(
  answersByQuestionId: Map<string, UserAnswerRecord[]>
): SubtopicMastery[] {
  return UNIT_1_SUBTOPICS.map((meta) =>
    calculateSubtopicMastery(meta, answersByQuestionId)
  );
}
