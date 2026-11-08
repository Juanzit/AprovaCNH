import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginPage from '@/app/login/page';
import RegisterPage from '@/app/cadastro/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' }, session: null },
        error: null,
      }),
    },
  })),
}));

describe('Telas de Autenticação (Acessibilidade e Fluxos)', () => {
  it('renderiza os campos acessíveis de login e exibe alerta em erro de credencial', async () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /entrar na sua conta/i })).toBeInTheDocument();
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitBtn = screen.getByRole('button', { name: /entrar/i });

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.change(emailInput, { target: { value: 'aluno@teste.com' } });
    fireEvent.change(passwordInput, { target: { value: 'errada123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/credenciais inválidas/i);
    });
  });

  it('renderiza formulário de cadastro com opções de UF e categoria CNH', async () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /criar conta de estudante/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha de acesso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/estado \(uf\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria cnh/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /criar minha conta/i });

    // Testa validação de tamanho mínimo de senha
    fireEvent.change(screen.getByLabelText(/senha de acesso/i), { target: { value: '123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/mínimo 6 caracteres/i);
    });
  });
});
