import { getSimuladoResultById } from '@/features/simulado/server/simuladoRepository';
import { SimuladoResultClient } from '@/features/simulado/components/SimuladoResultClient';

export const dynamic = 'force-dynamic';

interface SimuladoResultadoPageProps {
  params: Promise<{ id: string }>;
}

export default async function SimuladoResultadoPage({
  params,
}: SimuladoResultadoPageProps) {
  const { id } = await params;
  const serverResult = await getSimuladoResultById(id);

  return <SimuladoResultClient simuladoId={id} initialResult={serverResult} />;
}
