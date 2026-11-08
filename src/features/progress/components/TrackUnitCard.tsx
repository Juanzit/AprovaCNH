'use client';

import React from 'react';
import Link from 'next/link';
import type { LessonSessionProgress } from '../types/progress';

interface TrackUnitCardProps {
  sessions: LessonSessionProgress[];
}

export const SESSION_METADATA = [
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

export interface PrimaryCtaConfig {
  label: string;
  href: string;
  targetSessionId: number;
}

/**
 * Regra determinística para o texto e destino do botão principal (CTA) da Unidade:
 * - 0/4 concluídas e nenhuma em andamento -> "Começar primeira sessão (Sessão 1)"
 * - Sessão iniciada/interrompida (in_progress) -> "Continuar estudando (Sessão X)"
 * - >= 1 concluída e próximas disponíveis -> "Próxima sessão (Sessão X)"
 * - 4/4 concluídas (100%) -> "Revisar unidade"
 */
export function getPrimaryCtaConfig(sessions: LessonSessionProgress[]): PrimaryCtaConfig {
  const sessionProgressMap = new Map<number, LessonSessionProgress>();
  for (const s of sessions) {
    sessionProgressMap.set(s.sessionId, s);
  }

  const totalCompleted = sessions.filter((s) => s.status === 'completed').length;
  const inProgressSession = sessions.find((s) => s.status === 'in_progress');

  if (totalCompleted >= 4) {
    return {
      label: 'Revisar unidade',
      href: '/licao/sinalizacao?sessao=1',
      targetSessionId: 1,
    };
  }

  if (inProgressSession) {
    return {
      label: `Continuar estudando (Sessão ${inProgressSession.sessionId})`,
      href: `/licao/sinalizacao?sessao=${inProgressSession.sessionId}`,
      targetSessionId: inProgressSession.sessionId,
    };
  }

  const nextAvailable =
    SESSION_METADATA.find((meta) => {
      const prog = sessionProgressMap.get(meta.sessionId);
      return prog?.status !== 'completed';
    }) ?? SESSION_METADATA[0];

  if (totalCompleted === 0) {
    return {
      label: 'Começar primeira sessão (Sessão 1)',
      href: '/licao/sinalizacao?sessao=1',
      targetSessionId: 1,
    };
  }

  return {
    label: `Próxima sessão (Sessão ${nextAvailable.sessionId})`,
    href: `/licao/sinalizacao?sessao=${nextAvailable.sessionId}`,
    targetSessionId: nextAvailable.sessionId,
  };
}

export function TrackUnitCard({ sessions }: TrackUnitCardProps) {
  const sessionProgressMap = new Map<number, LessonSessionProgress>();
  for (const s of sessions) {
    sessionProgressMap.set(s.sessionId, s);
  }

  const totalCompleted = sessions.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((totalCompleted / 4) * 100);
  const primaryCta = getPrimaryCtaConfig(sessions);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
      {/* Cabeçalho da Unidade */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-1">
            <span aria-hidden="true">📚</span>
            <span>Unidade 1</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            Sinalização de Trânsito
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Manual Brasileiro de Fiscalização de Trânsito — MBFT (Resolução CONTRAN nº 985/2022)
          </p>
        </div>

        {/* Barra de Progresso da Unidade */}
        <div className="sm:text-right shrink-0">
          <span className="text-xs font-bold text-slate-700 block mb-1">
            Progresso: {totalCompleted}/4 Sessões ({progressPercent}%)
          </span>
          <div className="w-full sm:w-36 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progresso da Unidade 1: ${progressPercent}%`}
            />
          </div>
        </div>
      </div>

      {/* CTA Inteligente Contextual (Alvo de toque >= 44px) */}
      <div>
        <Link
          href={primaryCta.href}
          data-testid="primary-unit-cta"
          className="w-full min-h-12 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          <span aria-hidden="true">▶</span>
          <span>{primaryCta.label}</span>
        </Link>
      </div>

      {/* Trilha Vertical Conectada (4 Sessões em Livre Acesso) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Trilha de Sessões (Livre Acesso)
        </h3>

        <ol className="relative space-y-3" data-testid="vertical-session-track">
          {SESSION_METADATA.map((meta, index) => {
            const progress = sessionProgressMap.get(meta.sessionId);
            const isCompleted = progress?.status === 'completed';
            const isInProgress = progress?.status === 'in_progress';
            const isNextRecommended =
              !isCompleted && meta.sessionId === primaryCta.targetSessionId;
            const isLast = index === SESSION_METADATA.length - 1;
            const earnedXp = progress?.xpEarned || 70;

            return (
              <li
                key={meta.sessionId}
                data-testid={`session-card-${meta.sessionId}`}
                className="relative flex items-stretch gap-3 sm:gap-4"
              >
                {/* Coluna do Nó e Linha Guia Vertical */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    aria-hidden="true"
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all z-10 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : isNextRecommended || isInProgress
                        ? 'bg-blue-700 text-white border-blue-700 ring-4 ring-blue-100'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {isCompleted ? '✓' : meta.sessionId}
                  </div>
                  {!isLast && (
                    <div
                      aria-hidden="true"
                      className={`w-0.5 flex-1 my-1 ${
                        isCompleted ? 'bg-emerald-400' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>

                {/* Card da Sessão */}
                <div
                  className={`flex-1 p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : isNextRecommended || isInProgress
                      ? 'border-blue-500 bg-blue-50/20 shadow-2xs'
                      : 'border-slate-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-blue-800 uppercase tracking-tight">
                        {meta.title}
                      </span>

                      {isCompleted ? (
                        <span
                          data-testid={`session-badge-${meta.sessionId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200"
                        >
                          ✓ Concluída +{earnedXp} XP ({progress?.score ?? 5}/5)
                        </span>
                      ) : isInProgress ? (
                        <span
                          data-testid={`session-badge-${meta.sessionId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200"
                        >
                          Em andamento • Disponível
                        </span>
                      ) : isNextRecommended ? (
                        <span
                          data-testid={`session-badge-${meta.sessionId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200"
                        >
                          Próxima sessão • Disponível
                        </span>
                      ) : (
                        <span
                          data-testid={`session-badge-${meta.sessionId}`}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          Disponível
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {meta.description}
                    </p>

                    <span className="block text-xs text-slate-600 font-medium">
                      {isCompleted
                        ? `Pontuação: ${progress?.score ?? 5} de 5 questões`
                        : '5 questões oficiais • Vale +70 XP'}
                    </span>
                  </div>

                  {/* Botão de Ação com alvo de toque mínimo de 44x44px (min-h-11) */}
                  <div className="shrink-0">
                    <Link
                      href={`/licao/sinalizacao?sessao=${meta.sessionId}`}
                      className={`min-h-11 min-w-[100px] px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        isCompleted
                          ? 'text-emerald-800 bg-white hover:bg-emerald-100/70 border border-emerald-300'
                          : isNextRecommended || isInProgress
                          ? 'text-white bg-blue-700 hover:bg-blue-800 shadow-2xs'
                          : 'text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300'
                      }`}
                    >
                      {isCompleted ? 'Revisar' : isInProgress ? 'Continuar' : 'Iniciar'}
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
