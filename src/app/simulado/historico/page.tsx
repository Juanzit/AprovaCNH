import Link from 'next/link';
import { getSimuladoHistory } from '@/features/simulado/server/simuladoRepository';
import { SimuladoHistoryList } from '@/features/simulado/components/SimuladoHistoryList';

export const dynamic = 'force-dynamic';

export default async function SimuladoHistoricoPage() {
  const history = await getSimuladoHistory();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-5 py-5 sm:py-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
            DETRAN-MG / SENATRAN • Resolução CONTRAN nº 1.020/2025
          </span>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
            Histórico de Simulados Oficiais
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Acompanhe sua evolução nas provas simuladas de 30 questões (nota de corte: 20 acertos).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/simulado"
            className="inline-flex items-center justify-center min-h-10 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
          >
            ← Regras do Simulado
          </Link>
          <Link
            href="/simulado/prova"
            className="inline-flex items-center justify-center min-h-10 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold"
          >
            Novo Simulado →
          </Link>
        </div>
      </div>

      <SimuladoHistoryList serverHistory={history} />
    </div>
  );
}
