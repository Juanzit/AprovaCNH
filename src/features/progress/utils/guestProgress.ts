export const GUEST_PROGRESS_STORAGE_KEY = 'aprovacnh_guest_progress';
export const GUEST_PROGRESS_EVENT = 'aprovacnh:guest-progress-updated';

export interface GuestProgress {
  xpTotal: number;
  completedSessionIds: number[];
  sessionXp: Record<string, number>;
  sessionScores: Record<string, number>;
}

const EMPTY: GuestProgress = {
  xpTotal: 0,
  completedSessionIds: [],
  sessionXp: {},
  sessionScores: {},
};

export function readGuestProgress(): GuestProgress {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY);
    if (!raw) return EMPTY;
    const data = JSON.parse(raw) as Partial<GuestProgress>;
    const ids = Array.isArray(data.completedSessionIds) ? data.completedSessionIds : [];
    return {
      xpTotal: Number.isFinite(data.xpTotal) ? Math.max(0, Number(data.xpTotal)) : 0,
      completedSessionIds: [...new Set(ids.filter((id): id is number => Number.isInteger(id) && id >= 1 && id <= 4))],
      sessionXp: data.sessionXp && typeof data.sessionXp === 'object' ? data.sessionXp : {},
      sessionScores: data.sessionScores && typeof data.sessionScores === 'object' ? data.sessionScores : {},
    };
  } catch {
    return EMPTY;
  }
}

export function completeGuestSession(sessionId: number, xpAwarded: number, correctAnswersCount: number) {
  const current = readGuestProgress();
  if (current.completedSessionIds.includes(sessionId)) {
    return { progress: current, xpAwarded: 0, firstCompletion: false };
  }

  const earned = Math.max(0, Math.floor(xpAwarded));
  const next: GuestProgress = {
    ...current,
    xpTotal: current.xpTotal + earned,
    completedSessionIds: [...current.completedSessionIds, sessionId].sort((a, b) => a - b),
    sessionXp: { ...current.sessionXp, [String(sessionId)]: earned },
    sessionScores: { ...current.sessionScores, [String(sessionId)]: Math.max(0, Math.min(5, correctAnswersCount)) },
  };

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(GUEST_PROGRESS_EVENT));
    } catch {
      // A sessão continua visível mesmo quando o armazenamento local está indisponível.
    }
  }

  return { progress: next, xpAwarded: earned, firstCompletion: true };
}
