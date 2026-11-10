'use client';

import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { SparklesIcon } from '@/components/ui/Icons';
import { GUEST_PROGRESS_EVENT, GUEST_PROGRESS_STORAGE_KEY, readGuestProgress } from '../utils/guestProgress';

export function GuestXpStat({ initialXp }: { initialXp: number }) {
  const [xp, setXp] = useState(initialXp);

  useEffect(() => {
    const sync = () => {
      const hasStoredProgress = window.localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY) !== null;
      setXp(hasStoredProgress ? readGuestProgress().xpTotal : initialXp);
    };
    sync();
    window.addEventListener(GUEST_PROGRESS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(GUEST_PROGRESS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <StatCard
      label="Experiência (XP)"
      value={`${xp} XP`}
      sublabel="Pontuação acumulada"
      icon={<SparklesIcon className="w-5 h-5" />}
      iconBgColor="bg-purple-50 text-purple-600"
      trend={{ text: 'Nível 1 • Iniciante', isPositive: true }}
    />
  );
}
