import {
  getActiveExamConfig,
  getSimuladoHistory,
} from '@/features/simulado/server/simuladoRepository';
import { getApprovedQuestionsByTopic } from '@/features/lesson/server/questionRepository';
import { SimuladoHistoryList } from '@/features/simulado/components/SimuladoHistoryList';
import { SimuladoDurationSelector } from '@/features/simulado/components/SimuladoDurationSelector';

export const dynamic = 'force-dynamic';

export default async function SimuladoLobbyPage() {
  const [config, history, approvedQuestions] = await Promise.all([
    getActiveExamConfig('MG'),
    getSimuladoHistory(),
    getApprovedQuestionsByTopic('Sinalização de Trânsito'),
  ]);

  const availableCount = approvedQuestions.length;
  const isUnavailable = availableCount < config.totalQuestions;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-5 py-5 sm:py-7 space-y-6">
      <section
        aria-labelledby="simulado-lobby-heading"
        className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-extrabold">
              Treino Temático • Sinalização de Trânsito
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {config.normativeAct}
            </span>
          </div>

          <h1
            id="simulado-lobby-heading"
            className="text-xl sm:text-2xl font-extrabold text-slate-900"
          >
            Simulado Temático — Sinalização de Trânsito
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Treino prático focado nas 30 questões do módulo de Sinalização de Trânsito e Normas de Circulação.
            Durante a prova, não há dicas nem correção imediata: você pode navegar livremente entre as questões,
            marcar itens para revisar e conferir o gabarito comentado da plataforma com fundamentação legal ao entregar.
          </p>
        </div>

        {/* Nota Institucional e Limitação do Acervo (T001 / T004) */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-1.5">
          <strong className="font-extrabold block text-amber-900">
            Aviso importante sobre este Simulado Temático:
          </strong>
          <p className="text-amber-900/90 leading-relaxed">
            Esta é uma ferramenta independente de preparação e fixação de conteúdo desenvolvida pela plataforma AprovaCNH.
            O acervo atual é composto por <strong>30 questões temáticas exclusivas de Sinalização e Normas de Circulação</strong>.
            Ele <strong>não reproduz necessariamente a distribuição multidisciplinar</strong> (Legislação, Direção Defensiva, Primeiros Socorros, Mecânica e Meio Ambiente)
            nem o conjunto de questões do exame oficial do DETRAN/SENATRAN.
          </p>
        </div>

        {/* Grade de Parâmetros de Treino da Plataforma (Res. CONTRAN 1.020/2025) */}
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
            <span className="text-xs text-slate-600">Acervo temático de Sinalização (4 opções)</span>
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
            <span className="text-xs text-slate-600">Padrão 60 min ou 120 min (PCD/TEA/TDAH)</span>
          </div>

          <div
            data-testid="rule-passing-score"
            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Meta da Plataforma
            </span>
            <strong className="mt-1 block text-xl font-extrabold text-emerald-700">
              {config.passingScore} acertos
            </strong>
            <span className="text-xs text-slate-600">Referência pedagógica (~70% do treino)</span>
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
              Ao concluir (ou quando o cronômetro chegar a zero), o gabarito comentado da plataforma
              com fundamentação legal no CTB e resoluções do CONTRAN será exibido.
            </li>
          </ul>
        </div>

        {isUnavailable && (
          <div
            role="alert"
            data-testid="simulado-insufficient-alert"
            className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm space-y-1"
          >
            <strong className="block font-extrabold text-amber-900">
              Simulado temporariamente indisponível:
            </strong>
            <p className="text-amber-900/90 leading-relaxed">
              Simulado indisponível no momento: o acervo possui {availableCount} questões aprovadas, sendo necessárias {config.totalQuestions}. Nossa equipe editorial está revisando novas questões.
            </p>
          </div>
        )}

        {/* Seletor de Duração (Padrão 60 min vs Tempo Dobrado 120 min Art. 33, § 2º) e CTA */}
        <SimuladoDurationSelector
          defaultDurationMinutes={config.durationMinutes}
          isUnavailable={isUnavailable}
          availableCount={availableCount}
          requiredCount={config.totalQuestions}
        />

        <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          Nota de transparência: A plataforma AprovaCNH é independente e não possui vínculo com o DETRAN ou a SENATRAN. O conteúdo baseia-se em normas e dispositivos legais de domínio público (Art. 8º, IV da Lei nº 9.610/1998).
        </p>
      </section>

      <section aria-labelledby="recent-simulados-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="recent-simulados-heading" className="text-base font-extrabold text-slate-900">
            Seus Treinos Recentes
          </h2>
        </div>
        <SimuladoHistoryList serverHistory={history} />
      </section>
    </div>
  );
}
