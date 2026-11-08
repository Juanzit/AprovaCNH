import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandLogoIcon } from '@/components/ui/Icons';
import './globals.css';

export const metadata: Metadata = {
  title: 'AprovaCNH — Plataforma de Estudo Guiado para CNH',
  description: 'Plataforma independente de aprendizagem guiada e repetição espaçada para preparação teórica da CNH.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white py-3 px-4 sm:px-6 shadow-xs sticky top-0 z-30">
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                href="/"
                className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg py-1 px-1"
              >
                <BrandLogoIcon className="w-7 h-7 shrink-0" />
                <span>
                  Aprova<span className="text-blue-700">CNH</span>
                </span>
              </Link>

              <nav
                aria-label="Navegação principal"
                className="flex items-center gap-1 sm:gap-2"
              >
                <Link
                  href="/"
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  Início
                </Link>
                <Link
                  href="/revisao"
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  Revisão
                </Link>
              </nav>
            </div>

            <nav aria-label="Navegação da conta" className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg px-2.5 py-1.5 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 rounded-lg px-3 py-1.5 transition-colors shadow-xs"
              >
                Cadastrar
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full flex flex-col justify-center">
          {children}
        </main>

        <footer className="py-4 px-4 text-center text-xs text-slate-600 border-t border-slate-200/80 bg-white">
          AprovaCNH — Plataforma independente de estudo guiado. Sem vínculo com DETRAN, CONTRAN ou SENATRAN.
        </footer>
      </body>
    </html>
  );
}
