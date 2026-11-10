'use client';

import React from 'react';
import Link from 'next/link';

interface ReviewSessionCtaProps {
  totalOverdue: number;
  totalRecentErrors: number;
  totalPracticedQuestions: number;
}

export function ReviewSessionCta({
  totalOverdue,
  totalRecentErrors,
  totalPracticedQuestions,
}: ReviewSessionCtaProps) {
  const hasUrgentReviews = totalRecentErrors > 0 || totalOverdue > 0;

  return (
    <section aria-labelledby="cta-heading" className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>⚡</span>
            <span>Treino Inteligente (SRS)</span>
          </div>
          <h2 id="cta-heading" className="text-lg md:text-xl font-bold tracking-tight">
            Sessão de Revisão Espaçada
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {hasUrgentReviews
              ? 'O algoritmo selecionou as questões com maior prioridade para reforçar sua retenção.'
              : totalPracticedQuestions > 0
              ? 'Parabéns! Seus tópicos estão em dia. Pratique 5 questões para manter a memória ativa.'
              : 'Inicie um treino rápido de 5 questões para começar a mapear seu domínio legal.'}
          </p>
        </div>
      </div>

      {/* Contadores resumidos de urgência */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-700 text-center">
          <span className="block text-xl font-extrabold text-slate-900 dark:text-slate-100">
            {totalRecentErrors}
          </span>
          <span className="text-[11px] font-medium text-blue-200">
            Erros Recentes
          </span>
        </div>

        <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs text-center">
          <span className="block text-xl font-extrabold text-white">
            {totalOverdue}
          </span>
          <span className="text-[11px] font-medium text-blue-200">
            Revisões Vencidas
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white/10 rounded-xl p-2.5 backdrop-blur-xs text-center">
          <span className="block text-xl font-extrabold text-white">
            {totalPracticedQuestions}/20
          </span>
          <span className="text-[11px] font-medium text-blue-200">
            Questões Mapeadas
          </span>
        </div>
      </div>

      {/* Botão de Ação Primária Mobile-First */}
      <div className="pt-2">
        <Link
          href="/revisao/pratica"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
        >
          <span>▶</span>
          <span>Iniciar Treino de Revisão (5 Questões)</span>
        </Link>
      </div>
    </section>
  );
}
