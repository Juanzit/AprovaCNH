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
    <section aria-labelledby="cta-heading" className="w-full bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-2xl p-5 md:p-6 shadow-md space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
            <span>⚡</span>
            <span>Treino Inteligente (SRS)</span>
          </div>
          <h2 id="cta-heading" className="text-lg md:text-xl font-bold tracking-tight">
            Sessão de Revisão Espaçada
          </h2>
          <p className="text-xs md:text-sm text-blue-100 mt-1">
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
        <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs text-center">
          <span className="block text-xl font-extrabold text-white">
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
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-blue-800"
        >
          <span>▶</span>
          <span>Iniciar Treino de Revisão (5 Questões)</span>
        </Link>
      </div>
    </section>
  );
}
