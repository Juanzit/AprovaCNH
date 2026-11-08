'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(
          error.message === 'Invalid login credentials'
            ? 'Credenciais inválidas. Verifique seu e-mail e senha.'
            : `Erro ao autenticar: ${error.message}`
        );
        setIsLoading(false);
        return;
      }

      router.push('/licao/sinalizacao');
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro inesperado ao conectar ao serviço de autenticação.'
      );
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-black text-blue-700 tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-md p-1"
          >
            <span>🚗</span>
            <span>AprovaCNH</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Entrar na sua conta
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Acesse suas lições oficiais e acompanhe seu progresso de estudo.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {errorMessage && (
                <div
                  id="login-error-alert"
                  role="alert"
                  aria-live="polite"
                  className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3"
                >
                  <span className="text-lg leading-none select-none" aria-hidden="true">
                    ⚠️
                  </span>
                  <div>
                    <strong className="font-semibold block">Atenção</strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email-input"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  E-mail institucional ou pessoal
                </label>
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
                  aria-describedby={errorMessage ? 'login-error' : undefined}
                />
              </div>

              <div>
                <label
                  htmlFor="password-input"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Senha de acesso
                </label>
                <input
                  id="password-input"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
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

            <div className="mt-6 border-t border-slate-100 pt-6 text-center space-y-3">
              <p className="text-sm text-slate-600">
                Não tem uma conta ainda?{' '}
                <Link
                  href="/cadastro"
                  className="font-bold text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1"
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
    </main>
  );
}
