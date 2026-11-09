'use client';

import React from 'react';
import Link from 'next/link';
import type { SimuladoResult } from '../types/simulado';

interface SimuladoResultSummaryProps {
  result: SimuladoResult;
}

export function SimuladoResultSummary({ result }: SimuladoResultSummaryProps) {
  const isApproved = result.isApproved;

  return (
    <section
      aria-labelledby="simulado-result-heading"
      data-testid="simulado-result-summary"
      className={`rounded-2xl border p-5 sm:p-7 shadow-xs space-y-5 ${
        isApproved
          ? 'bg-emerald-50/70 border-emerald-200'
          : 'bg-amber-50/70 border-amber-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-slate-200/80">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              data-testid="simulado-approval-badge"
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                isApproved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {isApproved ? '✓ META DE ESTUDO ALCANÇADA' : '⚠ CONTINUE PRATICANDO'}
            </span>

            {result.status === 'timed_out' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-bold">
                Tempo esgotado
              </span>
            )}

            {result.xpEarned > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-extrabold">
                +{result.xpEarned} XP
              </span>
            )}
          </div>

          <h1
            id="simulado-result-heading"
            className="text-xl sm:text-2xl font-extrabold text-slate-950"
          >
            {isApproved
              ? 'Parabéns! Meta de estudo alcançada'
              : 'Continue praticando para alcançar a meta de estudo'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
            {isApproved
              ? `Você acertou ${result.score} de ${result.totalQuestions} questões (${result.accuracyPercent}%), superando a meta de referência de ${result.passingScore} acertos da plataforma AprovaCNH para este módulo temático. Ressalva: este resultado é um indicador pedagógico de treino e não representa aprovação no exame oficial do DETRAN.`
              : `Você acertou ${result.score} de ${result.totalQuestions} questões (${result.accuracyPercent}%). A meta de estudo de referência da plataforma é de ${result.passingScore} acertos para fixação do conteúdo. Revise abaixo as questões com as micro-aulas comentadas e fundamentação legal!`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pontuação no Treino
          </span>
          <strong
            data-testid="simulado-score-value"
            className="mt-1 block text-xl sm:text-2xl font-extrabold text-slate-900"
          >
            {result.score} / {result.totalQuestions}
          </strong>
          <span className="text-xs font-semibold text-slate-600">
            {result.accuracyPercent}% de aproveitamento
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Meta da Plataforma
          </span>
          <strong className="mt-1 block text-xl sm:text-2xl font-extrabold text-slate-900">
            {result.passingScore} acertos
          </strong>
          <span className="text-xs font-semibold text-slate-600">Referência pedagógica (D007)</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tempo Utilizado
          </span>
          <strong
            data-testid="simulado-duration-value"
            className="mt-1 block text-lg sm:text-xl font-extrabold text-slate-900"
          >
            {formatDurationHuman(result.durationSeconds)}
          </strong>
          <span className="text-xs font-semibold text-slate-600">
            Limite: {result.config.durationMinutes} min
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Módulo Temático
          </span>
          <strong className="mt-1 block text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
            Sinalização de Trânsito
          </strong>
          <span className="text-xs font-semibold text-blue-700">
            Ref.: Res. CONTRAN 1.020/2025
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <Link
          href="/simulado/prova"
          className="inline-flex items-center justify-center min-h-11 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors shadow-xs"
        >
          Refazer Simulado Temático
        </Link>
        <Link
          href="/simulado/historico"
          className="inline-flex items-center justify-center min-h-11 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
        >
          Histórico de Treinos
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-11 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
        >
          Voltar ao Início
        </Link>
      </div>

      <p className="text-[11px] text-slate-500 pt-1">
        Ressalva pedagógica: A plataforma AprovaCNH é uma ferramenta independente de estudo. O desempenho no simulado temático é uma referência de aprendizagem e não substitui nem garante aprovação no exame oficial do DETRAN/SENATRAN.
      </p>
    </section>
  );
}

function formatDurationHuman(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}
