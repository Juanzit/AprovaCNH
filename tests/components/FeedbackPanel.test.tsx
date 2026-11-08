import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackPanel } from '@/features/lesson/components/FeedbackPanel';
import type { QuestionSource } from '@/features/lesson/types/question';

const mockSource: QuestionSource = {
  kind: 'demo',
  document: 'CTB Demonstrativo',
  provision: 'Art. 195',
  url: 'https://www.gov.br',
  checkedAt: null,
  effectiveFrom: null,
  effectiveUntil: null,
  sourceVersion: null,
  licenseNote: 'Fixture de teste',
  verificationStatus: 'pending',
};

describe('FeedbackPanel Component (Escaneabilidade em Blocos e Alto Contraste)', () => {
  it('deve anunciar status acessível para resposta correta e renderizar blocos separados de explicação e legislação', () => {
    render(
      <FeedbackPanel
        isCorrect={true}
        explanation="Esta regra se aplica conforme o código de trânsito."
        source={mockSource}
        onNext={vi.fn()}
        isLastQuestion={false}
      />
    );

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');

    const feedbackTitle = screen.getByText('Resposta correta!');
    expect(feedbackTitle).toBeInTheDocument();

    // Bloco 1: Explicação didática
    const explanationBlock = screen.getByTestId('explanation-block');
    expect(explanationBlock).toHaveTextContent(
      /Por que esta é a resposta correta \/ O que aprender/i
    );
    expect(explanationBlock).toHaveTextContent(
      'Esta regra se aplica conforme o código de trânsito.'
    );

    // Bloco 2: Fundamentação normativa
    const legalBlock = screen.getByTestId('legal-source-block');
    expect(legalBlock).toHaveTextContent(/O que diz a legislação \(MBFT \/ CTB\)/i);
    expect(screen.getByTestId('source-provision')).toHaveTextContent('Art. 195');
  });

  it('deve anunciar resposta incorreta com texto explícito', () => {
    render(
      <FeedbackPanel
        isCorrect={false}
        explanation="O condutor deve aguardar a via preferencial."
        source={mockSource}
        onNext={vi.fn()}
        isLastQuestion={false}
      />
    );

    const feedbackTitle = screen.getByText('Resposta incorreta.');
    expect(feedbackTitle).toBeInTheDocument();
  });

  it('deve disparar onNext ao clicar no botão de continuar', () => {
    const handleNext = vi.fn();

    render(
      <FeedbackPanel
        isCorrect={true}
        explanation="Explicação didática"
        source={mockSource}
        onNext={handleNext}
        isLastQuestion={false}
      />
    );

    const nextButton = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(nextButton);

    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('deve exibir "Finalizar lição" quando for a última questão', () => {
    render(
      <FeedbackPanel
        isCorrect={true}
        explanation="Explicação didática"
        source={mockSource}
        onNext={vi.fn()}
        isLastQuestion={true}
      />
    );

    const finishButton = screen.getByRole('button', { name: /Finalizar lição/i });
    expect(finishButton).toBeInTheDocument();
  });
});
