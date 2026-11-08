'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BrandLogoIcon, EyeIcon, EyeOffIcon } from '@/components/ui/Icons';
import { translateSupabaseAuthError } from '@/features/auth/utils/authErrorMapper';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsEmailNotConfirmed(false);

    // Proteção estrita: oculta imediatamente a senha e limpa o estado após capturar o valor para envio
    setShowPassword(false);
    const submittedPassword = password;
    setPassword('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: submittedPassword,
      });

      if (error) {
        const translated = translateSupabaseAuthError(error.message);
        setErrorMessage(translated.message);
        setIsEmailNotConfirmed(translated.isEmailNotConfirmed);
        setIsLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setErrorMessage(
        'Não foi possível conectar ao serviço de autenticação. Verifique sua conexão e tente novamente.'
      );
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setErrorMessage('Informe seu e-mail no campo abaixo para reenviar o link de confirmação.');
      return;
    }

    setIsResending(true);
    setStatusMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend?.({
        type: 'signup',
        email: email.trim(),
      }) ?? { error: null };

      if (error) {
        const translated = translateSupabaseAuthError(error.message);
        setErrorMessage(translated.message);
      } else {
        setStatusMessage(
          'Novo e-mail de confirmação enviado! Verifique sua caixa de entrada e a pasta de spam.'
        );
      }
    } catch {
      setErrorMessage('Não foi possível reenviar o e-mail de confirmação agora. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMessage(null);
    setStatusMessage(null);

    if (!email.trim()) {
      setErrorMessage(
        'Informe seu e-mail no campo abaixo para enviarmos o link de recuperação de senha.'
      );
      return;
    }

    setIsResettingPassword(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail?.(email.trim()) ?? {
        error: null,
      };

      if (error) {
        const translated = translateSupabaseAuthError(error.message);
        setErrorMessage(translated.message);
      } else {
        setStatusMessage(
          'Enviamos as instruções de recuperação de senha para seu e-mail. Verifique sua caixa de entrada.'
        );
      }
    } catch {
      setErrorMessage('Não foi possível solicitar a recuperação de senha no momento.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="w-full py-8 sm:py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-[400px] mx-auto">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-black text-slate-900 tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg p-1"
          >
            <BrandLogoIcon className="w-8 h-8 shrink-0" />
            <span>
              Aprova<span className="text-blue-700">CNH</span>
            </span>
          </Link>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
            Entrar na sua conta
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Acesse sua trilha guiada e acompanhe sua evolução de estudo.
          </p>
        </div>

        <div className="w-full bg-white py-7 px-6 sm:px-8 shadow-sm border border-slate-200 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {errorMessage && (
              <div
                id="login-error-alert"
                role="alert"
                aria-live="polite"
                className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm space-y-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-base leading-none select-none mt-0.5" aria-hidden="true">
                    ⚠️
                  </span>
                  <div className="flex-1">
                    <strong className="font-bold block">Atenção</strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>

                {isEmailNotConfirmed && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={isResending}
                      data-testid="resend-confirmation-login-btn"
                      className="w-full min-h-10 py-2 px-3 rounded-lg bg-white hover:bg-red-100/60 text-red-900 border border-red-300 font-bold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      {isResending ? 'Reenviando confirmação...' : 'Reenviar confirmação'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {statusMessage && (
              <div
                data-testid="login-status-message"
                role="status"
                aria-live="polite"
                className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-2.5"
              >
                <span className="text-base leading-none select-none mt-0.5" aria-hidden="true">
                  ✅
                </span>
                <div>
                  <strong className="font-bold block">Solicitação enviada</strong>
                  <span>{statusMessage}</span>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email-input"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                E-mail institucional ou pessoal
              </label>
              <input
                id="email-input"
                name="email"
                type="email"
                autoComplete="username"
                spellCheck={false}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full min-h-11 px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                aria-describedby={errorMessage ? 'login-error-alert' : undefined}
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label
                  htmlFor="password-input"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Senha de acesso
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResettingPassword}
                  data-testid="forgot-password-button"
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 py-0.5"
                >
                  {isResettingPassword ? 'Enviando...' : 'Esqueceu sua senha?'}
                </button>
              </div>

              <div className="relative">
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-11 pl-3.5 pr-11 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  data-testid="toggle-password-visibility"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-11 flex items-center justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    <span>Autenticando...</span>
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center space-y-3">
            <p className="text-sm text-slate-600">
              Não tem uma conta ainda?{' '}
              <Link
                href="/cadastro"
                className="font-bold text-blue-700 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1"
              >
                Cadastre-se gratuitamente
              </Link>
            </p>

            <div>
              <Link
                href="/licao/sinalizacao"
                className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 rounded px-1"
              >
                ← Explorar lição sem cadastro (Modo Visitante)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
