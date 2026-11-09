'use client';

import React from 'react';
import Link from 'next/link';
import type { ReviewItem } from '../types/review';

interface ReviewQueueListProps {
  queue: ReviewItem[];
}

export function ReviewQueueList({ queue }: ReviewQueueListProps) {
  if (queue.length === 0) {
    return (
      <section aria-labelledby="queue-heading" className="card-premium p-6 sm:p-8 text-center space-y-3">
        <h2 id="queue-heading" className="text-base font-bold text-slate-900">
          📋 Fila de Repetição Espaçada
        </h2>
        <div className="py-6 space-y-2">
          <span className="text-3xl block">🎉</span>
          <p className="text-sm font-semibold text-slate-700">
            Nenhuma revisão pendente no momento!
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Todas as questões praticadas estão dentro do intervalo ideal de retenção ou você ainda não respondeu às sessões da Unidade 1.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors"
        >
          <span>Ir para a Trilha de Aprendizagem &rarr;</span>
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="queue-heading" className="card-premium p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 id="queue-heading" className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📋</span>
            <span>Fila de Questões Prioritárias</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ordenação determinística por urgência de retenção e histórico de erros.
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
          {queue.length} questão{queue.length > 1 ? 'ões' : ''}
        </span>
      </div>

      <div className="space-y-3" data-testid="review-queue-list">
        {queue.map((item, index) => {
          const { question, stats } = item;
          const isError = !stats.lastIsCorrect;

          return (
            <div
              key={question.id}
              data-testid={`queue-item-${question.id}`}
              className={`p-4 rounded-xl border transition-all ${
                isError
                  ? 'border-red-200 bg-red-50/40'
                  : stats.isOverdue
                  ? 'border-amber-200 bg-amber-50/30'
                  : 'border-slate-200 bg-white'
              } flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                    {question.id}
                  </span>
                  <span className="text-xs font-semibold text-blue-700">
                    {question.source.provision || question.subtopic}
                  </span>
                </div>

                <p className="text-xs md:text-sm text-slate-800 font-medium line-clamp-2">
                  {question.statement}
                </p>

                {/* Motivo Pedagógico Explicável */}
                <div className="flex items-center gap-1.5 text-xs font-semibold pt-1">
                  <span
                    className={
                      isError
                        ? 'text-red-700'
                        : stats.isOverdue
                        ? 'text-amber-700'
                        : 'text-slate-600'
                    }
                  >
                    • {stats.explanationReason}
                  </span>
                </div>
              </div>

              <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {stats.correctAttempts}/{stats.totalAttempts} acertos
                  </span>
                  <span className="block text-[11px]">
                    Intervalo: {stats.idealIntervalDays}d
                  </span>
                </div>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Prioridade: {Math.round(stats.priorityScore)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
