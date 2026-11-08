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
      className={`mt-6 p-4 sm:p-5 rounded-2xl border space-y-4 ${
        isCorrect
          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          : 'bg-red-50/90 border-red-300 text-red-950'
      }`}
    >
      {/* Cabeçalho de feedback independente de cor */}
      <div className="flex items-center gap-2.5">
        {isCorrect ? (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white shrink-0">
            <CheckIcon className="w-4 h-4" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white shrink-0">
            <XIcon className="w-4 h-4" />
          </div>
        )}
        <h3 className="text-base font-extrabold tracking-tight text-slate-900">
          {isCorrect ? 'Resposta correta!' : 'Resposta incorreta.'}
        </h3>
      </div>

      {/* Bloco 1: Explicação didática escaneável com alto contraste */}
      <div
        data-testid="explanation-block"
        className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-1.5"
      >
        <p className="text-xs font-extrabold uppercase tracking-wider text-blue-800">
          Por que esta é a resposta correta / O que aprender
        </p>
        <p className="text-sm leading-relaxed text-slate-800 font-medium">
          {explanation}
        </p>
      </div>

      {/* Bloco 2: Fundamentação normativa estruturada (MBFT / CTB) */}
      <div
        data-testid="legal-source-block"
        className="bg-slate-100/90 border border-slate-300 rounded-xl p-4 space-y-2 text-slate-800"
      >
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900">
          <AlertCircleIcon className="w-4 h-4 text-blue-700 shrink-0" />
          <span>O que diz a legislação (MBFT / CTB)</span>
        </div>

        <div className="space-y-1 text-xs sm:text-sm">
          <div className="font-bold text-slate-900" data-testid="source-document">
            {source.kind === 'demo'
              ? 'Referência legal demonstrativa (Validação jurídica pendente)'
              : source.document || 'Documento oficial'}
          </div>

          {source.provision && (
            <p className="text-slate-800 font-bold" data-testid="source-provision">
              Dispositivo legal:{' '}
              <span className="font-semibold text-slate-900">{source.provision}</span>
            </p>
          )}
        </div>

        {source.url && (
          <div className="pt-1">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-blue-900 underline py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <span>Consultar legislação oficial &rarr;</span>
            </a>
          </div>
        )}

        {source.licenseNote && (
          <p className="text-xs font-medium text-slate-700 border-t border-slate-200 pt-1.5">
            {source.licenseNote}
          </p>
        )}
      </div>

      {/* Botão de avanço (Alvo de toque >= 44px) */}
      <button
        type="button"
        onClick={onNext}
        className={`w-full min-h-11 py-3 px-5 rounded-xl font-bold text-white shadow-sm transition-colors flex items-center justify-center gap-2 ${
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
