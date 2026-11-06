import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-10 md:py-16 text-center">
      <div className="inline-block p-2 px-3 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-4 border border-emerald-200">
        Fase 2 — Piloto Editorial de Sinalização
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
        Lição de Sinalização de Trânsito
      </h1>
      <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto">
        Pratique com questões oficiais e fundamentadas na legislação primária vigente: Código de Trânsito Brasileiro compilado (Arts. 80 a 90 e Anexo II) e Resolução CONTRAN nº 973/2022.
      </p>

      {/* Botão de ação principal */}
      <div className="mb-8">
        <Link
          href="/licao/sinalizacao"
          className="inline-flex w-full sm:w-auto items-center justify-center py-4 px-8 rounded-xl bg-blue-700 hover:bg-blue-800 font-bold text-white shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 text-base"
        >
          Iniciar lição de sinalização (Sessão 1)
        </Link>
      </div>

      {/* Módulos do piloto de 20 questões */}
      <div className="text-left bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Sessões Temáticas Disponíveis (20 Questões Aprovadas)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/licao/sinalizacao?sessao=1"
            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
          >
            <div className="text-xs font-semibold text-blue-700 mb-0.5">Sessão 1 (5 questões)</div>
            <div className="text-sm font-medium text-slate-900 group-hover:text-blue-900">
              Regras Gerais e Prevalência da Sinalização
            </div>
          </Link>

          <Link
            href="/licao/sinalizacao?sessao=2"
            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
          >
            <div className="text-xs font-semibold text-blue-700 mb-0.5">Sessão 2 (5 questões)</div>
            <div className="text-sm font-medium text-slate-900 group-hover:text-blue-900">
              Sinalização em Áreas Privadas e Vertical
            </div>
          </Link>

          <Link
            href="/licao/sinalizacao?sessao=3"
            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
          >
            <div className="text-xs font-semibold text-blue-700 mb-0.5">Sessão 3 (5 questões)</div>
            <div className="text-sm font-medium text-slate-900 group-hover:text-blue-900">
              Sinalização Horizontal e Padrões de Cores
            </div>
          </Link>

          <Link
            href="/licao/sinalizacao?sessao=4"
            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
          >
            <div className="text-xs font-semibold text-blue-700 mb-0.5">Sessão 4 (5 questões)</div>
            <div className="text-sm font-medium text-slate-900 group-hover:text-blue-900">
              Sinalização Semafórica, Sonora e Gestos
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
