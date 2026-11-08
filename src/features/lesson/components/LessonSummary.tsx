import React from 'react';
import type { XpBreakdown } from '../utils/xpCalculator';
import type { SessionSubmissionResult } from '@/features/progress/types/progress';
import { AwardIcon } from '@/components/ui/Icons';
import Link from 'next/link';

interface LessonSummaryProps {
  xpBreakdown: XpBreakdown;
  serverResult?: SessionSubmissionResult | null;
  onRestart: () => void;
}

export function LessonSummary({
  xpBreakdown,
  serverResult,
  onRestart,
}: LessonSummaryProps) {
  const { correctAnswersCount, totalQuestions, pointsFromAnswers, completionBonus, totalXp } =
    xpBreakdown;

  const isReview = serverResult && !serverResult.isFirstCompletion;

  return (
    <div className="w-full max-w-md mx-auto text-center py-8 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-700 mb-6">
        <AwardIcon className="w-8 h-8" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">Lição concluída!</h2>
      <p className="text-slate-600 mb-6">
        Você respondeu todas as {totalQuestions} questões de sinalização.
      </p>

      {/* Badges de Gamificação do Servidor */}
      {serverResult && (
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {isReview ? (
            <span
              data-testid="review-notice"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200"
            >
              <span>🔄</span>
              <span>Revisão — XP concedido na 1ª conclusão</span>
            </span>
          ) : (
            <span
              data-testid="first-completion-notice"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
            >
              <span>🎉</span>
              <span>Primeira Conclusão (+{serverResult.xpAwarded} XP)</span>
            </span>
          )}

          {serverResult.currentStreak > 0 && (
            <span
              data-testid="summary-streak-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200"
            >
              <span>🔥</span>
              <span>
                {serverResult.currentStreak} {serverResult.currentStreak === 1 ? 'dia' : 'dias'} de ofensiva
              </span>
            </span>
          )}
        </div>
      )}

      {/* Card de desempenho e XP */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8 text-left space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-600">Acertos</span>
          <span className="text-base font-bold text-slate-900" data-testid="score-text">
            {correctAnswersCount} de {totalQuestions}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">
            Pontos por acerto ({correctAnswersCount} × 10 XP)
          </span>
          <span className="font-semibold text-slate-900">+{pointsFromAnswers} XP</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Bônus de conclusão</span>
          <span className="font-semibold text-emerald-700">+{completionBonus} XP</span>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
          <span className="font-bold text-slate-900">Total de XP</span>
          <span className="text-xl font-extrabold text-blue-600" data-testid="total-xp">
            {totalXp} XP
          </span>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
        >
          Repetir lição
        </button>
        <Link
          href="/"
          className="flex-1 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 font-semibold text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
        >
          Voltar à Trilha
        </Link>
      </div>
    </div>
  );
}
