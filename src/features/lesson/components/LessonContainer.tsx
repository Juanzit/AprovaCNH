'use client';

import React from 'react';
import type { Question } from '../types/question';
import { useLessonState } from '../hooks/useLessonState';
import { LessonHeader } from './LessonHeader';
import { OptionList } from './OptionList';
import { FeedbackPanel } from './FeedbackPanel';
import { LessonSummary } from './LessonSummary';

interface LessonContainerProps {
  questions: Question[];
}

export function LessonContainer({ questions }: LessonContainerProps) {
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    selectedOptionId,
    isAnswerSubmitted,
    isCorrect,
    isCompleted,
    xpBreakdown,
    selectOption,
    submitAnswer,
    nextQuestion,
    resetLesson,
  } = useLessonState(questions);

  if (isCompleted) {
    return <LessonSummary xpBreakdown={xpBreakdown} onRestart={resetLesson} />;
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
