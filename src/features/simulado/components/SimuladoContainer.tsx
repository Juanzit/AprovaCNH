'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { OptionId } from '@/features/lesson/types/question';
import type {
  ExamConfig,
  SimuladoAnswerState,
  SimuladoQuestionItem,
} from '../types/simulado';
import { submitSimuladoAction } from '../server/simuladoActions';
import { saveSimuladoResultToSession } from '../utils/simuladoStorage';
import { SimuladoTimer } from './SimuladoTimer';
import { SimuladoNavDrawer } from './SimuladoNavDrawer';
import { SimuladoQuestionCard } from './SimuladoQuestionCard';
import { SimuladoFinishModal } from './SimuladoFinishModal';

interface SimuladoContainerProps {
  simuladoId: string;
  config: ExamConfig;
  startedAt: string;
  items: SimuladoQuestionItem[];
}

export function SimuladoContainer({
  simuladoId,
  config,
  startedAt,
  items,
}: SimuladoContainerProps) {
  const router = useRouter();
  const [currentOrder, setCurrentOrder] = useState<number>(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [answers, setAnswers] = useState<SimuladoAnswerState[]>(() =>
    items.map((item) => ({
      questionOrder: item.questionOrder,
      questionId: item.question.id,
      selectedOptionId: null,
      isMarkedForReview: false,
    }))
  );

  const currentItem = items.find((i) => i.questionOrder === currentOrder) ?? items[0];
  const currentAnswer =
    answers.find((a) => a.questionOrder === currentOrder) ?? answers[0];

  const answeredCount = answers.filter((a) => a.selectedOptionId !== null).length;
  const markedCount = answers.filter((a) => a.isMarkedForReview).length;

  const handleSelectOption = useCallback(
    (optionId: OptionId) => {
      if (isSubmitting) return;
      setAnswers((prev) =>
        prev.map((ans) =>
          ans.questionOrder === currentOrder
            ? { ...ans, selectedOptionId: optionId }
            : ans
        )
      );
    },
    [currentOrder, isSubmitting]
  );

  const handleToggleReviewFlag = useCallback(() => {
    if (isSubmitting) return;
    setAnswers((prev) =>
      prev.map((ans) =>
        ans.questionOrder === currentOrder
          ? { ...ans, isMarkedForReview: !ans.isMarkedForReview }
          : ans
      )
    );
  }, [currentOrder, isSubmitting]);

  const handleSubmitExam = useCallback(
    async (timedOut: boolean = false) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setErrorMessage(null);

      const startMs = new Date(startedAt).getTime();
      const elapsedSeconds = Number.isNaN(startMs)
        ? 60
        : Math.max(1, Math.floor((Date.now() - startMs) / 1000));

      const response = await submitSimuladoAction({
        simuladoId,
        configId: config.id,
        startedAt,
        durationSeconds: timedOut ? config.durationMinutes * 60 : elapsedSeconds,
        timedOut,
        items: answers,
      });

      if (!response.success || !response.result) {
        setIsSubmitting(false);
        setErrorMessage(
          response.error ?? 'Não foi possível finalizar o simulado. Tente novamente.'
        );
        return;
      }

      saveSimuladoResultToSession(response.result);
      setIsFinishModalOpen(false);
      router.push(`/simulado/resultado/${response.result.simuladoId}`);
    },
    [isSubmitting, startedAt, simuladoId, config, answers, router]
  );

  const handleTimeUp = useCallback(() => {
    void handleSubmitExam(true);
  }, [handleSubmitExam]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinishModalOpen || isSubmitting) return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'a' || key === '1') handleSelectOption('a');
      if (key === 'b' || key === '2') handleSelectOption('b');
      if (key === 'c' || key === '3') handleSelectOption('c');
      if (key === 'd' || key === '4') handleSelectOption('d');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinishModalOpen, isSubmitting, handleSelectOption]);

  if (!currentItem || !currentAnswer) {
    return null;
  }

  const progressPercent = Math.round((answeredCount / items.length) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-5 py-4 sm:py-6 space-y-4">
      {/* Barra Superior da Prova: Título, Cronômetro e Finalizar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 block">
              Simulado Oficial • {config.uf ?? 'MG'} (D007)
            </span>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900">
              Prova Teórica DETRAN-MG / SENATRAN
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <SimuladoTimer
              startedAt={startedAt}
              durationMinutes={config.durationMinutes}
              onTimeUp={handleTimeUp}
              isSubmitted={isSubmitting}
            />

            <button
              type="button"
              onClick={() => setIsFinishModalOpen(true)}
              disabled={isSubmitting}
              data-testid="open-finish-modal-btn"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
            >
              Finalizar Prova
            </button>
          </div>
        </div>

        {/* Barra de Progresso de Preenchimento */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>
              Respondidas: <strong className="text-slate-900">{answeredCount}</strong> de{' '}
              {items.length}
            </span>
            <span>Nota de corte: {config.passingScore} acertos</span>
          </div>
          <div
            role="progressbar"
            aria-label="Progresso de questões respondidas no simulado"
            aria-valuenow={answeredCount}
            aria-valuemin={0}
            aria-valuemax={items.length}
            className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-blue-600 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Gaveta / Grade de Navegação 1..30 */}
        <SimuladoNavDrawer
          isOpen={isDrawerOpen}
          onToggle={() => setIsDrawerOpen((prev) => !prev)}
          currentOrder={currentOrder}
          answers={answers}
          onSelectOrder={(order) => {
            setCurrentOrder(order);
          }}
        />
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold"
        >
          {errorMessage}
        </div>
      )}

      {/* Cartão da Questão Atual (Sem Feedback Imediato) */}
      <SimuladoQuestionCard
        questionOrder={currentItem.questionOrder}
        totalQuestions={items.length}
        question={currentItem.question}
        selectedOptionId={currentAnswer.selectedOptionId}
        isMarkedForReview={currentAnswer.isMarkedForReview}
        onSelectOption={handleSelectOption}
        onToggleReviewFlag={handleToggleReviewFlag}
        disabled={isSubmitting}
      />

      {/* Controles Inferiores de Navegação */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => setCurrentOrder((prev) => Math.max(1, prev - 1))}
          disabled={currentOrder === 1 || isSubmitting}
          data-testid="prev-question-btn"
          className="min-h-11 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
        >
          ← Anterior
        </button>

        {currentOrder < items.length ? (
          <button
            type="button"
            onClick={() => setCurrentOrder((prev) => Math.min(items.length, prev + 1))}
            disabled={isSubmitting}
            data-testid="next-question-btn"
            className="min-h-11 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors shadow-xs"
          >
            Próxima →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsFinishModalOpen(true)}
            disabled={isSubmitting}
            data-testid="finish-on-last-btn"
            className="min-h-11 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors shadow-xs"
          >
            Finalizar Simulado ✓
          </button>
        )}
      </div>

      {/* Modal Nativo de Confirmação de Entrega */}
      <SimuladoFinishModal
        isOpen={isFinishModalOpen}
        totalQuestions={items.length}
        answeredCount={answeredCount}
        markedCount={markedCount}
        isSubmitting={isSubmitting}
        onCancel={() => setIsFinishModalOpen(false)}
        onConfirmFinish={() => void handleSubmitExam(false)}
      />
    </div>
  );
}
