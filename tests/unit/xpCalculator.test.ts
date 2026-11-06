import { describe, it, expect } from 'vitest';
import { calculateLessonXp } from '@/features/lesson/utils/xpCalculator';

describe('calculateLessonXp', () => {
  it('deve conceder 70 XP para 5 acertos ao completar as 5 questões (50 XP + 20 XP bônus)', () => {
    const result = calculateLessonXp(5, 5, 5);
    expect(result.pointsFromAnswers).toBe(50);
    expect(result.completionBonus).toBe(20);
    expect(result.totalXp).toBe(70);
  });

  it('deve conceder 50 XP para 3 acertos ao responder todas as 5 questões (30 XP + 20 XP bônus)', () => {
    const result = calculateLessonXp(3, 5, 5);
    expect(result.pointsFromAnswers).toBe(30);
    expect(result.completionBonus).toBe(20);
    expect(result.totalXp).toBe(50);
  });

  it('deve conceder 20 XP para 0 acertos ao responder todas as 5 questões (0 XP + 20 XP bônus)', () => {
    const result = calculateLessonXp(0, 5, 5);
    expect(result.pointsFromAnswers).toBe(0);
    expect(result.completionBonus).toBe(20);
    expect(result.totalXp).toBe(20);
  });

  it('NÃO deve conceder o bônus de conclusão se nem todas as 5 questões foram respondidas', () => {
    const result = calculateLessonXp(3, 3, 5);
    expect(result.pointsFromAnswers).toBe(30);
    expect(result.completionBonus).toBe(0);
    expect(result.totalXp).toBe(30);
  });

  it('deve proteger contra valores fora dos limites matemáticos', () => {
    const clampedResult = calculateLessonXp(-1, 10, 5);
    expect(clampedResult.correctAnswersCount).toBe(0);
    expect(clampedResult.totalAnswered).toBe(5);
    expect(clampedResult.totalXp).toBe(20); // 0 + 20
  });
});
