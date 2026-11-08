'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Question } from '../types/question';
import { useLessonState } from '../hooks/useLessonState';
import { LessonHeader } from './LessonHeader';
import { OptionList } from './OptionList';
import { FeedbackPanel } from './FeedbackPanel';
import { LessonSummary } from './LessonSummary';
import { submitSessionAnswersAction } from '@/features/progress/actions/sessionActions';
import type { SessionSubmissionResult } from '@/features/progress/types/progress';

interface LessonContainerProps {
  questions: Question[];
  sessionId?: number;
}

export function LessonContainer({ questions, sessionId = 1 }: LessonContainerProps) {
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
    selectOption,
    submitAnswer,
    nextQuestion,
    resetLesson,
  } = useLessonState(questions);

  const [serverResult, setServerResult] = useState<SessionSubmissionResult | null>(null);

  // Submissão autoritativa no servidor ao concluir as questões da sessão
  useEffect(() => {
    let isMounted = true;

    if (isCompleted && !serverResult && submittedAnswers.length > 0) {
      submitSessionAnswersAction({
        topic: questions[0]?.topic ?? 'Sinalização de Trânsito',
        sessionId,
        answers: submittedAnswers,
      })
        .then((res) => {
          if (isMounted) {
            setServerResult(res);
          }
        })
        .catch(() => {
          // Falha não-bloqueante: mantém a UI funcional com o resumo local
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isCompleted, serverResult, submittedAnswers, questions, sessionId]);

  const handleRestart = useCallback(() => {
    setServerResult(null);
    resetLesson();
  }, [resetLesson]);

  if (isCompleted) {
    return (
      <LessonSummary
        xpBreakdown={xpBreakdown}
        serverResult={serverResult}
        onRestart={handleRestart}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 text-slate-600">
        Nenhuma questão encontrada.
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 md:py-10">
      <LessonHeader
        topic={currentQuestion.topic}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-8 shadow-sm mb-6">
        <OptionList
          statement={currentQuestion.statement}
          options={currentQuestion.options}
          selectedOptionId={selectedOptionId}
          correctOptionId={currentQuestion.correctOptionId}
          isAnswerSubmitted={isAnswerSubmitted}
          onSelectOption={selectOption}
          isExample={currentQuestion.isExample}
        />

        {/* Botão de confirmação visível antes da submissão */}
        {!isAnswerSubmitted && (
          <div className="mt-8">
            <button
              type="button"
              disabled={!selectedOptionId}
              onClick={submitAnswer}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                selectedOptionId
                  ? 'bg-blue-700 hover:bg-blue-800 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed opacity-70'
              }`}
            >
              Confirmar resposta
            </button>
          </div>
        )}

        {/* Painel de feedback imediato após confirmação */}
        {isAnswerSubmitted && isCorrect !== null && (
          <FeedbackPanel
            isCorrect={isCorrect}
            explanation={currentQuestion.explanation}
            source={currentQuestion.source}
            onNext={nextQuestion}
            isLastQuestion={currentQuestionIndex === totalQuestions - 1}
          />
        )}
      </div>
    </div>
  );
}
