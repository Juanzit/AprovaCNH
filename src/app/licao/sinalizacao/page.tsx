import rawSeed from '@/data/seed-sinalizacao.json';
import { lessonSeedSchema } from '@/features/lesson/schemas/questionSchema';
import { LessonContainer } from '@/features/lesson/components/LessonContainer';

export default function LicaoSinalizacaoPage() {
  // Validação estrita do seed em runtime
  const parseResult = lessonSeedSchema.safeParse(rawSeed);

  if (!parseResult.success) {
    throw new Error(
      `Falha de integridade no seed demonstrativo: ${JSON.stringify(parseResult.error.format())}`
    );
  }

  return <LessonContainer questions={parseResult.data} />;
}
