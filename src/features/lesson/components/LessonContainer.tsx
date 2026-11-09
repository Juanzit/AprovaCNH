'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Question, StudentQuestion, OptionId } from '../types/question';
import { useLessonState } from '../hooks/useLessonState';
import { LessonHeader } from './LessonHeader';
import { OptionList } from './OptionList';
import { FeedbackPanel } from './FeedbackPanel';
import { LessonSummary } from './LessonSummary';
import { submitSessionAnswersAction } from '@/features/progress/actions/sessionActions';
import { submitReviewSessionAction } from '@/features/review/actions/reviewActions';
import { verifyLessonAnswerAction } from '../actions/lessonActions';
import type { SessionSubmissionResult } from '@/features/progress/types/progress';

interface LessonContainerProps {
  questions: (StudentQuestion | Question)[];
  sessionId?: number;
  isReviewMode?: boolean;
  customTopic?: string;
  backHref?: string;
  backLabel?: string;
  onVerifyAnswer?: (
    questionId: string,
    selectedOptionId: OptionId
  ) => Promise<{
    isCorrect: boolean;
    correctOptionId: OptionId;
    explanation: string;
  }>;
}

export function LessonContainer({
  questions,
  sessionId = 1,
  isReviewMode = false,
  customTopic,
  backHref,
  backLabel,
  onVerifyAnswer,
}: LessonContainerProps) {
  // Callback padrão utilizando a Server Action autoritativa do servidor
  const defaultVerifyAnswer = useCallback(
    async (qId: string, optId: OptionId) => {
      const res = await verifyLessonAnswerAction(qId, optId);
      if (!res.success || !res.correctOptionId || !res.explanation) {
        throw new Error(res.error || 'Falha ao validar resposta no servidor.');
      }
      return {
        isCorrect: res.isCorrect ?? false,
        correctOptionId: res.correctOptionId,
        explanation: res.explanation,
      };
    },
    []
  );

  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    selectedOptionId,
    isAnswerSubmitted,
    isCorrect,
    isCompleted,
    xpBreakdown,
    submittedAnswers,
    revealedAnswer,
    isVerifying,
    selectOption,
    submitAnswer,
    nextQuestion,
    resetLesson,
  } = useLessonState(questions, {
    onVerifyAnswer: onVerifyAnswer ?? defaultVerifyAnswer,
  });

  const [serverResult, setServerResult] = useState<SessionSubmissionResult | null>(null);

  // Submissão autoritativa no servidor ao concluir as questões da sessão
  useEffect(() => {
    let isMounted = true;

    if (isCompleted && !serverResult && submittedAnswers.length > 0) {
      if (isReviewMode) {
        submitReviewSessionAction(submittedAnswers)
          .then(() => {
            if (isMounted) {
              setServerResult({
                success: true,
                score: submittedAnswers.length,
                maxScore: submittedAnswers.length,
                xpAwarded: xpBreakdown.totalXp,
                isFirstCompletion: false,
                currentStreak: 1,
                longestStreak: 1,
                results: [],
              });
            }
          })
          .catch((err) => {
            console.error('[LessonContainer] Falha ao registrar sessão de revisão:', err);
          });
      } else {
        submitSessionAnswersAction({
          sessionId,
          topic: customTopic ?? 'Sinalização de Trânsito',
          answers: submittedAnswers,
        })
          .then((res) => {
            if (isMounted && res.success) {
              setServerResult(res);
            }
          })
          .catch((err) => {
            console.error('[LessonContainer] Falha ao registrar progresso no servidor:', err);
          });
      }
    }

    return () => {
      isMounted = false;
    };
  }, [
    isCompleted,
    serverResult,
    submittedAnswers,
    isReviewMode,
    sessionId,
    customTopic,
    xpBreakdown.totalXp,
  ]);

  if (isCompleted) {
    return (
      <LessonSummary
        xpBreakdown={xpBreakdown}
        sessionId={sessionId}
        serverResult={serverResult}
        isReviewMode={isReviewMode}
        onRestart={resetLesson}
        backHref={backHref}
        backLabel={backLabel}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 text-center text-slate-500">
        Nenhuma questão encontrada para esta lição.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-5 py-6 md:py-10">
      <LessonHeader
        topic={customTopic ?? currentQuestion.topic}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-8 shadow-sm mb-6">
        <OptionList
          statement={currentQuestion.statement}
          options={currentQuestion.options}
          selectedOptionId={selectedOptionId}
          correctOptionId={revealedAnswer?.correctOptionId ?? null}
          isAnswerSubmitted={isAnswerSubmitted}
          onSelectOption={selectOption}
          isExample={currentQuestion.isExample}
        />

        {/* Botão de confirmação visível antes da submissão */}
        {!isAnswerSubmitted && (
          <div className="mt-8">
            <button
              type="button"
              disabled={!selectedOptionId || isVerifying}
              onClick={submitAnswer}
              className={`w-full min-h-11 py-3.5 px-6 rounded-xl font-bold text-white transition-all shadow-sm ${
                selectedOptionId && !isVerifying
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              } focus:outline-none`}
            >
              {isVerifying ? 'Verificando...' : 'Confirmar resposta'}
            </button>
          </div>
        )}

        {/* Painel de feedback imediato após confirmação autoritativa */}
        {isAnswerSubmitted && isCorrect !== null && (
          <FeedbackPanel
            isCorrect={isCorrect}
            explanation={revealedAnswer?.explanation ?? ''}
            source={currentQuestion.source}
            onNext={nextQuestion}
            isLastQuestion={currentQuestionIndex === totalQuestions - 1}
          />
        )}
      </div>
    </div>
  );
}
