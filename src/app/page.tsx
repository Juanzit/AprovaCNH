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

        {/* Coluna Lateral (Desktop Direita / Mobile Topo Compacto): Resumo do Estudante, Ofensiva Semanal e Card SRS */}
        <div className="md:col-span-5 space-y-4 order-1 md:order-2">
          <StudentHeader initialProfile={profile} />
          <DailyReviewCard
            queueCount={reviewDashboard.queue.length}
            totalRecentErrors={reviewDashboard.totalRecentErrors}
            totalOverdue={reviewDashboard.totalOverdue}
            totalPracticedQuestions={reviewDashboard.totalPracticedQuestions}
          />
        </div>
      </div>
    </div>
  );
}
