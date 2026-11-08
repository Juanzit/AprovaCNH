'use client';

import React from 'react';
import type { SimuladoAnswerState } from '../types/simulado';

interface SimuladoNavDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  currentOrder: number;
  answers: SimuladoAnswerState[];
  onSelectOrder: (order: number) => void;
}

export function SimuladoNavDrawer({
  isOpen,
  onToggle,
  currentOrder,
  answers,
  onSelectOrder,
}: SimuladoNavDrawerProps) {
  const answeredCount = answers.filter((a) => a.selectedOptionId !== null).length;
  const markedCount = answers.filter((a) => a.isMarkedForReview).length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls="simulado-nav-grid"
          data-testid="toggle-nav-drawer-btn"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
        >
          <span>Mapa da Prova ({answeredCount}/{answers.length})</span>
          {markedCount > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-extrabold">
              <span aria-hidden="true">🚩</span>
              {markedCount}
            </span>
          )}
          <span aria-hidden="true" className="text-slate-400">
            {isOpen ? '▲' : '▼'}
          </span>
        </button>
      </div>

      {isOpen && (
        <div
          id="simulado-nav-grid"
          data-testid="simulado-nav-drawer"
          className="mt-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 border-b border-slate-100 pb-2.5">
            <span className="font-bold text-slate-800">Navegação Rápida (1 a {answers.length})</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
                Respondida
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs border border-slate-300 bg-white inline-block" />
                Em branco
              </span>
              <span className="inline-flex items-center gap-1">
                <span aria-hidden="true">🚩</span>
                Revisar
              </span>
            </div>
          </div>

          <div
            role="group"
            aria-label="Questões do simulado"
            className="grid grid-cols-6 sm:grid-cols-10 gap-2"
          >
            {answers.map((item) => {
              const isCurrent = item.questionOrder === currentOrder;
              const isAnswered = item.selectedOptionId !== null;
              const isMarked = item.isMarkedForReview;

              let btnClasses =
                'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-slate-50';
              if (isAnswered) {
                btnClasses = 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700';
              }
              if (isMarked && !isAnswered) {
                btnClasses = 'bg-amber-50 text-amber-900 border-amber-400 hover:bg-amber-100';
              }

              const currentRing = isCurrent ? 'ring-2 ring-blue-500 ring-offset-1' : '';

              const statusDescription = [
                isAnswered ? `Respondida (${item.selectedOptionId?.toUpperCase()})` : 'Em branco',
                isMarked ? 'Marcada para revisão' : '',
                isCurrent ? 'Questão atual' : '',
              ]
                .filter(Boolean)
                .join(', ');

              return (
                <button
                  key={item.questionOrder}
                  type="button"
                  onClick={() => onSelectOrder(item.questionOrder)}
                  data-testid={`nav-question-${item.questionOrder}`}
                  aria-label={`Ir para questão ${item.questionOrder}: ${statusDescription}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`relative min-h-10 rounded-xl border text-xs font-extrabold flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 ${btnClasses} ${currentRing}`}
                >
                  <span>{item.questionOrder}</span>
                  {isMarked && (
                    <span
                      aria-hidden="true"
                      data-testid={`nav-flag-${item.questionOrder}`}
                      className="absolute -top-1.5 -right-1 text-[10px]"
                    >
                      🚩
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
