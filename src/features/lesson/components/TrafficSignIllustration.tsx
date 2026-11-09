import Image from 'next/image';

interface TrafficSignIllustrationProps {
  codes: string[];
  referenceCode?: string | null;
  className?: string;
}

/**
 * Renderiza somente SVGs locais auditados. Quando o código-fonte não tem arte
 * local correspondente, exibe o código sem inventar uma placa substituta.
 */
export function TrafficSignIllustration({
  codes,
  referenceCode,
  className = '',
}: TrafficSignIllustrationProps) {
  const safeCodes = [...new Set(codes)].filter((code) => /^[A-Za-z0-9-]+$/.test(code));

  if (safeCodes.length === 0) {
    if (!referenceCode) return null;
    return (
      <div
        role="note"
        className={`rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 ${className}`}
      >
        <strong>Código de sinalização: {referenceCode}</strong>
        <span className="ml-2">Ilustração local não disponível para este código.</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {referenceCode && (
        <p className="text-[11px] font-semibold text-slate-600">
          Código informado na fonte: {referenceCode}
        </p>
      )}
      <div
        className="flex flex-wrap items-center gap-3"
        aria-label={`Ilustração de sinalização: ${safeCodes.join(', ')}`}
      >
        {safeCodes.map((code) => (
          <figure
            key={code}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <Image
              src={`/signs/${code}.svg`}
              alt={`Placa de trânsito ${code}`}
              width={84}
              height={84}
              unoptimized
              className="h-16 w-16 object-contain"
            />
            <figcaption className="text-xs font-extrabold text-slate-700">{code}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
