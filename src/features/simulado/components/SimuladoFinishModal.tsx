'use client';

import React, { useEffect, useRef } from 'react';

interface SimuladoFinishModalProps {
  isOpen: boolean;
  totalQuestions: number;
  answeredCount: number;
  markedCount: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirmFinish: () => void;
}

export function SimuladoFinishModal({
  isOpen,
  totalQuestions,
  answeredCount,
  markedCount,
  isSubmitting,
  onCancel,
  onConfirmFinish,
}: SimuladoFinishModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else {
        dialog.setAttribute('open', '');
      }
    } else {
      if (typeof dialog.close === 'function' && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="finish-modal-title"
      onClose={onCancel}
      className="m-auto w-full max-w-md rounded-2xl bg-white p-0 shadow-xl border border-slate-200 text-slate-900"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 id="finish-modal-title" className="text-lg font-extrabold text-slate-900">
            Finalizar Simulado Oficial?
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Fechar janela de confirmação"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Você respondeu{' '}
            <strong className="font-extrabold text-slate-900">
              {answeredCount} de {totalQuestions}
            </strong>{' '}
            questões da prova.
          </p>

          {unansweredCount > 0 ? (
            <div
              role="alert"
              data-testid="unanswered-warning"
              className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm font-medium"
            >
              <strong>Atenção:</strong> você ainda tem{' '}
              <strong>{unansweredCount} questão(ões) em branco</strong>. Questões não respondidas
              são contabilizadas como erro na nota final. Deseja entregar a prova mesmo assim?
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-medium">
              Todas as {totalQuestions} questões foram preenchidas. Deseja encerrar o simulado e
              conferir seu resultado e o gabarito oficial comentado?
            </div>
          )}

          {markedCount > 0 && (
            <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
              <span aria-hidden="true">🚩</span>
              <span>
                Você possui {markedCount} questão(ões) marcada(s) para revisão no mapa da prova.
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            autoFocus={unansweredCount > 0}
            onClick={onCancel}
            disabled={isSubmitting}
            data-testid="cancel-finish-btn"
            className="min-h-11 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
          >
            Continuar respondendo
          </button>
          <button
            type="button"
            autoFocus={unansweredCount === 0}
            onClick={onConfirmFinish}
            disabled={isSubmitting}
            data-testid="confirm-finish-btn"
            className="min-h-11 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 transition-colors shadow-xs"
          >
            {isSubmitting ? 'Corrigindo prova...' : 'Entregar Prova e Ver Gabarito'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
