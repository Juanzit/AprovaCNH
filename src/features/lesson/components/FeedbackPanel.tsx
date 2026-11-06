import React from 'react';
import type { QuestionSource } from '../types/question';
import { CheckIcon, XIcon, ArrowRightIcon, AlertCircleIcon } from '@/components/ui/Icons';

interface FeedbackPanelProps {
  isCorrect: boolean;
  explanation: string;
  source: QuestionSource;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function FeedbackPanel({
  isCorrect,
  explanation,
  source,
  onNext,
  isLastQuestion,
}: FeedbackPanelProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-6 p-5 rounded-2xl border ${
        isCorrect
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : 'bg-red-50 border-red-200 text-red-950'
      }`}
    >
      {/* Cabeçalho de feedback independente de cor */}
      <div className="flex items-center gap-2.5 mb-3">
        {isCorrect ? (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white shrink-0">
            <CheckIcon className="w-4 h-4" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white shrink-0">
            <XIcon className="w-4 h-4" />
          </div>
        )}
        <h3 className="text-base font-bold tracking-tight">
          {isCorrect ? 'Resposta correta!' : 'Resposta incorreta.'}
        </h3>
      </div>

      {/* Explicação pedagógica */}
      <div className="text-sm leading-relaxed mb-4 text-slate-800">
        <p className="font-medium text-slate-900 mb-1">Por que esta resposta?</p>
        <p>{explanation}</p>
      </div>

      {/* Metadados da fonte legal */}
      <div className="mb-5 pt-3 border-t border-slate-200/60 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-1.5 font-medium text-slate-700" data-testid="source-document">
          <AlertCircleIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>
            {source.kind === 'demo'
              ? 'Referência legal demonstrativa (Validação jurídica pendente)'
              : source.document || 'Documento oficial'}
          </span>
        </div>
        {source.provision && (
          <p className="text-slate-700 font-semibold" data-testid="source-provision">
            Dispositivo legal: <span className="font-normal text-slate-600">{source.provision}</span>
          </p>
        )}
        {source.url && (
          <p>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-1"
            >
              Consultar legislação oficial &rarr;
            </a>
          </p>
        )}
        {source.licenseNote && (
          <p className="italic text-slate-500">{source.licenseNote}</p>
        )}
      </div>

      {/* Botão de avanço */}
      <button
        type="button"
        onClick={onNext}
        className={`w-full py-3 px-5 rounded-xl font-semibold text-white shadow-sm transition-colors flex items-center justify-center gap-2 ${
          isCorrect
            ? 'bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-600'
            : 'bg-red-700 hover:bg-red-800 focus:ring-red-600'
        } focus:outline-none focus:ring-2 focus:ring-offset-2`}
      >
        <span>{isLastQuestion ? 'Finalizar lição' : 'Continuar'}</span>
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
