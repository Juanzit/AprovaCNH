import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  DailyReviewCard,
  calculateEstimatedMinutes,
} from '@/features/review/components/DailyReviewCard';

describe('DailyReviewCard Component (Card Contextual do Algoritmo SRS no Dashboard)', () => {
  it('calcula o tempo estimado deterministicamente em minutos (~40s por questão)', () => {
    expect(calculateEstimatedMinutes(0)).toBe(0);
    expect(calculateEstimatedMinutes(1)).toBe(1);
    expect(calculateEstimatedMinutes(4)).toBe(3); // 160s -> ceil(2.66) = 3 minutos
  });

  it('exibe quantidade de questões, microcopy, tempo estimado e CTA "Começar revisão" quando há pendências', () => {
    render(
      <DailyReviewCard
        queueCount={4}
        totalRecentErrors={2}
        totalOverdue={2}
        totalPracticedQuestions={10}
      />
    );

    expect(screen.getByRole('heading', { name: /sua revisão de hoje/i })).toBeInTheDocument();
    expect(screen.getByTestId('srs-queue-count')).toHaveTextContent('4 questões para revisar');
    expect(screen.getByTestId('srs-estimated-time')).toHaveTextContent(/Tempo estimado: 3 minutos/i);
    expect(
      screen.getByText(/Concentre-se nos assuntos que precisam de reforço/i)
    ).toBeInTheDocument();

    const startCta = screen.getByTestId('start-daily-review-cta');
    expect(startCta).toHaveTextContent(/Começar revisão/i);
    expect(startCta).toHaveAttribute('href', '/revisao/pratica');
  });

  it('exibe estado encorajador quando a fila está zerada e o aluno ainda não tem histórico', () => {
    render(
      <DailyReviewCard
        queueCount={0}
        totalRecentErrors={0}
        totalOverdue={0}
        totalPracticedQuestions={0}
      />
    );

    expect(screen.getByTestId('srs-empty-state')).toBeInTheDocument();
    expect(
      screen.getByText(/Sua fila inteligente de revisão espaçada será ativada automaticamente/i)
    ).toBeInTheDocument();
  });
});
