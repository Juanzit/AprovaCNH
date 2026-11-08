import Link from 'next/link';
import {
  getStudentProfile,
  getLessonTopicProgress,
} from '@/features/progress/server/progressRepository';
import { getReviewDashboardData } from '@/features/review/server/reviewRepository';
import { StudentHeader } from '@/features/progress/components/StudentHeader';
import { TrackUnitCard } from '@/features/progress/components/TrackUnitCard';
import { DailyReviewCard } from '@/features/review/components/DailyReviewCard';

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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-5 py-5 sm:py-7">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Coluna Principal (Desktop Esquerda / Mobile Seguinte ao Resumo Compacto): Trilha e Sua Próxima Atividade */}
        <div className="md:col-span-7 order-2 md:order-1">
          <TrackUnitCard
            sessions={sessions}
            reviewNeededSessionIds={reviewNeededSessionIds}
          />
        </div>

        {/* Coluna Lateral (Desktop Direita / Mobile Topo Compacto): Resumo do Estudante, Ofensiva Semanal, Card SRS e Simulado */}
        <div className="md:col-span-5 space-y-4 order-1 md:order-2">
          <StudentHeader initialProfile={profile} />
          <DailyReviewCard
            queueCount={reviewDashboard.queue.length}
            totalRecentErrors={reviewDashboard.totalRecentErrors}
            totalOverdue={reviewDashboard.totalOverdue}
            totalPracticedQuestions={reviewDashboard.totalPracticedQuestions}
          />

          <section
            aria-labelledby="dashboard-simulado-heading"
            data-testid="dashboard-simulado-card"
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                Simulado Prático (Res. CONTRAN 1.020/2025)
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                30 questões • 60 min
              </span>
            </div>
            <h2
              id="dashboard-simulado-heading"
              className="text-sm font-extrabold text-slate-900"
            >
              Simulado DETRAN-MG / SENATRAN
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Teste seus conhecimentos sob cronômetro regressivo de 60 minutos (corte: 20 acertos)
              e receba o gabarito comentado ao final.
            </p>
            <div className="pt-1">
              <Link
                href="/simulado"
                data-testid="dashboard-simulado-link"
                className="inline-flex items-center justify-center w-full min-h-10 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-extrabold transition-colors"
              >
                Acessar Simulado Prático →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
