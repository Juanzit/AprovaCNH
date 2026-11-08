import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { StudentHeader } from '@/features/progress/components/StudentHeader';
import type { StudentProfile } from '@/features/progress/types/progress';

vi.mock('@/features/progress/actions/sessionActions', () => ({
  updateStudentProfileAction: vi.fn().mockResolvedValue({
    success: false,
    error: 'Usuário não autenticado.',
  }),
}));

describe('StudentHeader (Gamificação, Streak Semanal e Perfil Visitante MG)', () => {
  const mockGuestProfile: StudentProfile = {
    id: 'guest',
    email: 'visitante@aprovacnh.com.br',
    fullName: 'Estudante Visitante',
    uf: 'MG',
    targetCategory: 'B',
    role: 'student',
    xpTotal: 210,
    currentStreak: 3,
    longestStreak: 5,
    lastActivityDate: '2026-11-08',
  };

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renderiza corretamente a UF padrão MG (MG • DETRAN-MG / Nacional), streak semanal e dados do aluno', () => {
    render(<StudentHeader initialProfile={mockGuestProfile} />);

    expect(screen.getByRole('heading', { name: /estudante visitante/i })).toBeInTheDocument();
    expect(screen.getByText('visitante@aprovacnh.com.br')).toBeInTheDocument();

    const ufBadge = screen.getByTestId('student-uf-badge');
    expect(ufBadge).toHaveTextContent('MG • DETRAN-MG / Nacional');

    const catBadge = screen.getByTestId('student-category-badge');
    expect(catBadge).toHaveTextContent(/Cat\. B/);

    const streakBadge = screen.getByTestId('student-streak-badge');
    expect(streakBadge).toHaveTextContent(/3 dias/);

    const xpBadge = screen.getByTestId('student-xp-badge');
    expect(xpBadge).toHaveTextContent(/210 XP/);

    const weeklyTracker = screen.getByTestId('weekly-streak-tracker');
    expect(weeklyTracker).toBeInTheDocument();
    expect(weeklyTracker).toHaveAttribute('aria-label', 'Hábito semanal: 3 de 7 dias ativos');
  });

  it('permite ao Estudante Visitante salvar Nome, UF e Categoria no localStorage sem erro de autenticação', async () => {
    render(<StudentHeader initialProfile={mockGuestProfile} />);

    const editButton = screen.getByRole('button', { name: /editar dados do perfil/i });
    fireEvent.click(editButton);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/nome de estudante/i);
    fireEvent.change(nameInput, { target: { value: 'Juan Estudante MG' } });

    const catSelect = screen.getByLabelText(/categoria cnh/i);
    fireEvent.change(catSelect, { target: { value: 'AB' } });

    const saveBtn = screen.getByRole('button', { name: /salvar alterações/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /Juan Estudante MG/i })).toBeInTheDocument();
    expect(screen.getByTestId('student-category-badge')).toHaveTextContent('Cat. AB');
    expect(screen.getByTestId('student-uf-badge')).toHaveTextContent(
      'MG • DETRAN-MG / Nacional'
    );
  });
});
