'use client';

import React from 'react';
import Link from 'next/link';

interface DailyReviewCardProps {
  queueCount: number;
  totalRecentErrors: number;
  totalOverdue: number;
  totalPracticedQuestions: number;
}

/**
 * Calcula o tempo estimado em minutos (~40 segundos por questão) de forma determinística.
 */
export function calculateEstimatedMinutes(questionCount: number): number {
  if (questionCount <= 0) return 0;
  return Math.max(1, Math.ceil((questionCount * 40) / 60));
}

export function DailyReviewCard({
  queueCount,
  totalRecentErrors,
  totalOverdue,
  totalPracticedQuestions,
}: DailyReviewCardProps) {
  const hasPendingQueue = queueCount > 0;
  const estimatedMinutes = calculateEstimatedMinutes(queueCount);

  return (
    <section
      aria-labelledby="daily-review-heading"
      data-testid="daily-review-card"
      className="card-premium p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold mb-1 border border-indigo-100">
            <span aria-hidden="true">🎯</span>
            <span>Repetição Espaçada (SRS)</span>
          </div>
          <h2
            id="daily-review-heading"
            className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
          >
            Sua revisão de hoje
          </h2>
        </div>

        <Link
          href="/revisao"
          className="text-xs font-bold text-blue-700 hover:text-blue-800 underline py-1 px-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Centro de Revisão
        </Link>
      </div>

      {hasPendingQueue ? (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span
                data-testid="srs-queue-count"
                className="text-sm sm:text-base font-extrabold text-slate-900"
              >
                {queueCount} {queueCount === 1 ? 'questão para revisar' : 'questões para revisar'}
              </span>
              <span
                data-testid="srs-estimated-time"
                className="text-xs font-bold px-2 py-0.5 rounded-md bg-white text-slate-800 border border-amber-200"
              >
                ⏱ Tempo estimado: {estimatedMinutes}{' '}
                {estimatedMinutes === 1 ? 'minuto' : 'minutos'}
              </span>
            </div>

            <p className="text-xs font-medium text-slate-700">
              Concentre-se nos assuntos que precisam de reforço para fixar a legislação antes da prova.
            </p>

            {(totalRecentErrors > 0 || totalOverdue > 0) && (
              <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-amber-900">
                {totalRecentErrors > 0 && (
                  <span>• {totalRecentErrors} com erro recente</span>
                )}
                {totalOverdue > 0 && (
                  <span>• {totalOverdue} no ciclo de revisão</span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/revisao/pratica"
              data-testid="start-daily-review-cta"
              className="w-full min-h-11 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              <span>Começar revisão &rarr;</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            data-testid="srs-empty-state"
            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left space-y-1.5"
          >
            <p className="text-sm font-bold text-slate-800">
              {totalPracticedQuestions > 0
                ? 'Revisões em dia!'
                : 'Algoritmo pronto para calibragem'}
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              {totalPracticedQuestions > 0
                ? 'Você não possui questões vencidas no momento. Continue avançando nas sessões ou consulte seu diagnóstico por artigo.'
                : 'Sua fila inteligente de revisão espaçada será ativada automaticamente conforme você responde às sessões da trilha.'}
            </p>
          </div>

          <Link
            href="/revisao"
            className="w-full min-h-11 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <span>Ver diagnóstico de domínio &rarr;</span>
          </Link>
        </div>
      )}
    </section>
  );
}
