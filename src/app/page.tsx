import Link from 'next/link';
import {
  getStudentProfile,
  getLessonTopicProgress,
} from '@/features/progress/server/progressRepository';
import { getReviewDashboardData } from '@/features/review/server/reviewRepository';
import { StudentHeader } from '@/features/progress/components/StudentHeader';
import { TrackUnitCard } from '@/features/progress/components/TrackUnitCard';
import { GuestXpStat } from '@/features/progress/components/GuestXpStat';
import { GuestSessionStats } from '@/features/progress/components/GuestSessionStats';
import { getPrimaryCtaConfig } from '@/features/progress/utils/trackCta';
import { DailyReviewCard } from '@/features/review/components/DailyReviewCard';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import {
  TargetIcon,
  BookOpenIcon,
  FlameIcon,
  SparklesIcon,
  AwardIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@/components/ui/Icons';

export default async function HomePage() {
  const [profile, sessions, reviewDashboard] = await Promise.all([
    getStudentProfile(),
    getLessonTopicProgress('Sinalização de Trânsito'),
    getReviewDashboardData(),
  ]);

  // Identifica sessões que possuem questões pendentes na fila prioritária do SRS ou status crítico
  const reviewNeededSessionIds = reviewDashboard.subtopics
    .filter(
      (sub) =>
        sub.status === 'critico' ||
        reviewDashboard.queue.some((item) =>
          (item.question.source.provision || '').includes(sub.legalProvision)
        )
    )
    .map((sub) => sub.sessionId);

  // Métricas reais agregadas do aluno
  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const totalCompletedQuestions = completedSessions.length * 5;
  const totalCorrect = completedSessions.reduce((acc, s) => acc + s.score, 0);
  const totalAnsweredQuestions = completedSessions.reduce((acc, s) => acc + s.maxScore, 0);
  const hasAnsweredQuestions = totalAnsweredQuestions > 0;
  const accuracyPercent = hasAnsweredQuestions
    ? Math.round((totalCorrect / totalAnsweredQuestions) * 100)
    : 0;

  const primaryCta = getPrimaryCtaConfig(sessions);

  // Saudação contextual por horário
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. Header de Boas-Vindas / Hero do Estudante */}
      <section
        aria-label="Boas-vindas ao AprovaCNH"
        className="card-premium p-6 sm:p-7 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 border-l-4 border-l-blue-500"
      >
        <div
          className="hidden"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="brand" dot={true}>
                {timeGreeting}, {profile.fullName?.split(' ')[0] || 'Estudante'}
              </Badge>
              <Badge variant="outline">
                <span className="flex items-center gap-1 text-slate-600">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Res. CONTRAN nº 973/2022 &amp; nº 1.020/2025</span>
                </span>
              </Badge>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Painel de Preparação Teórica
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Desenvolva domínio das regras de trânsito através de micro-aulas interativas, repetição espaçada ativa e simulados calibrados no padrão oficial do DETRAN.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              <span>{primaryCta.label}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Grade de Indicadores de Desempenho (KPI Cards) */}
      <section aria-label="Resumo de Desempenho" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {profile.id === 'guest' ? (
          <GuestSessionStats
            initialCompletedSessions={completedSessions.length}
            initialCorrectAnswers={totalCorrect}
          />
        ) : (
          <>
            <StatCard
              label="Taxa de Acerto"
              value={`${accuracyPercent}%`}
              sublabel={hasAnsweredQuestions ? 'Meta de estudo: 70%' : 'Inicie uma sessão'}
              icon={<TargetIcon className="w-5 h-5" />}
              iconBgColor="bg-emerald-50 text-emerald-600"
              trend={{
                text: !hasAnsweredQuestions ? 'Sem dados' : accuracyPercent >= 70 ? '✓ No padrão' : 'Abaixo do corte',
                isPositive: accuracyPercent >= 70,
              }}
            />
            <StatCard
              label="Questões Estudadas"
              value={`${totalCompletedQuestions}/20`}
              sublabel="Unidade 1 • Sinalização"
              icon={<BookOpenIcon className="w-5 h-5" />}
              iconBgColor="bg-blue-50 text-blue-600"
              trend={{
                text: `${completedSessions.length} de 4 sessões`,
                isPositive: true,
              }}
            />
          </>
        )}

        <StatCard
          label="Ofensiva de Estudos"
          value={`${profile.currentStreak} dias`}
          sublabel={`Recorde: ${profile.longestStreak} dias seguidos`}
          icon={<FlameIcon className="w-5 h-5 text-amber-500" />}
          iconBgColor="bg-amber-50 text-amber-600"
          trend={{
            text: profile.currentStreak > 0 ? 'Foco diário' : 'Inicie hoje',
            isPositive: profile.currentStreak > 0,
          }}
        />

        {profile.id === 'guest' ? (
          <GuestXpStat initialXp={profile.xpTotal} />
        ) : (
          <StatCard
            label="Experiência (XP)"
            value={`${profile.xpTotal} XP`}
            sublabel="Pontuação acumulada"
            icon={<SparklesIcon className="w-5 h-5" />}
            iconBgColor="bg-purple-50 text-purple-600"
            trend={{ text: 'Nível 1 • Iniciante', isPositive: true }}
          />
        )}
      </section>

      {/* 3. Composição Principal em Duas Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Principal da Esquerda (8 Colunas): Trilha de Aprendizagem */}
        <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
          <TrackUnitCard
            isGuest={profile.id === 'guest'}
            sessions={sessions}
            reviewNeededSessionIds={reviewNeededSessionIds}
          />
        </div>

        {/* Coluna Lateral da Direita (4 Colunas): Perfil, SRS e Simulado */}
        <div className="lg:col-span-4 space-y-5 order-1 lg:order-2">
          {/* Perfil do Aluno e Hábito Semanal */}
          <StudentHeader initialProfile={profile} />

          {/* Centro de Repetição Espaçada Diária */}
          <DailyReviewCard
            queueCount={reviewDashboard.queue.length}
            totalRecentErrors={reviewDashboard.totalRecentErrors}
            totalOverdue={reviewDashboard.totalOverdue}
            totalPracticedQuestions={reviewDashboard.totalPracticedQuestions}
          />

          {/* Card do Simulado Temático Oficial (Aparência Premium) */}
          <section
            aria-labelledby="dashboard-simulado-heading"
            data-testid="dashboard-simulado-card"
            className="card-premium p-5 space-y-4 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden bg-white dark:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Badge variant="brand" size="sm">
                Simulado Temático
              </Badge>
              <span className="text-[11px] font-bold text-slate-500">
                Padrão Oficial DETRAN
              </span>
            </div>

            <div className="space-y-1.5">
              <h2
                id="dashboard-simulado-heading"
                className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2"
              >
                <AwardIcon className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Simulado de Sinalização</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Avaliação cronometrada com navegação livre entre questões, marcação de revisão e feedback detalhado ao final.
              </p>
            </div>

            {/* Ficha Rápida do Simulado */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Duração</span>
                  <span className="font-bold text-slate-800">60 ou 120 min</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TargetIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Aprovação</span>
                  <span className="font-bold text-slate-800">20/30 (70%)</span>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href="/simulado"
                data-testid="dashboard-simulado-link"
                className="inline-flex items-center justify-center w-full min-h-11 px-4 py-2.5 rounded-xl border border-blue-600/20 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.99]"
              >
                <span>Acessar Simulado Temático &rarr;</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
