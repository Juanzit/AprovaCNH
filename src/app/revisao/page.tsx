import React from 'react';
import Link from 'next/link';
import { getStudentProfile } from '@/features/progress/server/progressRepository';
import { getReviewDashboardData } from '@/features/review/server/reviewRepository';
import { StudentHeader } from '@/features/progress/components/StudentHeader';
import { ReviewSessionCta } from '@/features/review/components/ReviewSessionCta';
import { MasteryOverview } from '@/features/review/components/MasteryOverview';
import { ReviewQueueList } from '@/features/review/components/ReviewQueueList';
import { Badge } from '@/components/ui/Badge';
import { RefreshCwIcon, ShieldCheckIcon } from '@/components/ui/Icons';

export default async function ReviewPage() {
  const [profile, dashboard] = await Promise.all([
    getStudentProfile(),
    getReviewDashboardData(),
  ]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Barra de Navegação e Contexto da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/90">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-2xs"
            title="Voltar à Trilha Principal"
            aria-label="Voltar para a Trilha de Aprendizagem"
          >
            &larr;
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="sm">
                <span className="flex items-center gap-1">
                  <RefreshCwIcon className="w-3 h-3" />
                  <span>SRS Algorítmico</span>
                </span>
              </Badge>
              <span className="text-xs font-bold text-slate-500">
                Curva de Ebbinghaus &amp; CTB
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Centro de Repetição Espaçada
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Prioridade por Histórico Real</span>
            </span>
          </Badge>
        </div>
      </div>

      {/* Grid com Destaque: Ação SRS + Perfil do Aluno */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Principal da Esquerda (8 Colunas): Sessão de Treino SRS & Diagnóstico de Domínio */}
        <div className="lg:col-span-8 space-y-6">
          <ReviewSessionCta
            totalOverdue={dashboard.totalOverdue}
            totalRecentErrors={dashboard.totalRecentErrors}
            totalPracticedQuestions={dashboard.totalPracticedQuestions}
          />

          <MasteryOverview subtopics={dashboard.subtopics} />

          <ReviewQueueList queue={dashboard.queue} />
        </div>

        {/* Coluna Lateral da Direita (4 Colunas): Perfil e Explicação Metodológica */}
        <div className="lg:col-span-4 space-y-5">
          <StudentHeader initialProfile={profile} />

          {/* Guia Pedagógico Rápido */}
          <div className="card-premium p-5 space-y-3 bg-gradient-to-br from-white to-slate-50/60 border border-slate-200/90 text-xs">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <span>🧠</span>
              <span>Como funciona a Repetição?</span>
            </h2>
            <p className="text-slate-600 leading-relaxed">
              O algoritmo do AprovaCNH agenda revisões com base no seu histórico: questões erradas recentemente voltam primeiro, enquanto normas consolidadas têm seus intervalos espaçados.
            </p>
            <div className="pt-2 border-t border-slate-200/70 space-y-1.5 text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span><strong>Crítico:</strong> Erro recente, revisão imediata.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span><strong>Em progresso:</strong> Praticado com 1 a 2 acertos.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>Dominado:</strong> 3+ acertos consecutivos.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
