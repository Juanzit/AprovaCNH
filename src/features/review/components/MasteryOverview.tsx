'use client';

import React from 'react';
import type { SubtopicMastery } from '../types/review';

interface MasteryOverviewProps {
  subtopics: SubtopicMastery[];
}

export function MasteryOverview({ subtopics }: MasteryOverviewProps) {
  const getBadgeStyle = (status: SubtopicMastery['status']) => {
    switch (status) {
      case 'dominado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'em_progresso':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'critico':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'nao_praticado':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getProgressColor = (status: SubtopicMastery['status']) => {
    switch (status) {
      case 'dominado':
        return 'bg-emerald-500';
      case 'em_progresso':
        return 'bg-amber-500';
      case 'critico':
        return 'bg-red-500';
      case 'nao_praticado':
      default:
        return 'bg-slate-300';
    }
  };

  const getStatusIcon = (status: SubtopicMastery['status']) => {
    switch (status) {
      case 'dominado':
        return '✓';
      case 'em_progresso':
        return '⏱';
      case 'critico':
        return '⚠';
      case 'nao_praticado':
      default:
        return '○';
    }
  };

  return (
    <section aria-labelledby="mastery-heading" className="w-full bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 id="mastery-heading" className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>📊</span>
          <span>Diagnóstico de Domínio por Dispositivo Legal</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Índice ponderado de retenção baseado nas regras do Manual Brasileiro de Fiscalização de Trânsito (MBFT).
        </p>
      </div>

      <div className="space-y-4" data-testid="mastery-list">
        {subtopics.map((item) => (
          <div
            key={item.sessionId}
            data-testid={`subtopic-mastery-${item.sessionId}`}
            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2.5 transition-all hover:bg-slate-50"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
              <div>
                <span className="text-xs font-bold text-blue-700 block">
                  Sessão {item.sessionId} • {item.legalProvision}
                </span>
                <span className="text-sm font-semibold text-slate-900 block">
                  {item.subtopic}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  data-testid={`badge-status-${item.sessionId}`}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeStyle(
                    item.status
                  )}`}
                >
                  <span aria-hidden="true">{getStatusIcon(item.status)}</span>
                  <span>{item.statusLabel}</span>
                </span>
                <span className="text-xs font-bold text-slate-700 w-10 text-right">
                  {item.masteryScore}%
                </span>
              </div>
            </div>

            {/* Barra de progresso acessível */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(item.status)}`}
                style={{ width: `${item.masteryScore}%` }}
                role="progressbar"
                aria-valuenow={item.masteryScore}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Domínio em ${item.subtopic}: ${item.masteryScore}% (${item.statusLabel})`}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
              <span>
                {item.attemptedQuestions} de {item.totalQuestions} questões praticadas
              </span>
              <span>
                {item.status === 'dominado' && 'Excelente retenção'}
                {item.status === 'em_progresso' && 'Em consolidação'}
                {item.status === 'critico' && 'Revisão recomendada'}
                {item.status === 'nao_praticado' && 'Ainda não iniciado'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
