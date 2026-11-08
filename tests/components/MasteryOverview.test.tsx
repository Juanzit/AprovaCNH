import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MasteryOverview } from '@/features/review/components/MasteryOverview';
import type { SubtopicMastery } from '@/features/review/types/review';

describe('MasteryOverview Component (Diagnóstico de Domínio Acessível)', () => {
  const mockSubtopics: SubtopicMastery[] = [
    {
      subtopic: 'Ordens do Agente e Prevalência (Art. 195)',
      legalProvision: 'Art. 195 (Ficha MBFT 583-50)',
      sessionId: 1,
      totalQuestions: 5,
      attemptedQuestions: 5,
      masteryScore: 85,
      status: 'dominado',
      statusLabel: 'Dominado',
    },
    {
      subtopic: 'Início de Marcha e Parada (Art. 196)',
      legalProvision: 'Art. 196 (Fichas MBFT 584-31 e 584-32)',
      sessionId: 2,
      totalQuestions: 5,
      attemptedQuestions: 3,
      masteryScore: 45,
      status: 'critico',
      statusLabel: 'Crítico',
    },
  ];

  it('renderiza os subtemas com barras de progresso e badges acessíveis', () => {
    render(<MasteryOverview subtopics={mockSubtopics} />);

    expect(screen.getByRole('heading', { name: /Diagnóstico de Domínio por Dispositivo Legal/i })).toBeInTheDocument();

    // Sessão 1: Dominado (85%)
    expect(screen.getByText(/Ordens do Agente e Prevalência/i)).toBeInTheDocument();
    expect(screen.getByTestId('badge-status-1')).toHaveTextContent(/Dominado/i);

    // Barra de progresso com atributos WAI-ARIA
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '85');
    expect(progressBars[0]).toHaveAttribute('aria-valuemin', '0');
    expect(progressBars[0]).toHaveAttribute('aria-valuemax', '100');

    // Sessão 2: Crítico (45%)
    expect(screen.getByText(/Início de Marcha e Parada/i)).toBeInTheDocument();
    expect(screen.getByTestId('badge-status-2')).toHaveTextContent(/Crítico/i);
    expect(progressBars[1]).toHaveAttribute('aria-valuenow', '45');
  });
});
