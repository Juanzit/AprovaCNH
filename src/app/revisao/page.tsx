import React from 'react';
import Link from 'next/link';
import { getStudentProfile } from '@/features/progress/server/progressRepository';
import { getReviewDashboardData } from '@/features/review/server/reviewRepository';
import { StudentHeader } from '@/features/progress/components/StudentHeader';
import { ReviewSessionCta } from '@/features/review/components/ReviewSessionCta';
import { MasteryOverview } from '@/features/review/components/MasteryOverview';
import { ReviewQueueList } from '@/features/review/components/ReviewQueueList';

export default async function ReviewPage() {
  const profile = await getStudentProfile();
  const dashboard = await getReviewDashboardData();

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Barra de Navegação Superior */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors py-1.5 px-2 rounded-lg hover:bg-blue-50"
        >
          <span>&larr;</span>
          <span>Voltar à Trilha Principal</span>
        </Link>
        <span className="text-xs font-semibold text-slate-500">
          Centro de Revisão Espaçada
        </span>
      </div>

      {/* Cabeçalho do Estudante (Gamificação & Perfil) */}
      <StudentHeader initialProfile={profile} />

      {/* Cartão de Ação: Sessão de Treino SRS */}
      <ReviewSessionCta
        totalOverdue={dashboard.totalOverdue}
        totalRecentErrors={dashboard.totalRecentErrors}
        totalPracticedQuestions={dashboard.totalPracticedQuestions}
      />

      {/* Diagnóstico de Domínio por Dispositivo Legal */}
      <MasteryOverview subtopics={dashboard.subtopics} />

      {/* Fila Detalhada de Repetição Espaçada */}
      <ReviewQueueList queue={dashboard.queue} />
    </div>
  );
}
