'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BrandLogoIcon, CheckIcon, EyeIcon, EyeOffIcon } from '@/components/ui/Icons';
import { translateSupabaseAuthError } from '@/features/auth/utils/authErrorMapper';

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [uf, setUf] = useState('MG');
  const [category, setCategory] = useState('B');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [isRegistrationCompleted, setIsRegistrationCompleted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsDuplicateEmail(false);
    setResendFeedback(null);
    setShowPassword(false);

    if (password.length < 6) {
      setPassword('');
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    // Captura e limpa imediatamente a senha da memória/formulário
    const submittedPassword = password;
    const submittedEmail = email.trim();
    setPassword('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: submittedEmail,
        password: submittedPassword,
        options: {
          data: {
            full_name: fullName.trim(),
            uf: uf || null,
            target_category: category,
          },
        },
      });

      if (error) {
        const translated = translateSupabaseAuthError(error.message);
        setErrorMessage(translated.message);
        setIsLoading(false);
        return;
      }

      if (data.user?.identities?.length === 0) {
        setIsDuplicateEmail(true);
        setErrorMessage('Este e-mail já possui cadastro. Faça login na sua conta.');
        setIsLoading(false);
        return;
      }

      if (data.session) {
        router.replace('/');
        router.refresh();
      } else {
        setRegisteredEmail(submittedEmail);
        setFullName('');
        setEmail('');
        setIsRegistrationCompleted(true);
        setIsLoading(false);
      }
    } catch {
      setErrorMessage(
        'Não foi possível processar seu cadastro no momento. Verifique sua conexão e tente novamente.'
      );
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!registeredEmail) return;

    setIsResending(true);
    setResendFeedback(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
      });

      if (error) {
        const translated = translateSupabaseAuthError(error.message);
        setResendFeedback(translated.message);
      } else {
        setResendFeedback(
          'Solicitação aceita pelo serviço de autenticação. Verifique a caixa de entrada e spam; a entrega depende da configuração de e-mail do projeto.'
        );
      }
    } catch {
      setResendFeedback('Não foi possível reenviar o e-mail no momento. Tente novamente em instantes.');
    } finally {
      setIsResending(false);
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

          {!isRegistrationCompleted && (
            <>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
                Criar conta de estudante
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                Cadastre-se para praticar com questões baseadas no MBFT e salvar sua evolução.
              </p>
            </>
          )}
        </div>

        <div className="w-full bg-white py-7 px-6 sm:px-8 shadow-sm border border-slate-200 rounded-2xl">
          {isRegistrationCompleted ? (
            <div
              data-testid="signup-confirmation-state"
              role="status"
              aria-live="polite"
              className="text-center space-y-5 py-2"
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                <CheckIcon className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold text-slate-900">
                  Cadastro realizado!
                </h1>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Solicitação de cadastro processada. Se a confirmação por e-mail estiver habilitada, o Supabase tentará enviar um link para este endereço. Confira também a caixa de spam.
                </p>
                {registeredEmail && (
                  <p className="text-xs font-bold text-slate-500">
                    Endereço informado: <span className="text-slate-800">{registeredEmail}</span>
                  </p>
                )}
              </div>

              {resendFeedback && (
                <div
                  data-testid="resend-confirmation-feedback"
                  className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold"
                >
                  {resendFeedback}
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <Link
                  href="/login"
                  className="w-full min-h-11 flex items-center justify-center py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  Voltar para entrar
                </Link>

                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={isResending}
                  data-testid="resend-signup-email-btn"
                  className="w-full min-h-11 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {isResending ? 'Reenviando e-mail...' : 'Reenviar e-mail de confirmação'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {errorMessage && (
                  <div
                    id="cadastro-error-alert"
                    role="alert"
                    aria-live="polite"
                    className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-2.5"
                  >
                    <span className="text-base leading-none select-none mt-0.5" aria-hidden="true">
                      ⚠️
                    </span>
                    <div>
                      <strong className="font-bold block">Atenção</strong>
                      <span>{errorMessage}</span>
                      {isDuplicateEmail && (
                        <Link
                          href="/login"
                          className="mt-2 inline-flex items-center justify-center rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800"
                        >
                          Ir para o login
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="name-input"
                    className="block text-sm font-semibold text-slate-800 mb-1"
                  >
                    Nome completo
                  </label>
                  <input
                    id="name-input"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full min-h-11 px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email-input"
                    className="block text-sm font-semibold text-slate-800 mb-1"
                  >
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email-input"
                    name="email"
                    type="email"
                    autoComplete="email"
                    spellCheck={false}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full min-h-11 px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password-input"
                    className="block text-sm font-semibold text-slate-800 mb-1"
                  >
                    Senha de acesso (mínimo 6 caracteres) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password-input"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={6}
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="uf-select"
                      className="block text-sm font-semibold text-slate-800 mb-1"
                    >
                      Estado (UF)
                    </label>
                    <select
                      id="uf-select"
                      name="uf"
                      value={uf}
                      onChange={(e) => setUf(e.target.value)}
                      className="w-full min-h-11 px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                    >
                      <option value="">Nacional / Padrão</option>
                      {UF_OPTIONS.map((sigla) => (
                        <option key={sigla} value={sigla}>
                          {sigla}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="cat-select"
                      className="block text-sm font-semibold text-slate-800 mb-1"
                    >
                      Categoria CNH
                    </label>
                    <select
                      id="cat-select"
                      name="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full min-h-11 px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                    >
                      <option value="B">B — Carro</option>
                      <option value="A">A — Moto</option>
                      <option value="AB">AB — Carro e Moto</option>
                      <option value="C">C — Carga</option>
                      <option value="D">D — Passageiros</option>
                      <option value="E">E — Articulados</option>
                    </select>
                  </div>
                </div>

                <div className="pt-1">
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
                        <span>Criando conta...</span>
                      </span>
                    ) : (
                      'Criar minha conta'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-5 text-center space-y-3">
                <p className="text-sm text-slate-600">
                  Já possui uma conta?{' '}
                  <Link
                    href="/login"
                    className="font-bold text-blue-700 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1"
                  >
                    Faça login
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
