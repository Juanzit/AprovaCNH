import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  TrackUnitCard,
  getPrimaryCtaConfig,
  calculateUnitProgressPercent,
} from '@/features/progress/components/TrackUnitCard';
import type { LessonSessionProgress } from '@/features/progress/types/progress';

describe('TrackUnitCard (Sua Próxima Atividade, Estados Semânticos e Trilha Vertical)', () => {
  const baseSessions: LessonSessionProgress[] = [
    {
      sessionId: 1,
      topic: 'Sinalização de Trânsito',
      status: 'available',
      score: 0,
      maxScore: 5,
      xpEarned: 0,
      completedAt: null,
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

  it('calcula somente sessões únicas completed da Unidade 1 (2/4 = 50%)', () => {
    const twoCompleted = baseSessions.map((session) =>
      session.sessionId <= 2 ? { ...session, status: 'completed' as const } : session
    );

    expect(calculateUnitProgressPercent(twoCompleted)).toBe(50);
    expect(calculateUnitProgressPercent([
      ...twoCompleted,
      { ...twoCompleted[0], sessionId: 3, status: 'in_progress' },
      { ...twoCompleted[0], sessionId: 9, status: 'completed' },
      twoCompleted[0],
    ])).toBe(50);
  });

  it('exibe "Começar primeira sessão" e tempo estimado "~3 min" quando o progresso é 0/4', () => {
    const cta = getPrimaryCtaConfig(baseSessions);
    expect(cta.label).toBe('Começar primeira sessão');
    expect(cta.estimatedTime).toBe('~3 min');
    expect(cta.href).toBe('/licao/sinalizacao?sessao=1');

    render(<TrackUnitCard sessions={baseSessions} />);
    expect(screen.getByTestId('next-activity-card')).toBeInTheDocument();
    expect(screen.getByTestId('next-activity-time')).toHaveTextContent('~3 min');
    expect(screen.getByTestId('primary-unit-cta')).toHaveTextContent('Começar primeira sessão');
    expect(screen.getByTestId('session-badge-1')).toHaveTextContent('Não iniciada');
  });

  it('exibe "Continuar estudando (Sessão X)" quando uma sessão está in_progress', () => {
    const inProgressSessions: LessonSessionProgress[] = baseSessions.map((s) =>
      s.sessionId === 2 ? { ...s, status: 'in_progress' } : s
    );

    const cta = getPrimaryCtaConfig(inProgressSessions);
    expect(cta.label).toBe('Continuar estudando (Sessão 2)');
    expect(cta.href).toBe('/licao/sinalizacao?sessao=2');

    render(<TrackUnitCard sessions={inProgressSessions} />);
    expect(screen.getByTestId('session-badge-2')).toHaveTextContent('Em andamento');
  });

  it('exibe "Próxima sessão (Sessão X)" quando pelo menos 1 sessão foi concluída', () => {
    const partialSessions: LessonSessionProgress[] = baseSessions.map((s) =>
      s.sessionId === 1
        ? { ...s, status: 'completed', score: 5, xpEarned: 70, completedAt: '2026-11-08T12:00:00Z' }
        : s
    );

    const cta = getPrimaryCtaConfig(partialSessions);
    expect(cta.label).toBe('Próxima sessão (Sessão 2)');
    expect(cta.href).toBe('/licao/sinalizacao?sessao=2');
  });

  it('exibe "Revisar unidade" quando todas as 4/4 sessões estão concluídas (100%)', () => {
    const allCompleted: LessonSessionProgress[] = baseSessions.map((s) => ({
      ...s,
      status: 'completed',
      score: 5,
      xpEarned: 70,
      completedAt: '2026-11-08T12:00:00Z',
    }));

    const cta = getPrimaryCtaConfig(allCompleted);
    expect(cta.label).toBe('Revisar unidade');
    expect(cta.href).toBe('/licao/sinalizacao?sessao=1');
  });

  it('renderiza os 4 estados semânticos das sessões (Não iniciada, Em andamento, Concluída, Revisão necessária) e botões secundários discretos', () => {
    const mixedSessions: LessonSessionProgress[] = [
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
        status: 'completed',
        score: 3,
        maxScore: 5,
        xpEarned: 50,
        completedAt: '2026-11-08T13:00:00Z',
      },
      {
        sessionId: 3,
        topic: 'Sinalização de Trânsito',
        status: 'in_progress',
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

    render(
      <TrackUnitCard
        sessions={mixedSessions}
        reviewNeededSessionIds={[2]}
      />
    );

    expect(screen.getByTestId('vertical-session-track')).toBeInTheDocument();
    expect(screen.getByTestId('session-badge-1')).toHaveTextContent('Concluída +70 XP');
    expect(screen.getByTestId('session-badge-2')).toHaveTextContent('Revisão necessária');
    expect(screen.getByTestId('session-badge-3')).toHaveTextContent('Em andamento');
    expect(screen.getByTestId('session-badge-4')).toHaveTextContent('Não iniciada');

    // Botões secundários discretos
    expect(screen.getByTestId('session-action-1')).toHaveTextContent('Revisar');
    expect(screen.getByTestId('session-action-2')).toHaveTextContent('Reforçar');
    expect(screen.getByTestId('session-action-3')).toHaveTextContent('Retomar');
    expect(screen.getByTestId('session-action-4')).toHaveTextContent('Praticar');
  });
});
