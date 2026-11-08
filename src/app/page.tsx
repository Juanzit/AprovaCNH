import {
  getStudentProfile,
  getLessonTopicProgress,
} from '@/features/progress/server/progressRepository';
import { StudentHeader } from '@/features/progress/components/StudentHeader';
import { TrackUnitCard } from '@/features/progress/components/TrackUnitCard';

export default async function HomePage() {
  const profile = await getStudentProfile();
  const sessions = await getLessonTopicProgress('Sinalização de Trânsito');

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-8">
      {/* Cabeçalho do Estudante (Gamificação e Perfil) */}
      <StudentHeader initialProfile={profile} />

      {/* Trilha de Aprendizagem (Unidades e Sessões) */}
      <TrackUnitCard sessions={sessions} />
    </div>
  );
}
