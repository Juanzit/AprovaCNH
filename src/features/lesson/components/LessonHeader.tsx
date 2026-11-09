import React from 'react';
import Link from 'next/link';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { BookOpenIcon } from '@/components/ui/Icons';

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
    <header className="w-full mb-6 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
            title="Voltar à Trilha"
            aria-label="Voltar para a Trilha de Aprendizagem"
          >
            &larr;
          </Link>
          <div className="flex items-center gap-1.5">
            <Badge variant="brand" size="sm">
              <span className="flex items-center gap-1">
                <BookOpenIcon className="w-3.5 h-3.5" />
                <span>{topic}</span>
              </span>
            </Badge>
          </div>
        </div>

        <span
          className="text-xs sm:text-sm font-extrabold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs"
          aria-current="step"
        >
          Questão <span className="text-blue-600 font-black">{currentNumber}</span> de {totalQuestions}
        </span>
      </div>

      <ProgressBar current={currentNumber} total={totalQuestions} />
    </header>
  );
}
