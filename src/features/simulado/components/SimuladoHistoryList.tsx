'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { SimuladoHistorySummary } from '../types/simulado';
import { getSimuladoHistoryFromSession } from '../utils/simuladoStorage';

interface SimuladoHistoryListProps {
  serverHistory?: SimuladoHistorySummary[];
}

export function SimuladoHistoryList({ serverHistory = [] }: SimuladoHistoryListProps) {
  const [history] = useState<SimuladoHistorySummary[]>(() => {
    const local = getSimuladoHistoryFromSession();
    const map = new Map<string, SimuladoHistorySummary>();
    for (const item of serverHistory) {
      map.set(item.id, item);
    }
    for (const item of local) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  });

  if (history.length === 0) {
    return (
      <div
        data-testid="empty-simulado-history"
        className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center space-y-3 shadow-xs"
      >
        <p className="text-sm font-bold text-slate-800">
          Você ainda não concluiu nenhum simulado prático.
        </p>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Realize sua primeira prova simulada com 30 questões para medir sua
          preparação conforme os padrões normativos do DETRAN-MG / SENATRAN.
        </p>
        <div className="pt-2">
          <Link
            href="/simulado/prova"
            className="inline-flex items-center justify-center min-h-11 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold"
          >
            Iniciar Primeiro Simulado →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((item) => {
        const formattedDate = new Date(item.startedAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div
            key={item.id}
            data-testid={`history-item-${item.id}`}
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                    item.isApproved
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {item.isApproved ? '✓ Aprovado' : '⚠ Não atingiu o corte'}
                </span>
                <span className="text-xs text-slate-500 font-medium">{formattedDate}</span>
                {item.xpEarned > 0 && (
                  <span className="text-xs font-bold text-blue-700">+{item.xpEarned} XP</span>
                )}
              </div>

              <p className="text-sm sm:text-base font-extrabold text-slate-900">
                Nota: {item.score} de {item.totalQuestions} ({item.accuracyPercent}%)
              </p>
              <p className="text-xs text-slate-600">
                Tempo gasto: {formatDurationHuman(item.durationSeconds)} • Corte regulamentar:{' '}
                {item.passingScore} acertos
              </p>
            </div>

            <div className="self-start sm:self-center">
              <Link
                href={`/simulado/resultado/${item.id}`}
                className="inline-flex items-center justify-center min-h-10 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
              >
                Ver Gabarito →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDurationHuman(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}
