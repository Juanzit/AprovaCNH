'use client';

import React, { useState } from 'react';
import type { StudentProfile } from '../types/progress';
import { ProfileModal } from './ProfileModal';

interface StudentHeaderProps {
  initialProfile: StudentProfile;
}

export function StudentHeader({ initialProfile }: StudentHeaderProps) {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initial = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'E';

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
        className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Identificação do Aluno */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs"
              aria-hidden="true"
            >
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {profile.fullName || 'Estudante'}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  aria-label="Editar dados do perfil"
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1"
                >
                  Editar
                </button>
              </div>
              <p className="text-xs text-slate-500">{profile.email}</p>
            </div>
          </div>

          {/* Gamificação: Streak e XP */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* UF */}
            <div
              data-testid="student-uf-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60"
            >
              <span aria-hidden="true">📍</span>
              <span>{profile.uf ? `DETRAN/${profile.uf}` : 'Nacional'}</span>
            </div>

            {/* Categoria */}
            <div
              data-testid="student-category-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60"
            >
              <span aria-hidden="true">🚗</span>
              <span>Cat. {profile.targetCategory || 'B'}</span>
            </div>

            {/* Streak */}
            <div
              data-testid="student-streak-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200"
            >
              <span aria-hidden="true">🔥</span>
              <span>
                {profile.currentStreak} {profile.currentStreak === 1 ? 'dia' : 'dias'}
              </span>
            </div>

            {/* Total XP */}
            <div
              data-testid="student-xp-badge"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-extrabold border border-blue-200"
            >
              <span aria-hidden="true">⭐</span>
              <span>{profile.xpTotal} XP</span>
            </div>
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
