'use client';

import React, { useState } from 'react';
import type { SimuladoEvaluatedItem, SimuladoResult } from '../types/simulado';

interface SimuladoReviewListProps {
  result?: SimuladoResult;
  items?: SimuladoEvaluatedItem[];
}

type FilterType = 'all' | 'errors' | 'correct';

export function SimuladoReviewList({ result, items: propItems }: SimuladoReviewListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const items = result ? result.evaluatedItems : (propItems ?? []);

  const errorItems = items.filter((i) => !i.isCorrect);
  const correctItems = items.filter((i) => i.isCorrect);

  const filteredItems =
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
            Gabarito Comentado da Plataforma
          </h2>
          <p className="text-xs text-slate-600">
            Confira questão por questão sua resposta, a alternativa correta e a fundamentação legal.
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
                ? 'bg-white text-amber-950 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Erros ({errorItems.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('correct')}
            aria-pressed={filter === 'correct'}
            data-testid="filter-correct-btn"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              filter === 'correct'
                ? 'bg-white text-emerald-950 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Acertos ({correctItems.length})
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-600">
          Nenhuma questão nesta categoria de filtro.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const question = item.question;
            const selectedOption = question.options.find(
              (o) => o.id === item.selectedOptionId
            );
            const correctOption = question.options.find(
              (o) => o.id === item.correctOptionId
            );

            return (
              <article
                key={item.questionOrder}
                data-testid={`review-question-${item.questionOrder}`}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs space-y-3.5 ${
                  item.isCorrect
                    ? 'border-emerald-200/90'
                    : 'border-amber-300 bg-amber-50/20'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800">
                      Questão {item.questionOrder}
                    </span>
                    {question.subtopic && (
                      <span className="text-xs text-slate-500 font-medium">
                        {question.subtopic}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.isMarkedForReview && (
                      <span className="text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md font-bold">
                        🚩 Revisada
                      </span>
                    )}
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        item.isCorrect
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {item.isCorrect ? '✓ Acertou' : '✕ Errou'}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                  {question.statement}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                  <div
                    className={`p-3 rounded-xl border ${
                      item.isCorrect
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : item.selectedOptionId
                          ? 'bg-red-50/70 border-red-200 text-red-950'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
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
                      Resposta Correta (CTB / CONTRAN)
                    </span>
                    <p className="mt-1 font-semibold">
                      {correctOption
                        ? `${correctOption.id.toUpperCase()}) ${correctOption.text}`
                        : item.correctOptionId.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs sm:text-sm">
                  <div>
                    <strong className="font-extrabold text-slate-900 block mb-0.5">
                      Por que essa resposta está correta?
                    </strong>
                    <p className="text-slate-700 leading-relaxed">{item.explanation}</p>
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
                        Consultar legislação (Planalto / Portal Oficial) ↗
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
