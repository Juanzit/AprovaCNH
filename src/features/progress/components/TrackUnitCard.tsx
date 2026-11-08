'use client';

import React from 'react';
import Link from 'next/link';
import type { LessonSessionProgress } from '../types/progress';

interface TrackUnitCardProps {
  sessions: LessonSessionProgress[];
}

const SESSION_METADATA = [
  {
    sessionId: 1,
    title: 'Sessão 1',
    description: 'Art. 195: Ordens do Agente e Prevalência (Ficha 583-50)',
    questionsCount: 5,
  },
  {
    sessionId: 2,
    title: 'Sessão 2',
    description: 'Art. 196: Início de Marcha e Parada (Fichas 584-31 e 584-32)',
    questionsCount: 5,
  },
  {
    sessionId: 3,
    title: 'Sessão 3',
    description: 'Art. 196: Mudança de Direção e Faixa (Fichas 584-33 e 584-34)',
    questionsCount: 5,
  },
  {
    sessionId: 4,
    title: 'Sessão 4',
    description: 'Art. 208: Sinal Vermelho e Parada Obrigatória (Fichas 605-01 e 605-02)',
    questionsCount: 5,
  },
];

export function TrackUnitCard({ sessions }: TrackUnitCardProps) {
  const sessionProgressMap = new Map<number, LessonSessionProgress>();
  for (const s of sessions) {
    sessionProgressMap.set(s.sessionId, s);
  }

  // Identifica a próxima sessão pendente para o botão principal
  const nextPendingSession =
    SESSION_METADATA.find((meta) => {
      const prog = sessionProgressMap.get(meta.sessionId);
      return prog?.status !== 'completed';
    }) ?? SESSION_METADATA[0];

  const totalCompleted = sessions.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((totalCompleted / 4) * 100);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs space-y-6">
      {/* Cabeçalho da Unidade */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-1">
            <span>📚</span>
            <span>Unidade 1</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            Sinalização de Trânsito
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manual Brasileiro de Fiscalização de Trânsito — MBFT (Resolução CONTRAN nº 985/2022)
          </p>
        </div>

        {/* Barra de Progresso da Unidade */}
        <div className="sm:text-right shrink-0">
          <span className="text-xs font-semibold text-slate-600 block mb-1">
            Progresso: {totalCompleted}/4 Sessões ({progressPercent}%)
          </span>
          <div className="w-full sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* CTAs Mobile: Continuar de onde parou e Centro de Revisão */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <Link
          href={`/licao/sinalizacao?sessao=${nextPendingSession.sessionId}`}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          <span>▶</span>
          <span>
            Continuar de onde parou (Sessão {nextPendingSession.sessionId})
          </span>
        </Link>

        <Link
          href="/revisao"
          className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <span>🎯</span>
          <span>Centro de Revisão</span>
        </Link>
      </div>

      {/* Lista das 4 Sessões (Livre Acesso) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Sessões Temáticas (Livre Acesso)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SESSION_METADATA.map((meta) => {
            const progress = sessionProgressMap.get(meta.sessionId);
            const isCompleted = progress?.status === 'completed';

            return (
              <div
                key={meta.sessionId}
                data-testid={`session-card-${meta.sessionId}`}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200 hover:border-blue-400 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-tight">
                      {meta.title}
                    </span>

                    {isCompleted ? (
                      <span
                        data-testid={`session-badge-${meta.sessionId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"
                      >
                        ✓ Concluída ({progress.score}/5)
                      </span>
                    ) : (
                      <span
                        data-testid={`session-badge-${meta.sessionId}`}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                      >
                        Disponível
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-slate-800 mb-3 leading-snug">
                    {meta.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {isCompleted ? `+${progress.xpEarned} XP conquistados` : 'Vale até 70 XP'}
                  </span>

                  <Link
                    href={`/licao/sinalizacao?sessao=${meta.sessionId}`}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      isCompleted
                        ? 'text-emerald-700 hover:bg-emerald-100/70 border border-emerald-300'
                        : 'text-white bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isCompleted ? 'Revisar' : 'Iniciar'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
