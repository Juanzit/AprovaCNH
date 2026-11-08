'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { SimuladoResult } from '../types/simulado';
import { getSimuladoResultFromSession } from '../utils/simuladoStorage';
import { SimuladoResultSummary } from './SimuladoResultSummary';
import { SimuladoReviewList } from './SimuladoReviewList';

interface SimuladoResultClientProps {
  simuladoId: string;
  initialResult: SimuladoResult | null;
}

export function SimuladoResultClient({
  simuladoId,
  initialResult,
}: SimuladoResultClientProps) {
  const [result] = useState<SimuladoResult | null>(() => {
    if (initialResult) return initialResult;
    return getSimuladoResultFromSession(simuladoId);
  });

  if (!result) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
            Resultado de Simulado Não Encontrado
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Não encontramos os dados desta tentativa de simulado. Inicie um novo simulado oficial
            para testar seus conhecimentos.
          </p>
          <div className="pt-2">
            <Link
              href="/simulado"
              className="inline-flex items-center justify-center min-h-11 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold"
            >
              Ir para o Simulado Oficial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-5 py-5 sm:py-7 space-y-6">
      <SimuladoResultSummary result={result} />
      <SimuladoReviewList items={result.evaluatedItems} />
    </div>
  );
}
