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
    <div
      role="status"
      aria-live="polite"
      className={`mt-6 p-4 sm:p-5 rounded-2xl border space-y-4 ${
        isCorrect
          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          : 'bg-red-50/90 border-red-300 text-red-950'
      }`}
    >
      {/* Banner de status da resposta (Verde para acerto, Vermelho para erro) */}
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

      {/* Bloco 1: Por que essa resposta está correta? (Explicação direta do gabarito) */}
      <div
        data-testid="explanation-block"
        className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-1.5"
      >
        <p className="text-xs font-extrabold uppercase tracking-wider text-blue-800">
          Por que essa resposta está correta?
        </p>
        <p className="text-sm leading-relaxed text-slate-800 font-medium">
          {explanation}
        </p>
      </div>

      {/* Bloco 2: Entenda a regra (Síntese destacada do conceito normativo para memorização) */}
      <div
        data-testid="rule-summary-block"
        className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 space-y-1"
      >
        <p className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
          Entenda a regra
        </p>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-800 font-semibold">
          {ruleSynthesis}
        </p>
      </div>

      {/* Bloco 3: Fundamentação legal (Documento, ficha MBFT/artigo CTB e link oficial) */}
      <div
        data-testid="legal-source-block"
        className="bg-slate-100/90 border border-slate-300 rounded-xl p-4 space-y-2 text-slate-800"
      >
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900">
          <AlertCircleIcon className="w-4 h-4 text-blue-700 shrink-0" />
          <span>Fundamentação legal</span>
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

      {/* Botão de avanço padronizado na cor primária da marca (azul) tanto no acerto quanto no erro */}
      <button
        type="button"
        onClick={onNext}
        data-testid="feedback-next-button"
        className="w-full min-h-11 py-3 px-5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-sm transition-colors flex items-center justify-center gap-2"
      >
        <span>{isLastQuestion ? 'Finalizar lição' : 'Continuar'}</span>
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
