'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
  const [uf, setUf] = useState('');
  const [category, setCategory] = useState('B');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            uf: uf || null,
            target_category: category,
          },
        },
      });

      if (error) {
        setErrorMessage(`Falha no cadastro: ${error.message}`);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // Sessão criada imediatamente (confirmação desabilitada ou autologin)
        router.push('/licao/sinalizacao');
        router.refresh();
      } else {
        // Exige confirmação por e-mail
        setSuccessMessage(
          'Conta criada com sucesso! Verifique seu e-mail para confirmar a ativação da conta.'
        );
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro inesperado ao processar seu cadastro.'
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
            Criar conta de estudante
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Cadastre-se para praticar com questões oficiais baseadas no MBFT.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {errorMessage && (
                <div
                  id="cadastro-error-alert"
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

              {successMessage && (
                <div
                  role="status"
                  aria-live="polite"
                  className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3"
                >
                  <span className="text-lg leading-none select-none" aria-hidden="true">
                    ✅
                  </span>
                  <div>
                    <strong className="font-semibold block">Sucesso!</strong>
                    <span>{successMessage}</span>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="password-input"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Senha de acesso (mínimo 6 caracteres) <span className="text-red-500">*</span>
                </label>
                <input
                  id="password-input"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
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
                      <span>Criando conta...</span>
                    </span>
                  ) : (
                    'Criar minha conta'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-6 text-center space-y-3">
              <p className="text-sm text-slate-600">
                Já possui uma conta?{' '}
                <Link
                  href="/login"
                  className="font-bold text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1"
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
          </div>
        </div>
      </div>
    </main>
  );
}
