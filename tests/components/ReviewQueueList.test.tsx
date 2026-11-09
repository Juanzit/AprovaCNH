import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ReviewQueueList } from '@/features/review/components/ReviewQueueList';
import type { ReviewItem } from '@/features/review/types/review';

describe('ReviewQueueList Component (Fila Explicável de Repetição Espaçada)', () => {
  it('renderiza empty state amigável quando a fila de revisão está vazia', () => {
    render(<ReviewQueueList queue={[]} />);

    expect(screen.getByText(/Nenhuma revisão pendente no momento!/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir para a Trilha de Aprendizagem/i })).toBeInTheDocument();
  });

  it('renderiza os itens da fila com justificativas pedagógicas transparentes', () => {
    const mockQueue: ReviewItem[] = [
      {
        question: {
          id: 'sin-001',
          version: 1,
          statement: 'Qual é a prevalência das ordens do agente de trânsito?',
          options: [
            { id: 'a', text: 'Opção A' },
            { id: 'b', text: 'Opção B' },
            { id: 'c', text: 'Opção C' },
            { id: 'd', text: 'Opção D' },
          ],
          topic: 'Sinalização de Trânsito',
          subtopic: 'Ordens do Agente',
          ufs: [],
          categories: ['A', 'B'],
          status: 'aprovada',
          isExample: false,
          source: {
            kind: 'official',
            document: 'MBFT',
            provision: 'Art. 195',
            url: 'https://gov.br',
            checkedAt: '2026-11-07',
            effectiveFrom: '2023-01-02',
            effectiveUntil: null,
            sourceVersion: '1',
            licenseNote: 'Domínio Público',
            verificationStatus: 'verified',
          },
        },
        stats: {
          questionId: 'sin-001',
          totalAttempts: 1,
          correctAttempts: 0,
          incorrectAttempts: 1,
          errorRate: 1.0,
          lastIsCorrect: false,
          lastAnsweredAt: '2026-11-08T10:00:00Z',
          consecutiveCorrect: 0,
          priorityScore: 140,
          idealIntervalDays: 0,
          daysSinceLastAnswer: 0.1,
          isOverdue: true,
          explanationReason: 'Você errou esta questão na última tentativa',
        },
      },
    ];

    render(<ReviewQueueList queue={mockQueue} />);

    expect(screen.getByText(/Fila de Questões Prioritárias/i)).toBeInTheDocument();
    expect(screen.getByText('sin-001')).toBeInTheDocument();
    expect(screen.getByText(/Qual é a prevalência das ordens do agente de trânsito\?/i)).toBeInTheDocument();
    expect(screen.getByText(/• Você errou esta questão na última tentativa/i)).toBeInTheDocument();
  });
});
