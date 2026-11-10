import React from 'react';
import type { QuestionOption, OptionId } from '../types/question';
import { AlertCircleIcon, CheckIcon } from '@/components/ui/Icons';

interface OptionListProps {
  statement: string;
  options: [QuestionOption, QuestionOption, QuestionOption, QuestionOption];
  selectedOptionId: OptionId | null;
  correctOptionId?: OptionId | null;
  isAnswerSubmitted: boolean;
  onSelectOption: (id: OptionId) => void;
  isExample?: boolean;
  isVerifying?: boolean;
}

export function OptionList({
  statement,
  options,
  selectedOptionId,
  correctOptionId = null,
  isAnswerSubmitted,
  onSelectOption,
  isExample = false,
  isVerifying = false,
}: OptionListProps) {
  return (
    <fieldset className="w-full border-0 p-0 m-0">
      {/* Banner de conteúdo demonstrativo ou baseado no MBFT */}
      {isExample ? (
        <div
          className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium dark:bg-amber-500/15 dark:border-amber-700 dark:text-amber-100"
          role="note"
        >
          <AlertCircleIcon className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Questão demonstrativa de interface — Não oficial</span>
        </div>
      ) : (
        <div
          className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold dark:bg-emerald-500/15 dark:border-emerald-700 dark:text-emerald-100"
          role="note"
        >
          <CheckIcon className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Questão baseada no MBFT — Legislação Vigente</span>
        </div>
      )}

      {/* Enunciado semântico como legend do fieldset */}
      <legend className="text-lg md:text-xl font-semibold text-slate-900 leading-snug mb-6">
        {statement}
      </legend>

      {/* Lista de alternativas */}
      <div className="space-y-3" role="radiogroup" aria-label="Alternativas da questão">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrectOption = option.id === correctOptionId;

          // Classes dinâmicas baseadas no estado
          let stateStyle =
            'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-100';

          if (isAnswerSubmitted) {
            if (isCorrectOption) {
              stateStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium dark:bg-emerald-500/15 dark:border-emerald-500 dark:text-emerald-50';
            } else if (isSelected && !isCorrectOption) {
              stateStyle = 'bg-red-50 border-red-500 text-red-950 dark:bg-red-500/15 dark:border-red-500 dark:text-red-50';
            } else {
              stateStyle = 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300';
            }
          } else if (isSelected) {
            stateStyle = 'bg-blue-50 border-blue-600 text-blue-950 shadow-sm dark:bg-blue-600/25 dark:border-blue-500 dark:text-white';
          }

          return (
            <label
              key={option.id}
              htmlFor={`option-${option.id}`}
              className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all min-h-[56px] select-none ${stateStyle} ${
                isAnswerSubmitted || isVerifying ? 'cursor-default' : ''
              }`}
            >
              <input
                type="radio"
                id={`option-${option.id}`}
                name="lesson-options"
                value={option.id}
                checked={isSelected}
                disabled={isAnswerSubmitted || isVerifying}
                onChange={() => onSelectOption(option.id)}
                className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600 focus:ring-offset-2 shrink-0"
              />
              <div className="flex-1 text-sm md:text-base leading-relaxed">
                <span className="font-semibold uppercase mr-2 text-slate-500">
                  {option.id})
                </span>
                <span>{option.text}</span>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
