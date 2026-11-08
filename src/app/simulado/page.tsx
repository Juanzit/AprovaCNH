import Link from 'next/link';
import {
  getActiveExamConfig,
  getSimuladoHistory,
} from '@/features/simulado/server/simuladoRepository';
import { SimuladoHistoryList } from '@/features/simulado/components/SimuladoHistoryList';

export const dynamic = 'force-dynamic';

export default async function SimuladoLobbyPage() {
  const [config, history] = await Promise.all([
    getActiveExamConfig('MG'),
    getSimuladoHistory(),
  ]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-5 py-5 sm:py-7 space-y-6">
      <section
        aria-labelledby="simulado-lobby-heading"
        className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-extrabold">
              {config.uf ?? 'MG'} • DETRAN-MG / SENATRAN
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {config.normativeAct}
            </span>
          </div>

          <h1
            id="simulado-lobby-heading"
            className="text-xl sm:text-2xl font-extrabold text-slate-900"
          >
            Simulado Oficial da Prova Teórica de 1ª Habilitação
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Experimente as condições reais do exame teórico oficial. Durante a prova, não há dicas
            nem correção imediata: você pode navegar livremente entre as questões, marcar itens para
            revisar e conferir o gabarito comentado completo ao entregar.
          </p>
        </div>

        {/* Grade de Parâmetros Regulatórios Vigentes (D007) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            data-testid="rule-total-questions"
            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total de Questões
            </span>
            <strong className="mt-1 block text-xl font-extrabold text-slate-900">
              {config.totalQuestions} questões
            </strong>
            <span className="text-xs text-slate-600">Múltipla escolha (4 alternativas)</span>
          </div>

          <div
            data-testid="rule-duration"
            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tempo de Duração
            </span>
            <strong className="mt-1 block text-xl font-extrabold text-slate-900">
              {config.durationMinutes} minutos
            </strong>
            <span className="text-xs text-slate-600">Cronômetro regressivo resiliente</span>
          </div>

          <div
            data-testid="rule-passing-score"
            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Nota de Corte
            </span>
            <strong className="mt-1 block text-xl font-extrabold text-emerald-700">
              {config.passingScore} acertos
            </strong>
            <span className="text-xs text-slate-600">Aprovação oficial (~70% da prova)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs sm:text-sm text-slate-800 space-y-1">
          <strong className="font-extrabold text-slate-900 block">
            Instruções importantes antes de começar:
          </strong>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>
              Use o <strong>Mapa da Prova (1 a 30)</strong> para saltar para qualquer questão ou
              conferir itens deixados em branco.
            </li>
            <li>
              Use o botão <strong>Marcar para revisar 🚩</strong> nas questões em que tiver dúvida
              para retornar a elas antes de entregar.
            </li>
            <li>
              Ao concluir (ou quando o tempo de 60 minutos chegar a zero), o gabarito comentado com
              fundamentação legal será exibido.
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/simulado/prova"
            data-testid="start-simulado-cta"
            className="inline-flex items-center justify-center min-h-12 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors shadow-xs"
          >
            Iniciar Simulado Oficial ({config.durationMinutes} min) →
          </Link>

          <Link
            href="/simulado/historico"
            className="inline-flex items-center justify-center min-h-12 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
          >
            Ver Histórico Completo
          </Link>
        </div>
      </section>

      <section aria-labelledby="recent-simulados-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="recent-simulados-heading" className="text-base font-extrabold text-slate-900">
            Seus Simulados Recentes
          </h2>
        </div>
        <SimuladoHistoryList serverHistory={history} />
      </section>
    </div>
  );
}
