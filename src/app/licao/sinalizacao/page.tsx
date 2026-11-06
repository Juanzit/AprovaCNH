import rawQuestions from '@/data/questions-sinalizacao.json';
import { questionBankSchema } from '@/features/lesson/schemas/questionSchema';
import { LessonContainer } from '@/features/lesson/components/LessonContainer';

interface LicaoPageProps {
  searchParams?: Promise<{
    sessao?: string;
    todas?: string;
  }>;
}

export default async function LicaoSinalizacaoPage({ searchParams }: LicaoPageProps) {
  // Validação estrita do banco de questões aprovadas em runtime
  const parseResult = questionBankSchema.safeParse(rawQuestions);

  if (!parseResult.success) {
    throw new Error(
      `Falha de integridade no banco de questões aprovadas: ${JSON.stringify(parseResult.error.format())}`
    );
  }

  const allQuestions = parseResult.data;
  const resolvedParams = searchParams ? await searchParams : {};

  // Se 'todas=true', entrega as 20 questões do banco completo
  if (resolvedParams.todas === 'true') {
    return <LessonContainer questions={allQuestions} />;
  }

  // Por padrão, divide em micro-lições de 5 questões (3-5 min) conforme metodologia do Plano Mestre
  const sessionNum = parseInt(resolvedParams.sessao || '1', 10);
  const validSession = isNaN(sessionNum) || sessionNum < 1 || sessionNum > 4 ? 1 : sessionNum;
  const startIndex = (validSession - 1) * 5;
  const sessionQuestions = allQuestions.slice(startIndex, startIndex + 5);

  return <LessonContainer questions={sessionQuestions} />;
}
