import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandLogoIcon, BookOpenIcon, RefreshCwIcon, AwardIcon } from '@/components/ui/Icons';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import './globals.css';

export const metadata: Metadata = {
  title: 'AprovaCNH — Plataforma Premium de Preparação para CNH',
  description: 'Plataforma educacional independente de aprendizagem guiada, repetição espaçada e simulados oficiais para preparação teórica da CNH.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme-mode') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-[#F5F7FB] text-slate-900 antialiased overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
        {/* Header Institucional com Visual SaaS Moderno */}
        <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md py-3 px-4 sm:px-6 sticky top-0 z-40 shadow-xs">
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3">
            {/* Logo e Identidade Visual */}
            <div className="flex items-center gap-4 sm:gap-8 min-w-0">
              <Link
                href="/"
                className="font-extrabold text-base sm:text-xl text-slate-900 tracking-tight flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-xl py-1 px-1 shrink-0 group transition-all"
              >
                <div className="p-1 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <BrandLogoIcon className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
                </div>
                <span className="flex items-center gap-1 font-black">
                  <span>Aprova</span>
                  <span className="text-blue-600">CNH</span>
                  <span className="hidden lg:inline-block ml-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 uppercase tracking-widest border border-blue-200/60">
                    Edu
                  </span>
                </span>
              </Link>

              {/* Navegação Principal */}
              <nav
                aria-label="Navegação principal"
                className="flex items-center gap-1 sm:gap-2"
              >
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 transition-all"
                >
                  <BookOpenIcon className="w-4 h-4 text-slate-500" />
                  <span>Trilha</span>
                </Link>
                <Link
                  href="/revisao"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 transition-all"
                >
                  <RefreshCwIcon className="w-4 h-4 text-slate-500" />
                  <span>Revisão</span>
                </Link>
                <Link
                  href="/simulado"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 transition-all"
                >
                  <AwardIcon className="w-4 h-4 text-slate-500" />
                  <span>Simulado</span>
                </Link>
              </nav>
            </div>

            {/* Ações de Usuário e Tema */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <ThemeToggle />

              <nav aria-label="Navegação da conta" className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 transition-all"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 transition-all shadow-xs"
                >
                  Cadastrar
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Conteúdo Dinâmico */}
        <main className="flex-1 w-full flex flex-col justify-start">
          {children}
        </main>

        {/* Rodapé Moderno e Institucional */}
        <footer className="py-6 px-4 border-t border-slate-200/80 bg-white text-slate-500 text-xs">
          <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="font-extrabold text-slate-900">AprovaCNH</span>
              <span className="hidden sm:inline">•</span>
              <span>AprovaCNH — Plataforma independente de estudo guiado. Sem vínculo com DETRAN, CONTRAN ou SENATRAN.</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <Link href="/revisao" className="hover:text-blue-600 transition-colors">Prática Espaçada</Link>
              <Link href="/simulado" className="hover:text-blue-600 transition-colors">Simulados Oficiais</Link>
              <span>Resoluções CONTRAN nº 973/2022 e nº 1.020/2025</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
