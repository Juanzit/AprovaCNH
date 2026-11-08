import type { SimuladoHistorySummary, SimuladoResult } from '../types/simulado';

export const SIMULADO_RESULT_PREFIX = 'aprovacnh_simulado_result_';
export const SIMULADO_HISTORY_KEY = 'aprovacnh_simulado_history';
export const SIMULADO_ACTIVE_DRAFT_KEY = 'aprovacnh_simulado_active_draft';

/**
 * Salva o resultado completo do simulado no sessionStorage (para exibição imediata do gabarito)
 * e adiciona o resumo na lista de histórico do visitante/sessão.
 */
export function saveSimuladoResultToSession(result: SimuladoResult): void {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(
      `${SIMULADO_RESULT_PREFIX}${result.simuladoId}`,
      JSON.stringify(result)
    );

    const summary: SimuladoHistorySummary = {
      id: result.simuladoId,
      configId: result.config.id,
      startedAt: result.startedAt,
      finishedAt: result.finishedAt,
      durationSeconds: result.durationSeconds,
      totalQuestions: result.totalQuestions,
      score: result.score,
      passingScore: result.passingScore,
      accuracyPercent: result.accuracyPercent,
      isApproved: result.isApproved,
      status: result.status,
      xpEarned: result.xpEarned,
    };

    const existing = getLocalSimuladoHistory();
    const filtered = existing.filter((item) => item.id !== summary.id);
    const updated = [summary, ...filtered].slice(0, 25);

    window.sessionStorage.setItem(SIMULADO_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Ignora falha de quota em modo privado
  }
}

/**
 * Recupera um resultado detalhado de simulado salvo no sessionStorage pelo ID.
 */
export function getSimuladoResultFromSession(simuladoId: string): SimuladoResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(`${SIMULADO_RESULT_PREFIX}${simuladoId}`);
    if (!raw) return null;
    return JSON.parse(raw) as SimuladoResult;
  } catch {
    return null;
  }
}

/**
 * Recupera o histórico de simulados armazenado no sessionStorage.
 */
export function getLocalSimuladoHistory(): SimuladoHistorySummary[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.sessionStorage.getItem(SIMULADO_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SimuladoHistorySummary[]) : [];
  } catch {
    return [];
  }
}
