'use client';

import React, { useEffect, useRef, useState } from 'react';
import { formatDurationMmSs } from '../utils/simuladoGenerator';

interface SimuladoTimerProps {
  startedAt: string;
  durationMinutes: number;
  onTimeUp: () => void;
  isSubmitted?: boolean;
  initialRemainingSeconds?: number;
}

export function SimuladoTimer({
  startedAt,
  durationMinutes,
  onTimeUp,
  isSubmitted = false,
  initialRemainingSeconds,
}: SimuladoTimerProps) {
  const totalSeconds = durationMinutes * 60;
  const [currentNowMs, setCurrentNowMs] = useState<number>(() => Date.now());
  const hasTriggeredTimeUp = useRef(false);

  const startMs = new Date(startedAt).getTime();
  const remainingSeconds =
    initialRemainingSeconds !== undefined
      ? Math.max(0, initialRemainingSeconds)
      : Number.isNaN(startMs)
        ? totalSeconds
        : Math.max(0, totalSeconds - Math.floor((currentNowMs - startMs) / 1000));

  useEffect(() => {
    if (isSubmitted) return;

    const effectiveStartMs =
      initialRemainingSeconds !== undefined
        ? Date.now() - (totalSeconds - initialRemainingSeconds) * 1000
        : new Date(startedAt).getTime();

    const tick = () => {
      const now = Date.now();
      setCurrentNowMs(now);

      const elapsed = Math.floor((now - effectiveStartMs) / 1000);
      const nextRemaining = Math.max(0, totalSeconds - elapsed);

      if (nextRemaining <= 0 && !hasTriggeredTimeUp.current) {
        hasTriggeredTimeUp.current = true;
        onTimeUp();
      }
    };

    const intervalId = window.setInterval(tick, 1000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startedAt, totalSeconds, isSubmitted, initialRemainingSeconds, onTimeUp]);

  const isCritical = remainingSeconds <= 60;
  const isWarning = !isCritical && remainingSeconds <= 300;

  const badgeStyle = isCritical
    ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
    : isWarning
      ? 'bg-amber-50 text-amber-800 border-amber-300'
      : 'bg-slate-100 text-slate-800 border-slate-200';

  const milestoneAnnouncement = isCritical
    ? 'Atenção: resta menos de 1 minuto para o encerramento automático da prova.'
    : isWarning
      ? 'Aviso: restam menos de 5 minutos para concluir o simulado.'
      : '';

  return (
    <div className="inline-flex items-center gap-2">
      <div
        data-testid="simulado-timer"
        data-urgency={isCritical ? 'critical' : isWarning ? 'warning' : 'normal'}
        aria-label={`Tempo restante: ${formatDurationMmSs(remainingSeconds)}`}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-extrabold tabular-nums transition-colors ${badgeStyle}`}
      >
        <span aria-hidden="true">⏱</span>
        <span>{formatDurationMmSs(remainingSeconds)}</span>
      </div>

      {/* Região live debounced apenas para marcos críticos (evita spam a cada segundo em leitores de tela) */}
      <span aria-live="polite" className="sr-only">
        {milestoneAnnouncement}
      </span>
    </div>
  );
}
