'use client';

import React, { useState } from 'react';
import type { StudentProfile } from '../types/progress';
import { ProfileModal } from './ProfileModal';

interface StudentHeaderProps {
  initialProfile: StudentProfile;
}

const WEEK_DAYS = [
  { short: 'S', label: 'Segunda-feira' },
  { short: 'T', label: 'Terça-feira' },
  { short: 'Q', label: 'Quarta-feira' },
  { short: 'Q', label: 'Quinta-feira' },
  { short: 'S', label: 'Sexta-feira' },
  { short: 'S', label: 'Sábado' },
  { short: 'D', label: 'Domingo' },
];

export function StudentHeader({ initialProfile }: StudentHeaderProps) {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initial = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'E';
  const activeDaysCount = Math.min(7, Math.max(0, profile.currentStreak));
  const dailyGoalCompleted = profile.currentStreak > 0;

  const handleProfileUpdated = (updated: Partial<StudentProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  return (
    <>
      <section
        aria-label="Resumo do Estudante"
        className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
      >
        {/* Linha 1: Identificação Compacta do Aluno + Badges de UF/Categoria + Botão Editar */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs"
              aria-hidden="true"
            >
              {initial}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                  {profile.fullName || 'Estudante'}
                </h1>

                <span
                  data-testid="student-uf-badge"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200"
                >
                  <span aria-hidden="true">📍</span>
                  <span>{profile.uf ? `DETRAN/${profile.uf}` : 'Nacional'}</span>
                </span>

                <span
                  data-testid="student-category-badge"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200"
                >
                  <span>Cat. {profile.targetCategory || 'B'}</span>
                </span>
              </div>

              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {profile.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label="Editar dados do perfil"
            className="shrink-0 min-h-9 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs text-blue-700 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Editar
          </button>
        </div>

        {/* Linha 2: Ofensiva Semanal (S T Q Q S S D), Meta Diária e Saldo de XP */}
        <div className="pt-2.5 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div
              data-testid="weekly-streak-tracker"
              aria-label={`Hábito semanal: ${activeDaysCount} de 7 dias ativos`}
              className="flex items-center gap-1"
            >
              {WEEK_DAYS.map((day, idx) => {
                const isDayActive = idx < activeDaysCount;
                return (
                  <span
                    key={`${day.label}-${idx}`}
                    title={`${day.label}: ${isDayActive ? 'Concluído' : 'Pendente'}`}
                    className={`w-6 h-6 rounded-full text-[10px] font-extrabold flex items-center justify-center border transition-colors ${
                      isDayActive
                        ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {day.short}
                  </span>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div
                data-testid="student-streak-badge"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200"
              >
                <span aria-hidden="true">🔥</span>
                <span>
                  {profile.currentStreak} {profile.currentStreak === 1 ? 'dia' : 'dias'}
                </span>
              </div>

              <div
                data-testid="student-xp-badge"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-900 text-xs font-extrabold border border-blue-200"
              >
                <span aria-hidden="true">⭐</span>
                <span>{profile.xpTotal} XP</span>
              </div>
            </div>
          </div>

          {/* Indicador de Meta Diária */}
          <div
            data-testid="daily-goal-indicator"
            className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5"
          >
            <span className="font-semibold text-slate-700">
              Meta diária: 1 sessão (~3 min)
            </span>
            <span
              className={`font-bold ${
                dailyGoalCompleted ? 'text-emerald-700' : 'text-blue-700'
              }`}
            >
              {dailyGoalCompleted ? '✓ Meta ativa' : 'Em aberto hoje'}
            </span>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <ProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </>
  );
}
