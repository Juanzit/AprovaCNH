import { describe, it, expect } from 'vitest';
import {
  calculateDailyStreak,
  getBrasiliaDateString,
} from '@/features/progress/utils/streakCalculator';

describe('streakCalculator (Regra Temporal America/Sao_Paulo)', () => {
  it('converte corretamente para data civil no fuso de Brasília', () => {
    // 2026-11-08 às 02:00:00Z em UTC equivale a 2026-11-07 às 23:00:00 em Brasília (UTC-3)
    const lateUtcDate = new Date('2026-11-08T02:00:00Z');
    expect(getBrasiliaDateString(lateUtcDate)).toBe('2026-11-07');

    // 2026-11-08 às 03:00:00Z em UTC equivale a 2026-11-08 às 00:00:00 em Brasília (UTC-3)
    const exactMidnightDate = new Date('2026-11-08T03:00:00Z');
    expect(getBrasiliaDateString(exactMidnightDate)).toBe('2026-11-08');
  });

  it('inicia o streak em 1 na primeira atividade registrada', () => {
    const refDate = new Date('2026-11-08T15:00:00Z');
    const result = calculateDailyStreak(0, 0, null, refDate);

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.lastActivityDate).toBe('2026-11-08');
    expect(result.isStreakIncremented).toBe(true);
    expect(result.isNewStreak).toBe(true);
  });

  it('mantém o streak inalterado caso a atividade ocorra no mesmo dia civil em Brasília', () => {
    const refDate = new Date('2026-11-08T20:00:00Z');
    const result = calculateDailyStreak(3, 5, '2026-11-08', refDate);

    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(5);
    expect(result.lastActivityDate).toBe('2026-11-08');
    expect(result.isStreakIncremented).toBe(false);
    expect(result.isNewStreak).toBe(false);
  });

  it('incrementa o streak quando a atividade ocorre no dia imediatamente posterior (ontem)', () => {
    const refDate = new Date('2026-11-09T14:00:00Z');
    const result = calculateDailyStreak(4, 5, '2026-11-08', refDate);

    expect(result.currentStreak).toBe(5);
    expect(result.longestStreak).toBe(5);
    expect(result.lastActivityDate).toBe('2026-11-09');
    expect(result.isStreakIncremented).toBe(true);
  });

  it('atualiza o longestStreak quando o streak atual superar o recorde anterior', () => {
    const refDate = new Date('2026-11-09T14:00:00Z');
    const result = calculateDailyStreak(5, 5, '2026-11-08', refDate);

    expect(result.currentStreak).toBe(6);
    expect(result.longestStreak).toBe(6);
    expect(result.isStreakIncremented).toBe(true);
  });

  it('reinicia o streak em 1 quando houver pulo de 1 ou mais dias, preservando o longestStreak', () => {
    const refDate = new Date('2026-11-12T14:00:00Z');
    const result = calculateDailyStreak(7, 10, '2026-11-08', refDate);

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(10);
    expect(result.lastActivityDate).toBe('2026-11-12');
    expect(result.isStreakIncremented).toBe(false);
    expect(result.isNewStreak).toBe(true);
  });

  it('computa corretamente a transição na virada de ano civil', () => {
    const newYearDate = new Date('2027-01-01T15:00:00Z');
    const result = calculateDailyStreak(10, 10, '2026-12-31', newYearDate);

    expect(result.currentStreak).toBe(11);
    expect(result.longestStreak).toBe(11);
    expect(result.lastActivityDate).toBe('2027-01-01');
    expect(result.isStreakIncremented).toBe(true);
  });
});
