import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginPage from '@/app/login/page';
import RegisterPage from '@/app/cadastro/page';
import { translateSupabaseAuthError } from '@/features/auth/utils/authErrorMapper';

const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockResend = vi.fn();
const mockResetPasswordForEmail = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      resend: mockResend,
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  })),
}));

describe('Telas de Autenticação (Segurança de Senha, Tradução de Erros e Fluxos)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'test-user-id' }, session: null },
      error: null,
    });
    mockResend.mockResolvedValue({ error: null });
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
  });

  it('traduz erros do Supabase em inglês para mensagens claras em português', () => {
    const unconfirmed = translateSupabaseAuthError('Email not confirmed');
    expect(unconfirmed.isEmailNotConfirmed).toBe(true);
    expect(unconfirmed.message).toContain('Seu e-mail ainda não foi confirmado');

    const invalid = translateSupabaseAuthError('Invalid login credentials');
    expect(invalid.isEmailNotConfirmed).toBe(false);
    expect(invalid.message).toBe('E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
  });

  it('inicia senha oculta, limpa estado após submissão e traduz Invalid login credentials', async () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /entrar na sua conta/i })).toBeInTheDocument();
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha de acesso/i);
    const toggleBtn = screen.getByTestId('toggle-password-visibility');
    const submitBtn = screen.getByRole('button', { name: /entrar/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    // Alterna visibilidade da senha e verifica que reseta ao submeter
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.change(emailInput, { target: { value: 'aluno@teste.com' } });
    fireEvent.change(passwordInput, { target: { value: 'errada123' } });
    fireEvent.click(submitBtn);

    // Senha limpa imediatamente e volta para type="password"
    expect(passwordInput).toHaveValue('');
    expect(passwordInput).toHaveAttribute('type', 'password');

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/E-mail ou senha incorretos/i);
    });
  });

  it('exibe botão Reenviar confirmação quando o login retorna Email not confirmed e permite recuperar senha', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Email not confirmed' },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'pendente@teste.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha de acesso/i), {
      target: { value: 'senha123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Seu e-mail ainda não foi confirmado/i
      );
    });

    const resendBtn = screen.getByTestId('resend-confirmation-login-btn');
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(mockResend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'pendente@teste.com',
      });
    });

    // Testa recuperação de senha ("Esqueceu sua senha?")
    const forgotBtn = screen.getByTestId('forgot-password-button');
    fireEvent.click(forgotBtn);

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('pendente@teste.com');
      expect(screen.getByTestId('login-status-message')).toHaveTextContent(
        /instruções de recuperação de senha/i
      );
    });
  });

  it('oculta o formulário e renderiza estado dedicado Cadastro realizado! após cadastro bem-sucedido', async () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /criar conta de estudante/i })).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha de acesso/i);
    const submitBtn = screen.getByRole('button', { name: /criar minha conta/i });

    // Testa validação de tamanho mínimo de senha
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/mínimo 6 caracteres/i);
    });
    expect(passwordInput).toHaveValue('');

    // Submete cadastro válido
    fireEvent.change(nameInput, { target: { value: 'Maria Estudante' } });
    fireEvent.change(emailInput, { target: { value: 'maria@teste.com' } });
    fireEvent.change(passwordInput, { target: { value: 'senhaSegura123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('signup-confirmation-state')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /Cadastro realizado!/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Solicitação de cadastro processada/i)
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/senha de acesso/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voltar para entrar/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });
});
