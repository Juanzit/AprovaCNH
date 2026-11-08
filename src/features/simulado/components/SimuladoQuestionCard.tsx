'use client';

import React from 'react';
import type { OptionId, Question } from '@/features/lesson/types/question';

interface SimuladoQuestionCardProps {
  questionOrder: number;
  totalQuestions: number;
  question: Question;
  selectedOptionId: OptionId | null;
  isMarkedForReview: boolean;
  onSelectOption: (optionId: OptionId) => void;
  onToggleReviewFlag: () => void;
  disabled?: boolean;
}

export function SimuladoQuestionCard({
  questionOrder,
  totalQuestions,
  question,
  selectedOptionId,
  isMarkedForReview,
  onSelectOption,
  onToggleReviewFlag,
  disabled = false,
}: SimuladoQuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-extrabold border border-blue-200">
            Questão {questionOrder} de {totalQuestions}
          </span>
          {question.subtopic && (
            <span className="text-xs font-medium text-slate-600 truncate max-w-[200px] sm:max-w-xs">
              {question.subtopic}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleReviewFlag}
          aria-pressed={isMarkedForReview}
          disabled={disabled}
          data-testid="mark-review-btn"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            isMarkedForReview
              ? 'bg-amber-100 text-amber-950 border-amber-400'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span aria-hidden="true">🚩</span>
          <span>{isMarkedForReview ? 'Marcada para revisão' : 'Marcar para revisar'}</span>
        </button>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed mb-4">
          {question.statement}
        </legend>

        <div className="space-y-2.5">
          {question.options.map((opt) => {
            const inputId = `sim-q${questionOrder}-opt-${opt.id}`;
            const isSelected = selectedOptionId === opt.id;

            return (
              <div key={opt.id}>
                <label
                  htmlFor={inputId}
                  className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 text-slate-950 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                  } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name={`simulado-question-${questionOrder}`}
                    value={opt.id}
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => onSelectOption(opt.id)}
                    className="mt-1 h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-600 shrink-0"
                  />
                  <span className="text-sm sm:text-base leading-snug font-medium">
                    <strong className="font-extrabold uppercase mr-1.5 text-slate-900">
                      {opt.id})
                    </strong>
                    {opt.text}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
