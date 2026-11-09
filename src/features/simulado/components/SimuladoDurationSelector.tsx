'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SimuladoDurationSelectorProps {
  defaultDurationMinutes?: number;
}

export function SimuladoDurationSelector({
  defaultDurationMinutes = 60,
}: SimuladoDurationSelectorProps) {
  const [duration, setDuration] = useState<60 | 120>(
    defaultDurationMinutes === 120 ? 120 : 60
  );

  return (
    <div className="space-y-4 pt-1">
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
          Opção de Tempo de Prova (Resolução CONTRAN nº 1.020/2025):
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            htmlFor="duration-opt-60"
            className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              duration === 60
                ? 'border-blue-600 bg-blue-50/70 text-slate-950 shadow-2xs'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <input
              id="duration-opt-60"
              type="radio"
              name="simulado-duration-option"
              value={60}
              checked={duration === 60}
              onChange={() => setDuration(60)}
              className="mt-1 h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-600"
            />
            <div>
              <strong className="block text-sm font-extrabold text-slate-900">
                60 minutos (Configuração padrão)
              </strong>
              <span className="text-xs text-slate-600 leading-snug block mt-0.5">
                Tempo regulamentar padrão para a resolução das 30 questões do simulado temático.
              </span>
            </div>
          </label>

          <label
            htmlFor="duration-opt-120"
            className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              duration === 120
                ? 'border-blue-600 bg-blue-50/70 text-slate-950 shadow-2xs'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <input
              id="duration-opt-120"
              type="radio"
              name="simulado-duration-option"
              value={120}
              checked={duration === 120}
              onChange={() => setDuration(120)}
              className="mt-1 h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-600"
            />
            <div>
              <strong className="block text-sm font-extrabold text-slate-900">
                120 minutos (Tempo estendido)
              </strong>
              <span className="text-xs text-slate-600 leading-snug block mt-0.5">
                Tempo dobrado conforme Art. 33, § 2º da Resolução CONTRAN nº 1.020/2025 para candidatos com dislexia, TDAH ou TEA (livre escolha, sem exigência de laudo médico).
              </span>
            </div>
          </label>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Link
          href={`/simulado/prova?tempo=${duration}`}
          data-testid="start-simulado-cta"
          className="inline-flex items-center justify-center min-h-12 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors shadow-xs"
        >
          Iniciar Simulado Temático ({duration} min) →
        </Link>

        <Link
          href="/simulado/historico"
          className="inline-flex items-center justify-center min-h-12 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
        >
          Ver Histórico de Treinos
        </Link>
      </div>
    </div>
  );
}
