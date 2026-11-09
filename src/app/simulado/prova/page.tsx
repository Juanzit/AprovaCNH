import { initializeSimuladoSession } from '@/features/simulado/server/simuladoRepository';
import { SimuladoContainer } from '@/features/simulado/components/SimuladoContainer';

export const dynamic = 'force-dynamic';

interface SimuladoProvaPageProps {
  searchParams: Promise<{ tempo?: string }>;
}

export default async function SimuladoProvaPage({ searchParams }: SimuladoProvaPageProps) {
  const params = await searchParams;
  const durationMinutes = params?.tempo === '120' ? 120 : 60;
  const session = await initializeSimuladoSession({ uf: 'MG', durationMinutes });

  return (
    <SimuladoContainer
      simuladoId={session.simuladoId}
      config={session.config}
      startedAt={session.startedAt}
      items={session.items}
    />
  );
}
