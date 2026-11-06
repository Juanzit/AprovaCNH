export interface XpBreakdown {
  correctAnswersCount: number;
  totalAnswered: number;
  totalQuestions: number;
  pointsFromAnswers: number;
  completionBonus: number;
  totalXp: number;
}

export function calculateLessonXp(
  correctAnswersCount: number,
  totalAnswered: number,
  totalQuestions: number = 5
): XpBreakdown {
  const safeCorrect = Math.max(0, Math.min(correctAnswersCount, totalQuestions));
  const safeAnswered = Math.max(0, Math.min(totalAnswered, totalQuestions));

  const pointsFromAnswers = safeCorrect * 10;
  // Bônus condicionado exclusivamente ao término de todas as questões
  const completionBonus = safeAnswered === totalQuestions ? 20 : 0;
  const totalXp = pointsFromAnswers + completionBonus;

  return {
    correctAnswersCount: safeCorrect,
    totalAnswered: safeAnswered,
    totalQuestions,
    pointsFromAnswers,
    completionBonus,
    totalXp,
  };
}
