import { initializeSimuladoSession } from '@/features/simulado/server/simuladoRepository';
import { SimuladoContainer } from '@/features/simulado/components/SimuladoContainer';

export const dynamic = 'force-dynamic';

export default async function SimuladoProvaPage() {
  const session = await initializeSimuladoSession({ uf: 'MG' });

  return (
    <SimuladoContainer
      simuladoId={session.simuladoId}
      config={session.config}
      startedAt={session.startedAt}
      items={session.items}
    />
  );
}
