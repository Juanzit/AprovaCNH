import type { LessonSessionProgress } from '../types/progress';

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

/**
 * Conta apenas IDs válidos e distintos com status completed na Unidade 1.
 * Registros duplicados, inválidos ou em progresso não aumentam a conclusão.
 */
export function getCompletedUnitSessionIds(sessions: LessonSessionProgress[]): number[] {
  const completedIds = new Set(
    sessions
      .filter((session) => session.status === 'completed' && [1, 2, 3, 4].includes(session.sessionId))
      .map((session) => session.sessionId)
  );
  return [1, 2, 3, 4].filter((sessionId) => completedIds.has(sessionId));
}

export function calculateUnitProgressPercentFromIds(sessionIds: number[]): number {
  const validCompletedIds = new Set(sessionIds.filter((id) => [1, 2, 3, 4].includes(id)));
  return Math.round((validCompletedIds.size / 4) * 100);
}

export function calculateUnitProgressPercent(sessions: LessonSessionProgress[]): number {
  return calculateUnitProgressPercentFromIds(getCompletedUnitSessionIds(sessions));
}

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

  const totalCompleted = getCompletedUnitSessionIds(sessions).length;
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
