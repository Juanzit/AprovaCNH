import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TrackUnitCard, getPrimaryCtaConfig } from '@/features/progress/components/TrackUnitCard';
import type { LessonSessionProgress } from '@/features/progress/types/progress';

describe('TrackUnitCard (Trilha Vertical Conectada e CTA Inteligente Contextual)', () => {
  const createSessions = (
    statuses: Array<LessonSessionProgress['status']>
  ): LessonSessionProgress[] =>
    statuses.map((status, idx) => ({
      sessionId: idx + 1,
      topic: 'Sinalização de Trânsito',
      status,
      score: status === 'completed' ? 5 : 0,
      maxScore: 5,
      xpEarned: status === 'completed' ? 70 : 0,
      completedAt: status === 'completed' ? '2026-11-08T12:00:00Z' : null,
    }));

  it('exibe "Começar primeira sessão (Sessão 1)" quando o progresso é 0/4 e nenhuma sessão está em andamento', () => {
    const sessions = createSessions(['available', 'available', 'available', 'available']);
    const config = getPrimaryCtaConfig(sessions);
    expect(config.label).toBe('Começar primeira sessão (Sessão 1)');
    expect(config.href).toBe('/licao/sinalizacao?sessao=1');
  });

  it('exibe "Continuar estudando (Sessão X)" quando há sessão iniciada/interrompida (in_progress)', () => {
    const sessions = createSessions(['completed', 'in_progress', 'available', 'available']);
    const config = getPrimaryCtaConfig(sessions);
    expect(config.label).toBe('Continuar estudando (Sessão 2)');
    expect(config.href).toBe('/licao/sinalizacao?sessao=2');
  });

  it('exibe "Próxima sessão (Sessão X)" quando pelo menos 1 sessão foi concluída e as próximas estão disponíveis', () => {
    const sessions = createSessions(['completed', 'available', 'available', 'available']);
    const config = getPrimaryCtaConfig(sessions);
    expect(config.label).toBe('Próxima sessão (Sessão 2)');
    expect(config.href).toBe('/licao/sinalizacao?sessao=2');
  });

  it('exibe "Revisar unidade" quando todas as 4/4 sessões estão concluídas (100%)', () => {
    const sessions = createSessions(['completed', 'completed', 'completed', 'completed']);
    const config = getPrimaryCtaConfig(sessions);
    expect(config.label).toBe('Revisar unidade');
    expect(config.href).toBe('/licao/sinalizacao?sessao=1');
  });

  it('renderiza a trilha vertical conectada com as 4 sessões, +70 XP e alvos de toque acessíveis', () => {
    const mockSessions = createSessions(['completed', 'available', 'available', 'available']);
    render(<TrackUnitCard sessions={mockSessions} />);

    expect(screen.getByRole('heading', { name: /sinalização de trânsito/i })).toBeInTheDocument();
    expect(screen.getByTestId('vertical-session-track')).toBeInTheDocument();

    // Sessão 1: Concluída +70 XP com link 'Revisar'
    const badge1 = screen.getByTestId('session-badge-1');
    expect(badge1).toHaveTextContent(/concluída \+70 XP/i);
    expect(badge1).toHaveTextContent(/5\/5/);
    expect(screen.getByRole('link', { name: /^revisar$/i })).toHaveAttribute(
      'href',
      '/licao/sinalizacao?sessao=1'
    );

    // Sessão 2: Próxima sessão • Disponível com link 'Iniciar'
    const badge2 = screen.getByTestId('session-badge-2');
    expect(badge2).toHaveTextContent(/próxima sessão/i);
    expect(badge2).toHaveTextContent(/disponível/i);
    const iniciarLinks = screen.getAllByRole('link', { name: /iniciar/i });
    expect(iniciarLinks.length).toBeGreaterThanOrEqual(1);

    // CTA principal aponta para "Próxima sessão (Sessão 2)"
    const ctaLink = screen.getByTestId('primary-unit-cta');
    expect(ctaLink).toHaveTextContent('Próxima sessão (Sessão 2)');
    expect(ctaLink).toHaveAttribute('href', '/licao/sinalizacao?sessao=2');
  });
});
