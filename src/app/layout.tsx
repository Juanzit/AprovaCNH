import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AprovaCNH — Lição Piloto',
  description: 'Plataforma de aprendizagem guiada para preparação teórica da CNH.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col justify-between">
        <header className="border-b border-slate-200 bg-white py-3 px-4">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <span className="font-bold text-slate-900 tracking-tight">
              Aprova<span className="text-blue-700">CNH</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
              Fatia T001
            </span>
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
