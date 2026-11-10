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

/**
 * Gera uma síntese conceitual determinística ("Entenda a regra") com base no dispositivo legal
 * para facilitar a memorização sem alterar o schema do banco de dados.
 */
export function getRuleSynthesis(source: QuestionSource): string {
  const provision = (source.provision || '').toLowerCase();

  if (provision.includes('195') || provision.includes('583-50')) {
    return 'As ordens emanadas por gestos ou sinais sonoros do agente da autoridade de trânsito prevalecem sobre as normas de circulação e os demais sinais (CTB, Art. 89, I).';
  }

  if (provision.includes('584-31') || provision.includes('584-32')) {
    return 'Antes de colocar o veículo em circulação ou parar junto ao bordo da pista, o condutor deve indicar sua intenção com antecedência mediante luz indicadora de direção (seta) ou gesto convencional de braço.';
  }

  if (provision.includes('584-33') || provision.includes('584-34') || provision.includes('196')) {
    return 'Toda mudança de direção ou transposição de faixa exige sinalização prévia, contínua e em tempo hábil por meio da seta ou gesto regulamentar.';
  }

  if (provision.includes('208') || provision.includes('605-01') || provision.includes('605-02')) {
    return 'Diante do foco vermelho do semáforo ou ordem de parada obrigatória, o veículo deve imobilizar-se antes da linha de retenção ou da faixa de pedestres.';
  }

  return 'Observe sempre a hierarquia da sinalização viária e o enquadramento específico previsto nas fichas do Manual Brasileiro de Fiscalização de Trânsito (MBFT).';
}

export function FeedbackPanel({
  isCorrect,
  explanation,
  source,
  onNext,
  isLastQuestion,
}: FeedbackPanelProps) {
  const ruleSynthesis = getRuleSynthesis(source);

  return (
    <section
      role="status"
      aria-live="polite"
      className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 text-slate-900 dark:text-slate-100 space-y-4"
    >
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
        <h3 className={`text-base font-extrabold tracking-tight ${isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
          {isCorrect ? 'Resposta correta!' : 'Resposta incorreta.'}
        </h3>
      </div>

      <div data-testid="explanation-block" className="space-y-1.5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Por que essa resposta está correta?
        </p>
        <p className="text-sm leading-relaxed font-medium text-slate-800 dark:text-slate-100">
          {explanation}
        </p>
      </div>

      <div data-testid="rule-summary-block" className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-1.5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Entenda a regra
        </p>
        <p className="text-xs sm:text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-200">
          {ruleSynthesis}
        </p>
      </div>

      <div data-testid="legal-source-block" className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <AlertCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Fundamentação legal</span>
        </div>
        <div className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
          <div className="font-bold text-slate-900 dark:text-slate-100" data-testid="source-document">
            {source.kind === 'demo'
              ? 'Referência legal demonstrativa (Validação jurídica pendente)'
              : source.document || 'Documento oficial'}
          </div>
          {source.provision && (
            <p className="font-semibold" data-testid="source-provision">
              Dispositivo legal: <span className="font-medium">{source.provision}</span>
            </p>
          )}
        </div>
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 underline py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <span>Consultar legislação oficial →</span>
          </a>
        )}
        {source.licenseNote && (
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-2">
            {source.licenseNote}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        data-testid="feedback-next-button"
        className="w-full min-h-11 py-3 px-5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-sm transition-colors flex items-center justify-center gap-2"
      >
        <span>{isLastQuestion ? 'Finalizar lição' : 'Continuar'}</span>
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </section>
  );
}
