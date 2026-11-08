import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeedbackPanel } from '@/features/lesson/components/FeedbackPanel';
import type { QuestionSource } from '@/features/lesson/types/question';

const mockVerifiedSource: QuestionSource = {
  kind: 'official',
  document: 'CTB - Lei nº 9.503/1997',
  provision: 'Art. 89',
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
  checkedAt: '2026-11-08',
  effectiveFrom: '1998-01-23',
  effectiveUntil: null,
  sourceVersion: 'v1.0',
  verificationStatus: 'verified',
  licenseNote: 'Texto legal oficial de acesso público.',
};

const mockDemoSource: QuestionSource = {
  kind: 'demo',
  document: null,
  provision: null,
  url: null,
  checkedAt: null,
  effectiveFrom: null,
  effectiveUntil: null,
  sourceVersion: 'demo-v1',
  verificationStatus: 'not_applicable',
  licenseNote: 'Exemplo ilustrativo de interface.',
};

describe('FeedbackPanel Component (Micro-Aula em 3 Blocos e Botão Primário Padronizado)', () => {
  it('deve renderizar os 3 blocos da micro-aula e manter o botão Continuar azul em resposta correta', () => {
    render(
      <FeedbackPanel
        isCorrect={true}
        explanation="As ordens do agente prevalecem sobre as demais normas."
        source={mockVerifiedSource}
        onNext={vi.fn()}
        isLastQuestion={false}
      />
    );

    const statusBox = screen.getByRole('status');
    expect(statusBox).toBeInTheDocument();

    expect(screen.getByText('Resposta correta!')).toBeInTheDocument();

    // 3 blocos da micro-aula
    const explanationBlock = screen.getByTestId('explanation-block');
    expect(explanationBlock).toHaveTextContent('Por que essa resposta está correta?');
    expect(explanationBlock).toHaveTextContent(
      'As ordens do agente prevalecem sobre as demais normas.'
    );

    const ruleBlock = screen.getByTestId('rule-summary-block');
    expect(ruleBlock).toHaveTextContent('Entenda a regra');

    const legalBlock = screen.getByTestId('legal-source-block');
    expect(legalBlock).toHaveTextContent('Fundamentação legal');
    expect(screen.getByText('CTB - Lei nº 9.503/1997')).toBeInTheDocument();
    expect(screen.getByText(/Art\. 89/i)).toBeInTheDocument();

    const nextBtn = screen.getByTestId('feedback-next-button');
    expect(nextBtn).toHaveClass('bg-blue-600');
  });

  it('deve anunciar status acessível para resposta incorreta e manter o botão Continuar azul', () => {
    render(
      <FeedbackPanel
        isCorrect={false}
        explanation="O sinal vermelho indica parada obrigatória."
        source={mockVerifiedSource}
        onNext={vi.fn()}
        isLastQuestion={false}
      />
    );

    expect(screen.getByText('Resposta incorreta.')).toBeInTheDocument();
    expect(screen.getByTestId('explanation-block')).toHaveTextContent(
      'Por que essa resposta está correta?'
    );
    expect(screen.getByTestId('rule-summary-block')).toHaveTextContent('Entenda a regra');
    expect(screen.getByTestId('feedback-next-button')).toHaveClass('bg-blue-600');
  });

  it('deve exibir aviso de referência demonstrativa quando source.kind === "demo"', () => {
    render(
      <FeedbackPanel
        isCorrect={true}
        explanation="Explicação demonstrativa."
        source={mockDemoSource}
        onNext={vi.fn()}
        isLastQuestion={false}
      />
    );

    expect(
      screen.getByText(/Referência legal demonstrativa \(Validação jurídica pendente\)/i)
    ).toBeInTheDocument();
  });

  it('deve alterar texto do botão para "Finalizar lição" na última questão', () => {
    render(
      <FeedbackPanel
        isCorrect={true}
        explanation="Explicação final."
        source={mockDemoSource}
        onNext={vi.fn()}
        isLastQuestion={true}
      />
    );

    expect(screen.getByRole('button', { name: /Finalizar lição/i })).toBeInTheDocument();
  });
});
