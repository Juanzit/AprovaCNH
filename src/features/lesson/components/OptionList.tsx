import React from 'react';
import type { QuestionOption, OptionId } from '../types/question';
import { AlertCircleIcon, CheckIcon } from '@/components/ui/Icons';

interface OptionListProps {
  statement: string;
  options: [QuestionOption, QuestionOption, QuestionOption, QuestionOption];
  selectedOptionId: OptionId | null;
  correctOptionId: OptionId;
  isAnswerSubmitted: boolean;
  onSelectOption: (id: OptionId) => void;
  isExample?: boolean;
}

export function OptionList({
  statement,
  options,
  selectedOptionId,
  correctOptionId,
  isAnswerSubmitted,
  onSelectOption,
  isExample = false,
}: OptionListProps) {
  return (
    <fieldset className="w-full border-0 p-0 m-0">
      {/* Banner de conteúdo demonstrativo ou oficial aprovado */}
      {isExample ? (
        <div
          className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium"
          role="note"
        >
          <AlertCircleIcon className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Questão demonstrativa de interface — Não oficial</span>
        </div>
      ) : (
        <div
          className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium"
          role="note"
        >
          <CheckIcon className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Questão Oficial Aprovada — Legislação Vigente (MBFT)</span>
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
          let stateStyle = 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800';

          if (isAnswerSubmitted) {
            if (isCorrectOption) {
              stateStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium';
            } else if (isSelected && !isCorrectOption) {
              stateStyle = 'bg-red-50 border-red-500 text-red-950';
            } else {
              stateStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
            }
          } else if (isSelected) {
            stateStyle = 'bg-blue-50 border-blue-600 text-blue-950 shadow-sm';
          }

          return (
            <label
              key={option.id}
              htmlFor={`option-${option.id}`}
              className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all min-h-[56px] select-none ${stateStyle} ${
                isAnswerSubmitted ? 'cursor-default' : ''
              }`}
            >
              <input
                type="radio"
                id={`option-${option.id}`}
                name="lesson-options"
                value={option.id}
                checked={isSelected}
                disabled={isAnswerSubmitted}
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
