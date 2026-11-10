import { getApprovedQuestionsByTopic } from '@/features/lesson/server/questionRepository';
import { getLessonTopicProgress, getStudentProfile } from '@/features/progress/server/progressRepository';
import { LessonContainer } from '@/features/lesson/components/LessonContainer';

interface LicaoPageProps {
  searchParams?: Promise<{
    sessao?: string;
    todas?: string;
  }>;
}

export default async function LicaoSinalizacaoPage({ searchParams }: LicaoPageProps) {
  // Carrega questões e progresso em paralelo para que o resumo use o estado real da unidade.
  const [allQuestions, progressSessions, profile] = await Promise.all([
    getApprovedQuestionsByTopic('Sinalização de Trânsito'),
    getLessonTopicProgress('Sinalização de Trânsito'),
    getStudentProfile(),
  ]);
  const completedSessionIds = progressSessions
    .filter((session) => session.status === 'completed')
    .map((session) => session.sessionId);

  const resolvedParams = searchParams ? await searchParams : {};

  // Se 'todas=true', entrega as 20 questões do banco completo
  if (resolvedParams.todas === 'true') {
    return <LessonContainer
      key="lesson-all-questions"
      questions={allQuestions}
      sessionId={1}
      completedSessionIds={completedSessionIds}
      isGuest={profile.id === 'guest'}
    />;
  }

  // Por padrão, divide em micro-lições de 5 questões (3-5 min) conforme metodologia do Plano Mestre
  const sessionNum = parseInt(resolvedParams.sessao || '1', 10);
  const validSession = isNaN(sessionNum) || sessionNum < 1 || sessionNum > 4 ? 1 : sessionNum;
  const startIndex = (validSession - 1) * 5;
  const sessionQuestions = allQuestions.slice(startIndex, startIndex + 5);

  return (
    <LessonContainer
      key={`lesson-session-${validSession}`}
      questions={sessionQuestions}
      sessionId={validSession}
      completedSessionIds={completedSessionIds}
      isGuest={profile.id === 'guest'}
    />
  );
}
