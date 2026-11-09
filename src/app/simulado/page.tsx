import Link from 'next/link';
import {
  getActiveExamConfig,
  getSimuladoHistory,
} from '@/features/simulado/server/simuladoRepository';
import { getApprovedQuestionsByTopic } from '@/features/lesson/server/questionRepository';
import { SimuladoHistoryList } from '@/features/simulado/components/SimuladoHistoryList';
import { SimuladoDurationSelector } from '@/features/simulado/components/SimuladoDurationSelector';
import { Badge } from '@/components/ui/Badge';
import { AwardIcon, ClockIcon, TargetIcon, ShieldCheckIcon, AlertCircleIcon } from '@/components/ui/Icons';

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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Barra de Navegação e Contexto da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/90">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-2xs"
            title="Voltar à Trilha Principal"
            aria-label="Voltar para a Trilha de Aprendizagem"
          >
            &larr;
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="sm">
                <span className="flex items-center gap-1">
                  <AwardIcon className="w-3.5 h-3.5" />
                  <span>Simulado Temático</span>
                </span>
              </Badge>
              <span className="text-xs font-bold text-slate-500">
                Padrão DETRAN • CONTRAN
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Simulado Temático — Sinalização de Trânsito
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>{config.normativeAct}</span>
            </span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel Principal (8 Colunas) */}
        <div className="lg:col-span-8 space-y-6">
          <section
            aria-labelledby="simulado-lobby-heading"
            className="card-premium p-6 sm:p-8 space-y-6"
          >
            <div className="space-y-2">
              <h2
                id="simulado-lobby-heading"
                className="text-lg sm:text-xl font-black text-slate-900"
              >
                Instruções e Regras da Prova
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Treino prático focado nas 30 questões do módulo de Sinalização de Trânsito e Normas de Circulação.
                Durante a prova, não há dicas nem correção imediata: você pode navegar livremente entre as questões,
                marcar itens para revisar e conferir o gabarito comentado da plataforma com fundamentação legal ao entregar.
              </p>
            </div>

            {/* Aviso de Transparência sobre o Simulado */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-amber-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <AlertCircleIcon className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Aviso importante sobre este Simulado Temático:</span>
              </div>
              <p className="text-amber-900/90 leading-relaxed text-xs">
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
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
              >
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total de Questões
                </span>
                <strong className="block text-2xl font-black text-slate-900">
                  {config.totalQuestions} questões
                </strong>
                <span className="text-xs text-slate-500 block">Acervo de Sinalização (4 opções)</span>
              </div>

              <div
                data-testid="rule-duration"
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
              >
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Tempo de Prova
                </span>
                <strong className="block text-2xl font-black text-slate-900 flex items-center gap-1">
                  <ClockIcon className="w-5 h-5 text-blue-600 inline" />
                  <span>{config.durationMinutes} minutos</span>
                </strong>
                <span className="text-xs text-slate-500 block">60 min padrão ou 120 min (PCD/TEA)</span>
              </div>

              <div
                data-testid="rule-passing-score"
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
              >
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Meta da Plataforma
                </span>
                <strong className="block text-2xl font-black text-emerald-700 flex items-center gap-1">
                  <TargetIcon className="w-5 h-5 text-emerald-600 inline" />
                  <span>{config.passingScore} acertos</span>
                </strong>
                <span className="text-xs text-slate-500 block">Referência pedagógica (70% do treino)</span>
              </div>
            </div>

            {/* Alerta de Acervo Insuficiente se < 30 questões aprovadas */}
            {isUnavailable && (
              <div
                role="alert"
                data-testid="simulado-insufficient-alert"
                className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm space-y-1"
              >
                <strong className="block font-black text-amber-900">
                  Simulado temporariamente indisponível:
                </strong>
                <p className="text-amber-900/90 leading-relaxed">
                  Simulado indisponível no momento: o acervo possui {availableCount} questões aprovadas, sendo necessárias {config.totalQuestions}. Nossa equipe editorial está revisando novas questões.
                </p>
              </div>
            )}

            {/* Seletor de Duração e Botão de Início */}
            <div className="pt-2">
              <SimuladoDurationSelector
                defaultDurationMinutes={config.durationMinutes}
                isUnavailable={isUnavailable}
                availableCount={availableCount}
                requiredCount={config.totalQuestions}
              />
            </div>

            <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-100">
              Nota de transparência: A plataforma AprovaCNH é independente e não possui vínculo com o DETRAN ou a SENATRAN. O conteúdo baseia-se em normas e dispositivos legais de domínio público (Art. 8º, IV da Lei nº 9.610/1998).
            </p>
          </section>
        </div>

        {/* Coluna Lateral da Direita (4 Colunas): Histórico de Treinos e Dicas de Exame */}
        <div className="lg:col-span-4 space-y-5">
          <section aria-labelledby="recent-simulados-heading" className="card-premium p-5 space-y-4">
            <h2 id="recent-simulados-heading" className="text-base font-black text-slate-900 flex items-center gap-2">
              <AwardIcon className="w-4 h-4 text-blue-600" />
              <span>Seus Treinos Recentes</span>
            </h2>
            <SimuladoHistoryList serverHistory={history} />
          </section>

          {/* Dicas para o Exame */}
          <div className="card-premium p-5 space-y-2.5 bg-gradient-to-br from-white to-blue-50/20 text-xs">
            <h3 className="font-extrabold text-slate-900">Dicas para a prova:</h3>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600">
              <li>Responda com calma primeiro as questões que tem certeza.</li>
              <li>Marque com a bandeira 🚩 as dúvidas para checar no final.</li>
              <li>Atenção ao cronômetro: a prova encerra automaticamente.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
