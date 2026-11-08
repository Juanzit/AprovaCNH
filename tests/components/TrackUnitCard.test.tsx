import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TrackUnitCard } from '@/features/progress/components/TrackUnitCard';
import type { LessonSessionProgress } from '@/features/progress/types/progress';

describe('TrackUnitCard (Trilha Temática e Livre Acesso)', () => {
  const mockSessions: LessonSessionProgress[] = [
    {
      sessionId: 1,
      topic: 'Sinalização de Trânsito',
      status: 'completed',
      score: 5,
      maxScore: 5,
      xpEarned: 70,
      completedAt: '2026-11-08T12:00:00Z',
    },
    {
      sessionId: 2,
      topic: 'Sinalização de Trânsito',
      status: 'available',
      score: 0,
      maxScore: 5,
      xpEarned: 0,
      completedAt: null,
    },
    {
      sessionId: 3,
      topic: 'Sinalização de Trânsito',
      status: 'available',
      score: 0,
      maxScore: 5,
      xpEarned: 0,
      completedAt: null,
    },
    {
      sessionId: 4,
      topic: 'Sinalização de Trânsito',
      status: 'available',
      score: 0,
      maxScore: 5,
      xpEarned: 0,
      completedAt: null,
    },
  ];

  it('renderiza as 4 sessões com status apropriado de conclusão e livre acesso', () => {
    render(<TrackUnitCard sessions={mockSessions} />);

    expect(screen.getByRole('heading', { name: /sinalização de trânsito/i })).toBeInTheDocument();

    // Sessão 1: Concluída com link 'Revisar'
    const badge1 = screen.getByTestId('session-badge-1');
    expect(badge1).toHaveTextContent(/concluída/i);
    expect(badge1).toHaveTextContent(/5\/5/);
    expect(screen.getByRole('link', { name: /revisar/i })).toHaveAttribute(
      'href',
      '/licao/sinalizacao?sessao=1'
    );

    // Sessão 2: Disponível com link 'Iniciar'
    const badge2 = screen.getByTestId('session-badge-2');
    expect(badge2).toHaveTextContent(/disponível/i);
    const iniciarLinks = screen.getAllByRole('link', { name: /iniciar/i });
    expect(iniciarLinks.length).toBeGreaterThanOrEqual(1);

    // CTA para a próxima sessão pendente (Sessão 2)
    const ctaLink = screen.getByRole('link', { name: /continuar de onde parou/i });
    expect(ctaLink).toHaveAttribute('href', '/licao/sinalizacao?sessao=2');
  });
});
