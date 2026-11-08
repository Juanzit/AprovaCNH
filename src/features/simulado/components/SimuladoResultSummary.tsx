'use client';

import React from 'react';
import Link from 'next/link';
import type { SimuladoResult } from '../types/simulado';
import { formatDurationHuman } from '../utils/simuladoGenerator';

interface SimuladoResultSummaryProps {
  result: SimuladoResult;
}

export function SimuladoResultSummary({ result }: SimuladoResultSummaryProps) {
  const isApproved = result.isApproved;
  const timedOut = result.status === 'timed_out';

  return (
    <section
      aria-labelledby="simulado-result-heading"
      data-testid="simulado-result-summary"
      className={`rounded-2xl border-2 p-5 sm:p-7 shadow-xs space-y-5 ${
        isApproved
          ? 'bg-emerald-50/70 border-emerald-300 text-slate-900'
          : 'bg-amber-50/70 border-amber-300 text-slate-900'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              data-testid="simulado-approval-badge"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                isApproved
                  ? 'bg-emerald-700 text-white'
                  : 'bg-amber-800 text-white'
              }`}
            >
              <span>{isApproved ? '✓ APROVADO NO SIMULADO!' : '⚠ NÃO ATINGIU O CORTE'}</span>
            </span>

            <span
              data-testid="simulado-xp-badge"
              className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-extrabold"
            >
              +{result.xpEarned} XP
            </span>

            {timedOut && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                Tempo esgotado (60 min)
              </span>
            )}
          </div>

          <h1
            id="simulado-result-heading"
            className="text-xl sm:text-2xl font-extrabold text-slate-950"
          >
            {isApproved
              ? 'Parabéns! Você atingiu a pontuação de aprovação do DETRAN-MG'
              : 'Continue praticando para alcançar os 20 acertos obrigatórios'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
            {isApproved
              ? `Você acertou ${result.score} de ${result.totalQuestions} questões (${result.accuracyPercent}%), superando a nota mínima de corte de ${result.passingScore} acertos exigida pela Resolução CONTRAN nº 1.020/2025.`
              : `Você acertou ${result.score} de ${result.totalQuestions} questões (${result.accuracyPercent}%). A nota de corte oficial é de ${result.passingScore} acertos. Revise abaixo as questões erradas com as micro-aulas comentadas!`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pontuação Final
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
            Nota de Corte
          </span>
          <strong className="mt-1 block text-xl sm:text-2xl font-extrabold text-slate-900">
            {result.passingScore} acertos
          </strong>
          <span className="text-xs font-semibold text-slate-600">Mínimo exigido (D007)</span>
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
            Base Normativa
          </span>
          <strong className="mt-1 block text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
            Res. CONTRAN 1.020/2025
          </strong>
          <span className="text-xs font-semibold text-blue-700">
            {result.config.uf ?? 'MG'} • DETRAN-MG / SENATRAN
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <Link
          href="/simulado/prova"
          className="inline-flex items-center justify-center min-h-11 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors shadow-xs"
        >
          Refazer Simulado Oficial
        </Link>
        <Link
          href="/simulado/historico"
          className="inline-flex items-center justify-center min-h-11 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
        >
          Histórico de Simulados
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-11 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
        >
          Voltar ao Início
        </Link>
      </div>
    </section>
  );
}
