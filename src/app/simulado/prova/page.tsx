import { initializeSimuladoSession } from '@/features/simulado/server/simuladoRepository';
import { SimuladoContainer } from '@/features/simulado/components/SimuladoContainer';
import { InsufficientApprovedQuestionsError } from '@/features/simulado/utils/simuladoGenerator';

export const dynamic = 'force-dynamic';

interface SimuladoProvaPageProps {
  searchParams: Promise<{ tempo?: string }>;
}

export default async function SimuladoProvaPage({ searchParams }: SimuladoProvaPageProps) {
  const params = await searchParams;
  const durationMinutes = params?.tempo === '120' ? 120 : 60;

  try {
    const session = await initializeSimuladoSession({ uf: 'MG', durationMinutes });

    return (
      <SimuladoContainer
        simuladoId={session.simuladoId}
        config={session.config}
        startedAt={session.startedAt}
        items={session.items}
      />
    );
  } catch (error) {
    if (error instanceof InsufficientApprovedQuestionsError) {
      return (
        <main className="mx-auto max-w-2xl px-4 py-16">
          <section
            role="alert"
            className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-950"
          >
            <h1 className="text-lg font-extrabold">Simulado indisponível no momento</h1>
            <p className="mt-2 text-sm leading-relaxed">
              O AprovaCNH não encontrou 30 questões BNQ aprovadas e elegíveis para montar este treino.
              Questões em revisão ou demonstrativas não são utilizadas para completar a prova.
            </p>
          </section>
        </main>
      );
    }
    throw error;
  }
}
