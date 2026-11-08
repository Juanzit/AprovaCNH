import React from 'react';
import Link from 'next/link';
import { getPriorityReviewQuestions } from '@/features/review/server/reviewRepository';
import { LessonContainer } from '@/features/lesson/components/LessonContainer';

export default async function ReviewPracticePage() {
  const questions = await getPriorityReviewQuestions(5);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6">
      {/* Barra de Navegação Superior */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
        <Link
          href="/revisao"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors py-1.5 px-2 rounded-lg hover:bg-blue-50"
        >
          <span>&larr;</span>
          <span>Voltar ao Centro de Revisão</span>
        </Link>
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span>⚡</span>
          <span>Revisão Espaçada</span>
        </span>
      </div>

      <LessonContainer
        questions={questions}
        isReviewMode={true}
        customTopic="Treino de Revisão Espaçada (SRS)"
        backHref="/revisao"
        backLabel="Voltar ao Centro de Revisão"
      />
    </div>
  );
}
