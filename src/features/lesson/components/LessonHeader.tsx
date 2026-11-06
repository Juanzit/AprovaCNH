import React from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface LessonHeaderProps {
  topic: string;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export function LessonHeader({
  topic,
  currentQuestionIndex,
  totalQuestions,
}: LessonHeaderProps) {
  const currentNumber = currentQuestionIndex + 1;

  return (
    <header className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {topic}
        </span>
        <span className="text-sm font-medium text-slate-700" aria-current="step">
          Questão {currentNumber} de {totalQuestions}
        </span>
      </div>
      <ProgressBar current={currentNumber} total={totalQuestions} />
    </header>
  );
}
