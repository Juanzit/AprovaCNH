import Link from 'next/link';
import { initializeSimuladoSession } from '@/features/simulado/server/simuladoRepository';
import { InsufficientApprovedQuestionsError } from '@/features/simulado/utils/simuladoGenerator';
import { SimuladoContainer } from '@/features/simulado/components/SimuladoContainer';

export const dynamic = 'force-dynamic';

interface SimuladoProvaPageProps {
  searchParams: Promise<{ tempo?: string }>;
}

export default async function SimuladoProvaPage({ searchParams }: SimuladoProvaPageProps) {
  const params = await searchParams;
  const durationMinutes = params?.tempo === '120' ? 120 : 60;

  let session: Awaited<ReturnType<typeof initializeSimuladoSession>> | null = null;
  let eligibilityError: InsufficientApprovedQuestionsError | null = null;

  try {
    session = await initializeSimuladoSession({ uf: 'MG', durationMinutes });
  } catch (error: unknown) {
    if (error instanceof InsufficientApprovedQuestionsError) {
      eligibilityError = error;
    } else {
      throw error;
    }
  }

  if (eligibilityError) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div
          role="alert"
          data-testid="simulado-insufficient-alert"
          className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-extrabold uppercase">
              Acervo em Homologação
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-amber-900">
            Simulado Completo Temporariamente Indisponível
          </h1>
          <p className="text-sm leading-relaxed text-amber-900/90">
            O simulado oficial exige <strong>{eligibilityError.requiredCount} questões aprovadas</strong> e
            homologadas editorialmente. No momento, o acervo conta com <strong>{eligibilityError.availableCount} questões aprovadas</strong> (as
            demais encontram-se em processo de revisão e auditoria editorial humana).
          </p>
          <p className="text-xs text-amber-800 leading-relaxed">
            Por respeito aos critérios de transparência e segurança de publicação da plataforma AprovaCNH,
            provas incompletas ou com questões em revisão jamais são disponibilizadas aos estudantes.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/simulado"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-amber-800 text-white font-bold text-sm hover:bg-amber-900 transition-colors"
            >
              Voltar ao Lobby do Simulado
            </Link>
            <Link
              href="/licao/sinalizacao"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-sm hover:bg-amber-50 transition-colors"
            >
              Praticar Lições Homologadas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SimuladoContainer
      simuladoId={session.simuladoId}
      config={session.config}
      startedAt={session.startedAt}
      items={session.items}
    />
  );
}
