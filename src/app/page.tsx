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

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5">
      {/* Cabeçalho Compacto do Estudante (Gamificação e Streak Semanal) */}
      <StudentHeader initialProfile={profile} />

      {/* Layout Responsivo: Coluna Única no Mobile / Grid de 2 Colunas no Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Coluna Principal: Trilha de Aprendizagem (Unidades e Sessões) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <TrackUnitCard sessions={sessions} />
        </div>

        {/* Coluna Contextual: Algoritmo de Repetição Espaçada (SRS) */}
        <div className="lg:col-span-5 xl:col-span-4">
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
