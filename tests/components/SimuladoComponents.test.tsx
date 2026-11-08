import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import rawQuestions from '@/data/questions-sinalizacao.json';
import { questionBankSchema } from '@/features/lesson/schemas/questionSchema';
import { DEFAULT_EXAM_CONFIG, type SimuladoResult } from '@/features/simulado/types/simulado';
import { SimuladoTimer } from '@/features/simulado/components/SimuladoTimer';
import { SimuladoNavDrawer } from '@/features/simulado/components/SimuladoNavDrawer';
import { SimuladoQuestionCard } from '@/features/simulado/components/SimuladoQuestionCard';
import { SimuladoFinishModal } from '@/features/simulado/components/SimuladoFinishModal';
import { SimuladoResultSummary } from '@/features/simulado/components/SimuladoResultSummary';
import { SimuladoReviewList } from '@/features/simulado/components/SimuladoReviewList';

describe('Componentes do Simulado Configurável (T006)', () => {
  const questions = questionBankSchema.parse(rawQuestions);

  it('SimuladoTimer exibe estados normal, alerta (<5 min) e crítico (<1 min)', () => {
    const onTimeUp = vi.fn();

    const { rerender } = render(
      <SimuladoTimer
        startedAt={new Date().toISOString()}
        durationMinutes={60}
        initialRemainingSeconds={1800}
        onTimeUp={onTimeUp}
      />
    );

    const timerEl = screen.getByTestId('simulado-timer');
    expect(timerEl).toHaveTextContent('30:00');
    expect(timerEl).toHaveAttribute('data-urgency', 'normal');

    rerender(
      <SimuladoTimer
        startedAt={new Date().toISOString()}
        durationMinutes={60}
        initialRemainingSeconds={240}
        onTimeUp={onTimeUp}
      />
    );
    expect(screen.getByTestId('simulado-timer')).toHaveAttribute('data-urgency', 'warning');

    rerender(
      <SimuladoTimer
        startedAt={new Date().toISOString()}
        durationMinutes={60}
        initialRemainingSeconds={45}
        onTimeUp={onTimeUp}
      />
    );
    expect(screen.getByTestId('simulado-timer')).toHaveAttribute('data-urgency', 'critical');
  });

  it('SimuladoNavDrawer alterna aria-expanded e reflete questões respondidas e marcadas para revisão', () => {
    const onToggle = vi.fn();
    const onSelectOrder = vi.fn();

    const answers = [
      { questionOrder: 1, questionId: 'sin-001', selectedOptionId: 'b' as const, isMarkedForReview: false },
      { questionOrder: 2, questionId: 'sin-002', selectedOptionId: null, isMarkedForReview: true },
      { questionOrder: 3, questionId: 'sin-003', selectedOptionId: null, isMarkedForReview: false },
    ];

    render(
      <SimuladoNavDrawer
        isOpen={true}
        onToggle={onToggle}
        currentOrder={1}
        answers={answers}
        onSelectOrder={onSelectOrder}
      />
    );

    expect(screen.getByTestId('toggle-nav-drawer-btn')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('nav-flag-2')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('nav-question-2'));
    expect(onSelectOrder).toHaveBeenCalledWith(2);
  });

  it('SimuladoQuestionCard renderiza opções sem feedback imediato e gerencia aria-pressed na revisão', () => {
    const onSelectOption = vi.fn();
    const onToggleReviewFlag = vi.fn();

    render(
      <SimuladoQuestionCard
        questionOrder={1}
        totalQuestions={30}
        question={questions[0]}
        selectedOptionId="b"
        isMarkedForReview={true}
        onSelectOption={onSelectOption}
        onToggleReviewFlag={onToggleReviewFlag}
      />
    );

    expect(screen.getByText('Questão 1 de 30')).toBeInTheDocument();
    const reviewBtn = screen.getByTestId('mark-review-btn');
    expect(reviewBtn).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(reviewBtn);
    expect(onToggleReviewFlag).toHaveBeenCalledTimes(1);
  });

  it('SimuladoFinishModal alerta sobre questões em branco e dispara confirmação', () => {
    const onCancel = vi.fn();
    const onConfirmFinish = vi.fn();

    render(
      <SimuladoFinishModal
        isOpen={true}
        totalQuestions={30}
        answeredCount={22}
        markedCount={2}
        isSubmitting={false}
        onCancel={onCancel}
        onConfirmFinish={onConfirmFinish}
      />
    );

    expect(screen.getByTestId('unanswered-warning')).toHaveTextContent('8 questão(ões) em branco');
    fireEvent.click(screen.getByTestId('confirm-finish-btn'));
    expect(onConfirmFinish).toHaveBeenCalledTimes(1);
  });

  it('SimuladoResultSummary e SimuladoReviewList exibem aprovação e filtram erros/acertos', () => {
    const mockResult: SimuladoResult = {
      simuladoId: 'sim-100',
      config: DEFAULT_EXAM_CONFIG,
      startedAt: '2026-11-08T18:00:00.000Z',
      finishedAt: '2026-11-08T18:35:00.000Z',
      durationSeconds: 2100,
      totalQuestions: 2,
      answeredCount: 2,
      unansweredCount: 0,
      score: 1,
      passingScore: 1,
      accuracyPercent: 50,
      isApproved: true,
      status: 'completed',
      xpEarned: 100,
      evaluatedItems: [
        {
          questionOrder: 1,
          question: questions[0],
          selectedOptionId: questions[0].correctOptionId,
          isMarkedForReview: false,
          isCorrect: true,
        },
        {
          questionOrder: 2,
          question: questions[1],
          selectedOptionId: 'a',
          isMarkedForReview: true,
          isCorrect: false,
        },
      ],
    };

    render(
      <div>
        <SimuladoResultSummary result={mockResult} />
        <SimuladoReviewList items={mockResult.evaluatedItems} />
      </div>
    );

    expect(screen.getByTestId('simulado-approval-badge')).toHaveTextContent(
      'APROVADO NO SIMULADO!'
    );
    expect(screen.getByTestId('review-question-1')).toBeInTheDocument();
    expect(screen.getByTestId('review-question-2')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('filter-errors-btn'));
    expect(screen.queryByTestId('review-question-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('review-question-2')).toBeInTheDocument();
  });
});
