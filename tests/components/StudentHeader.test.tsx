import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StudentHeader } from '@/features/progress/components/StudentHeader';
import type { StudentProfile } from '@/features/progress/types/progress';

vi.mock('@/features/progress/actions/sessionActions', () => ({
  updateStudentProfileAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe('StudentHeader (Gamificação e Perfil Mobile-First)', () => {
  const mockProfile: StudentProfile = {
    id: 'usr-123',
    email: 'aluno.mg@aprovacnh.com.br',
    fullName: 'Maria da Silva',
    uf: 'MG',
    targetCategory: 'B',
    role: 'student',
    xpTotal: 210,
    currentStreak: 3,
    longestStreak: 5,
    lastActivityDate: '2026-11-08',
  };

  it('renderiza corretamente os badges de gamificação e dados do aluno', () => {
    render(<StudentHeader initialProfile={mockProfile} />);

    expect(screen.getByRole('heading', { name: /maria da silva/i })).toBeInTheDocument();
    expect(screen.getByText('aluno.mg@aprovacnh.com.br')).toBeInTheDocument();

    const ufBadge = screen.getByTestId('student-uf-badge');
    expect(ufBadge).toHaveTextContent(/DETRAN\/MG/);

    const catBadge = screen.getByTestId('student-category-badge');
    expect(catBadge).toHaveTextContent(/Cat\. B/);

    const streakBadge = screen.getByTestId('student-streak-badge');
    expect(streakBadge).toHaveTextContent(/3 dias/);

    const xpBadge = screen.getByTestId('student-xp-badge');
    expect(xpBadge).toHaveTextContent(/210 XP/);
  });

  it('abre o modal acessível de perfil ao clicar no botão Editar', () => {
    render(<StudentHeader initialProfile={mockProfile} />);

    const editButton = screen.getByRole('button', { name: /editar dados do perfil/i });
    fireEvent.click(editButton);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ajustar perfil de estudo/i })).toBeInTheDocument();
  });
});
