'use client';

import React, { useState } from 'react';
import type { SimuladoEvaluatedItem } from '../types/simulado';

interface SimuladoReviewListProps {
  items: SimuladoEvaluatedItem[];
}

type FilterMode = 'all' | 'errors' | 'correct';

export function SimuladoReviewList({ items }: SimuladoReviewListProps) {
  const [filter, setFilter] = useState<FilterMode>('all');

  const errorItems = items.filter((item) => !item.isCorrect);
  const correctItems = items.filter((item) => item.isCorrect);

  const visibleItems =
    filter === 'errors'
      ? errorItems
      : filter === 'correct'
        ? correctItems
        : items;

  return (
    <section aria-labelledby="gabarito-heading" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div>
          <h2 id="gabarito-heading" className="text-base sm:text-lg font-extrabold text-slate-900">
            Gabarito Oficial Comentado
          </h2>
          <p className="text-xs text-slate-600">
            Confira questão por questão sua resposta, a alternativa correta e a explicação didática.
          </p>
        </div>

        <div
          role="group"
          aria-label="Filtrar questões do gabarito"
          className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto"
        >
          <button
            type="button"
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
            data-testid="filter-all-btn"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('errors')}
            aria-pressed={filter === 'errors'}
            data-testid="filter-errors-btn"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              filter === 'errors'
                ? 'bg-white text-red-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Apenas Erros ({errorItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('correct')}
            aria-pressed={filter === 'correct'}
            data-testid="filter-correct-btn"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              filter === 'correct'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Apenas Acertos ({correctItems.length})
          </button>
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-600">
          Nenhuma questão encontrada para o filtro selecionado.
        </div>
      ) : (
        <div className="space-y-4">
          {visibleItems.map((item) => {
            const { question, questionOrder, selectedOptionId, isCorrect } = item;
            const selectedOption = question.options.find((o) => o.id === selectedOptionId);
            const correctOption = question.options.find((o) => o.id === question.correctOptionId);

            return (
              <article
                key={questionOrder}
                data-testid={`review-question-${questionOrder}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900">
                      Questão {questionOrder}
                    </span>
                    {question.subtopic && (
                      <span className="text-xs text-slate-500">• {question.subtopic}</span>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-900'
                        : selectedOptionId === null
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-red-100 text-red-900'
                    }`}
                  >
                    {isCorrect
                      ? '✓ Acertou'
                      : selectedOptionId === null
                        ? '⚪ Deixada em branco'
                        : '✕ Errou'}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                  {question.statement}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                  <div
                    className={`p-3 rounded-xl border ${
                      isCorrect
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-red-50/70 border-red-200 text-red-950'
                    }`}
                  >
                    <span className="block text-[11px] font-bold uppercase tracking-wider opacity-80">
                      Sua resposta
                    </span>
                    <p className="mt-1 font-semibold">
                      {selectedOption
                        ? `${selectedOption.id.toUpperCase()}) ${selectedOption.text}`
                        : 'Não respondida (em branco)'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border bg-emerald-50/70 border-emerald-200 text-emerald-950">
                    <span className="block text-[11px] font-bold uppercase tracking-wider opacity-80">
                      Gabarito oficial
                    </span>
                    <p className="mt-1 font-semibold">
                      {correctOption
                        ? `${correctOption.id.toUpperCase()}) ${correctOption.text}`
                        : question.correctOptionId.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs sm:text-sm">
                  <div>
                    <strong className="font-extrabold text-slate-900 block mb-0.5">
                      Por que essa resposta está correta?
                    </strong>
                    <p className="text-slate-700 leading-relaxed">{question.explanation}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <strong>Fundamentação legal:</strong>{' '}
                      {question.source.provision ?? question.source.document}
                    </span>
                    {question.source.url && (
                      <a
                        href={question.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-700 hover:underline"
                      >
                        Consultar norma oficial ↗
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
