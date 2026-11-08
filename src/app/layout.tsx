import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'AprovaCNH — Lição Piloto e Autenticação',
  description: 'Plataforma de aprendizagem guiada para preparação teórica da CNH.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white py-3 px-4 shadow-xs">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <Link
              href="/"
              className="font-bold text-slate-900 tracking-tight flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1"
            >
              <span aria-hidden="true">🚗</span>
              <span>
                Aprova<span className="text-blue-700">CNH</span>
              </span>
            </Link>
            <nav aria-label="Navegação da conta" className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-2 py-1 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 rounded-lg px-2.5 py-1 transition-colors shadow-xs"
              >
                Cadastrar
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center">
          {children}
        </main>

        <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white">
          AprovaCNH (Nome provisório) — Não oficial. Sem vínculo com DETRAN/CONTRAN/Senatran.
        </footer>
      </body>
    </html>
  );
}
