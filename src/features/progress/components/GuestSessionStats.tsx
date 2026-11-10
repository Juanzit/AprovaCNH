'use client';

import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { TargetIcon, BookOpenIcon } from '@/components/ui/Icons';
import { GUEST_PROGRESS_EVENT, readGuestProgress } from '../utils/guestProgress';

interface GuestSessionStatsProps {
  initialCompletedSessions: number;
  initialCorrectAnswers: number;
}

export function GuestSessionStats({
  initialCompletedSessions,
  initialCorrectAnswers,
}: GuestSessionStatsProps) {
  const [progress, setProgress] = useState(() => ({
    completedSessionIds: [] as number[],
    sessionScores: {} as Record<string, number>,
  }));

  useEffect(() => {
    const sync = () => {
      const saved = readGuestProgress();
      setProgress({
        completedSessionIds: saved.completedSessionIds,
        sessionScores: saved.sessionScores,
      });
    };
    sync();
    window.addEventListener(GUEST_PROGRESS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(GUEST_PROGRESS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const completedSessions = progress.completedSessionIds.length > 0
    ? progress.completedSessionIds.length
    : initialCompletedSessions;
  const correctAnswers = progress.completedSessionIds.length > 0
    ? progress.completedSessionIds.reduce((sum, id) => sum + (progress.sessionScores[String(id)] ?? 0), 0)
    : initialCorrectAnswers;
  const totalQuestions = completedSessions * 5;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <>
      <StatCard
        label="Taxa de Acerto"
        value={`${accuracy}%`}
        sublabel={totalQuestions > 0 ? 'Meta de estudo: 70%' : 'Inicie uma sessão'}
        icon={<TargetIcon className="w-5 h-5" />}
        iconBgColor="bg-emerald-50 text-emerald-600"
        trend={{
          text: totalQuestions === 0 ? 'Sem dados' : accuracy >= 70 ? '✓ No padrão' : 'Abaixo do corte',
          isPositive: totalQuestions > 0 && accuracy >= 70,
        }}
      />
      <StatCard
        label="Questões Estudadas"
        value={`${totalQuestions}/20`}
        sublabel="Unidade 1 • Sinalização"
        icon={<BookOpenIcon className="w-5 h-5" />}
        iconBgColor="bg-blue-50 text-blue-600"
        trend={{
          text: `${completedSessions} de 4 sessões`,
          isPositive: true,
        }}
      />
    </>
  );
}
