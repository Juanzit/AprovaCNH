export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  isStreakIncremented: boolean;
  isNewStreak: boolean;
}

/**
 * Obtém a data civil corrente (YYYY-MM-DD) no fuso horário oficial de Brasília (America/Sao_Paulo).
 */
export function getBrasiliaDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Calcula determinísticamente a sequência diária de estudos (streak) com ancoragem
 * temporal no fuso horário America/Sao_Paulo.
 *
 * Regras:
 * 1. Primeira atividade da história: streak = 1.
 * 2. Atividade no mesmo dia: streak permanece inalterado.
 * 3. Atividade no dia civil imediatamente posterior (ontem): streak incrementado (+1).
 * 4. Atividade com pulo de 1 ou mais dias: streak reiniciado para 1.
 */
export function calculateDailyStreak(
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: string | null,
  referenceDateUtc: Date = new Date()
): StreakResult {
  const todayStr = getBrasiliaDateString(referenceDateUtc);

  // 1. Primeira atividade registrada do usuário
  if (!lastActivityDate) {
    const initialStreak = 1;
    return {
      currentStreak: initialStreak,
      longestStreak: Math.max(longestStreak, initialStreak),
      lastActivityDate: todayStr,
      isStreakIncremented: true,
      isNewStreak: true,
    };
  }

  // 2. Mesma data civil em Brasília (aluno já pontuou hoje)
  if (lastActivityDate === todayStr) {
    return {
      currentStreak,
      longestStreak,
      lastActivityDate: todayStr,
      isStreakIncremented: false,
      isNewStreak: false,
    };
  }

  // 3. Diferença em dias civis
  const todayMs = Date.parse(`${todayStr}T12:00:00Z`);
  const lastMs = Date.parse(`${lastActivityDate}T12:00:00Z`);
  const diffDays = Math.round((todayMs - lastMs) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Dia consecutivo: incrementa sequência
    const nextStreak = currentStreak + 1;
    return {
      currentStreak: nextStreak,
      longestStreak: Math.max(longestStreak, nextStreak),
      lastActivityDate: todayStr,
      isStreakIncremented: true,
      isNewStreak: false,
    };
  }

  // Sequência quebrada (pulou 1 ou mais dias)
  const resetStreak = 1;
  return {
    currentStreak: resetStreak,
    longestStreak: Math.max(longestStreak, resetStreak),
    lastActivityDate: todayStr,
    isStreakIncremented: false,
    isNewStreak: true,
  };
}
