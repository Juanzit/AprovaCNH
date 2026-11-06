import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-12 text-center">
      <div className="inline-block p-2 px-3 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold mb-4 border border-blue-200">
        Fatia Vertical Técnica T001
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
        Lição de Sinalização de Trânsito
      </h1>
      <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8">
        Teste a experiência da lição interativa com 5 questões demonstrativas de múltipla escolha, feedback imediato e pontuação de XP.
      </p>

      <div className="space-y-3">
        <Link
          href="/licao/sinalizacao"
          className="inline-flex w-full items-center justify-center py-3.5 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Iniciar lição de sinalização
        </Link>
      </div>
    </div>
  );
}
