'use client';

import React from 'react';
import Link from 'next/link';
import type { LessonSessionProgress } from '../types/progress';

interface TrackUnitCardProps {
  sessions: LessonSessionProgress[];
  reviewNeededSessionIds?: number[];
}

export const SESSION_METADATA = [
  {
    sessionId: 1,
    title: 'Sessão 1',
    description: 'Gestos do Agente, Sinais Sonoros (Apito) e Hierarquia da Sinalização (Arts. 89 e 195 do CTB)',
    questionsCount: 5,
  },
  {
    sessionId: 2,
    title: 'Sessão 2',
    description: 'Sinalização de Manobras, Luzes Indicadoras (Seta) e Gestos de Braço (Arts. 35 e 196 do CTB)',
    questionsCount: 5,
  },
  {
    sessionId: 3,
    title: 'Sessão 3',
    description: 'Conversões, Preferência em Cruzamentos, Rotatórias e Faixas (Arts. 29, 38 e 196 do CTB)',
    questionsCount: 5,
  },
  {
    sessionId: 4,
    title: 'Sessão 4',
    description: 'Semáforo, Parada Obrigatória (R-1 vs. R-2), Faixa de Pedestres e Infrações (Arts. 208 e 214 do CTB)',
    questionsCount: 5,
  },
];

export interface PrimaryCtaConfig {
  label: string;
  href: string;
  targetSessionId: number;
  targetTitle: string;
  targetDescription: string;
  estimatedTime: string;
}

/**
 * Regra determinística para o texto e destino do botão principal (CTA) de "Sua próxima atividade":
 * - 0/4 sessões e nenhuma iniciada -> "Começar primeira sessão"
 * - Sessão em andamento (in_progress) -> "Continuar estudando (Sessão X)"
 * - 1 a 3 sessões concluídas -> "Próxima sessão (Sessão X)"
 * - 4/4 sessões concluídas -> "Revisar unidade"
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
      targetTitle: 'Unidade 1 concluída (4/4 sessões)',
      targetDescription: 'Revise as 20 questões baseadas no MBFT para consolidar sua retenção.',
      estimatedTime: '~3 min',
    };
  }

  if (inProgressSession) {
    const meta =
      SESSION_METADATA.find((m) => m.sessionId === inProgressSession.sessionId) ??
      SESSION_METADATA[0];
    return {
      label: `Continuar estudando (Sessão ${inProgressSession.sessionId})`,
      href: `/licao/sinalizacao?sessao=${inProgressSession.sessionId}`,
      targetSessionId: inProgressSession.sessionId,
      targetTitle: `${meta.title} — Em andamento`,
      targetDescription: meta.description,
      estimatedTime: '~3 min',
    };
  }

  const nextAvailable =
    SESSION_METADATA.find((meta) => {
      const prog = sessionProgressMap.get(meta.sessionId);
      return prog?.status !== 'completed';
    }) ?? SESSION_METADATA[0];

  if (totalCompleted === 0) {
    return {
      label: 'Começar primeira sessão',
      href: '/licao/sinalizacao?sessao=1',
      targetSessionId: 1,
      targetTitle: `${nextAvailable.title} — Ponto de partida`,
      targetDescription: nextAvailable.description,
      estimatedTime: '~3 min',
    };
  }

  return {
    label: `Próxima sessão (Sessão ${nextAvailable.sessionId})`,
    href: `/licao/sinalizacao?sessao=${nextAvailable.sessionId}`,
    targetSessionId: nextAvailable.sessionId,
    targetTitle: `${nextAvailable.title} — Próxima etapa`,
    targetDescription: nextAvailable.description,
    estimatedTime: '~3 min',
  };
}

export function TrackUnitCard({
  sessions,
  reviewNeededSessionIds = [],
}: TrackUnitCardProps) {
  const sessionProgressMap = new Map<number, LessonSessionProgress>();
  for (const s of sessions) {
    sessionProgressMap.set(s.sessionId, s);
  }

  const reviewSet = new Set<number>(reviewNeededSessionIds);
  const totalCompleted = sessions.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((totalCompleted / 4) * 100);
  const primaryCta = getPrimaryCtaConfig(sessions);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      {/* Cabeçalho da Unidade */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-1">
            <span aria-hidden="true">📚</span>
            <span>Unidade 1</span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
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

      {/* Cartão Principal: Sua Próxima Atividade (Único CTA Primário de Alto Destaque) */}
      <div
        data-testid="next-activity-card"
        className="rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/50 border-2 border-blue-200 p-4 sm:p-5 space-y-3.5 shadow-2xs"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-800">
            <span aria-hidden="true">🎯</span>
            <span>Sua próxima atividade</span>
          </span>
          <span
            data-testid="next-activity-time"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-slate-700 text-xs font-bold border border-slate-200"
          >
            <span aria-hidden="true">⏱️</span>
            <span>{primaryCta.estimatedTime}</span>
          </span>
        </div>

        <div>
          <p className="text-sm font-extrabold text-slate-900">
            {primaryCta.targetTitle}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            {primaryCta.targetDescription}
          </p>
        </div>

        <Link
          href={primaryCta.href}
          data-testid="primary-unit-cta"
          className="w-full min-h-12 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          <span aria-hidden="true">▶</span>
          <span>{primaryCta.label}</span>
        </Link>
      </div>

      {/* Trilha Vertical Conectada (4 Sessões com Estados Semânticos e Botões Secundários Discretos) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Etapas da Unidade (4 Sessões)
        </h3>

        <ol className="relative space-y-3" data-testid="vertical-session-track">
          {SESSION_METADATA.map((meta, index) => {
            const progress = sessionProgressMap.get(meta.sessionId);
            const isCompleted = progress?.status === 'completed';
            const isInProgress = progress?.status === 'in_progress';
            const needsReview = reviewSet.has(meta.sessionId);
            const isLast = index === SESSION_METADATA.length - 1;
            const earnedXp = progress?.xpEarned || 70;

            // Determinação dos 4 estados semânticos exigidos:
            // 1. Revisão necessária (Âmbar: bg-amber-100 text-amber-800)
            // 2. Concluída (Verde: bg-emerald-100 text-emerald-800)
            // 3. Em andamento (Azul: bg-blue-100 text-blue-800)
            // 4. Não iniciada (Cinza: bg-slate-100 text-slate-700)
            let badgeLabel = 'Não iniciada';
            let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';

            if (needsReview) {
              badgeLabel = 'Revisão necessária';
              badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
            } else if (isCompleted) {
              badgeLabel = `Concluída +${earnedXp} XP`;
              badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
            } else if (isInProgress) {
              badgeLabel = 'Em andamento';
              badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
            }

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
                      needsReview
                        ? 'bg-amber-500 text-white border-amber-500'
                        : isCompleted
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : isInProgress
                        ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {isCompleted && !needsReview ? '✓' : meta.sessionId}
                  </div>
                  {!isLast && (
                    <div
                      aria-hidden="true"
                      className={`w-0.5 flex-1 my-1 ${
                        isCompleted ? 'bg-emerald-300' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>

                {/* Card da Sessão */}
                <div
                  className={`flex-1 p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    needsReview
                      ? 'border-amber-200 bg-amber-50/30'
                      : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : isInProgress
                      ? 'border-blue-300 bg-blue-50/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
                        {meta.title}
                      </span>

                      <span
                        data-testid={`session-badge-${meta.sessionId}`}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}
                      >
                        {badgeLabel}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {meta.description}
                    </p>

                    <span className="block text-xs text-slate-500 font-medium">
                      {isCompleted
                        ? `Acertos: ${progress?.score ?? 5} de 5 questões • ~3 min`
                        : '5 questões baseadas no MBFT • ~3 min • Vale +70 XP'}
                    </span>
                  </div>

                  {/* Botão Secundário/Discreto (Outline/Ghost com alvo de toque >= 44px) */}
                  <div className="shrink-0">
                    <Link
                      href={`/licao/sinalizacao?sessao=${meta.sessionId}`}
                      data-testid={`session-action-${meta.sessionId}`}
                      className="min-h-11 min-w-[104px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center transition-colors border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-700 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {needsReview
                        ? 'Reforçar'
                        : isCompleted
                        ? 'Revisar'
                        : isInProgress
                        ? 'Retomar'
                        : 'Praticar'}
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
