import React from 'react';
import type { XpBreakdown } from '../utils/xpCalculator';
import type { SessionSubmissionResult } from '@/features/progress/types/progress';
import { AwardIcon } from '@/components/ui/Icons';
import Link from 'next/link';

interface LessonSummaryProps {
  xpBreakdown: XpBreakdown;
  serverResult?: SessionSubmissionResult | null;
  onRestart: () => void;
  sessionId?: number;
  isReviewMode?: boolean;
  backHref?: string;
  backLabel?: string;
  badgeText?: string;
}

export function LessonSummary({
  xpBreakdown,
  serverResult,
  onRestart,
  sessionId = 1,
  isReviewMode = false,
  backHref = '/',
  backLabel = 'Voltar à Trilha',
  badgeText,
}: LessonSummaryProps) {
  const { correctAnswersCount, totalQuestions, pointsFromAnswers, completionBonus, totalXp } =
    xpBreakdown;

  const isReview = serverResult && !serverResult.isFirstCompletion;
  const trackProgressPercent = Math.min(100, Math.max(25, sessionId * 25));
  const nextSessionId = sessionId < 4 ? sessionId + 1 : null;

  return (
    <div className="w-full max-w-md mx-auto text-center py-6 sm:py-8 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 mb-4 shadow-xs">
        <AwardIcon className="w-8 h-8" />
      </div>

      <h2 className="text-2xl font-extrabold text-slate-900 mb-1.5">Lição concluída!</h2>
      <p className="text-sm text-slate-700 mb-5">
        Você respondeu todas as {totalQuestions} questões de sinalização.
      </p>

      {/* Badge de Destaque de XP / Primeira Conclusão (D017) */}
      <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
        {badgeText && (
          <span
            data-testid="review-mode-badge"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-900 text-xs font-bold border border-indigo-200"
          >
            <span aria-hidden="true">⚡</span>
            <span>{badgeText}</span>
          </span>
        )}

        {isReview ? (
          <span
            data-testid="review-notice"
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300"
          >
            <span aria-hidden="true">🔄</span>
            <span>Revisão concluída — XP creditado na 1ª conclusão</span>
          </span>
        ) : (
          <span
            data-testid="first-completion-notice"
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-300 shadow-2xs"
          >
            <span aria-hidden="true">🎉</span>
            <span>+{serverResult ? serverResult.xpAwarded : totalXp} XP Conquistados</span>
          </span>
        )}

        {serverResult && serverResult.currentStreak > 0 && (
          <span
            data-testid="summary-streak-badge"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300"
          >
            <span aria-hidden="true">🔥</span>
            <span>
              {serverResult.currentStreak} {serverResult.currentStreak === 1 ? 'dia' : 'dias'} de ofensiva
            </span>
          </span>
        )}
      </div>

      {/* Avanço Percentual na Trilha de Sinalização */}
      {!isReviewMode && (
        <div
          data-testid="unit-progress-summary"
          className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 mb-5 text-left space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>Avanço na Unidade 1 (Sinalização)</span>
            <span className="text-blue-800 font-extrabold">{trackProgressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-700 rounded-full transition-all duration-500"
              style={{ width: `${trackProgressPercent}%` }}
              role="progressbar"
              aria-valuenow={trackProgressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Avanço na Unidade 1: ${trackProgressPercent}%`}
            />
          </div>
          <p className="text-[11px] font-medium text-slate-700">
            Sessão {sessionId} de 4 finalizada com sucesso.
          </p>
        </div>
      )}

      {/* Card de desempenho e XP */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6 text-left space-y-3.5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-700">Acertos</span>
          <span className="text-base font-extrabold text-slate-900" data-testid="score-text">
            {correctAnswersCount} de {totalQuestions}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-700">
            Pontos por acerto ({correctAnswersCount} × 10 XP)
          </span>
          <span className="font-bold text-slate-900">+{pointsFromAnswers} XP</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-700">Bônus de conclusão</span>
          <span className="font-bold text-emerald-700">+{completionBonus} XP</span>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
          <span className="font-bold text-slate-900">Total de XP</span>
          <span className="text-xl font-extrabold text-blue-700" data-testid="total-xp">
            {totalXp} XP
          </span>
        </div>
      </div>

      {/* Ações de Continuidade (Alvos de toque >= 44px) */}
      <div className="space-y-2.5">
        {!isReviewMode && nextSessionId && (
          <Link
            href={`/licao/sinalizacao?sessao=${nextSessionId}`}
            data-testid="next-session-cta"
            className="w-full min-h-11 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 font-bold text-white text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
          >
            <span>Avançar para Sessão {nextSessionId} &rarr;</span>
          </Link>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 min-h-11 py-3 px-4 rounded-xl border border-slate-300 font-bold text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
          >
            Repetir lição
          </button>
          <Link
            href={backHref}
            className="flex-1 min-h-11 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 font-bold text-white text-center flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
