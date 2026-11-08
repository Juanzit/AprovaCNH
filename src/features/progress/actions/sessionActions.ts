'use server';

import {
  evaluateAndRecordSession,
  updateStudentProfile,
} from '../server/progressRepository';
import type {
  SessionSubmissionPayload,
  SessionSubmissionResult,
} from '../types/progress';

/**
 * Server Action autoritativa para submissão de respostas e cálculo de pontuação/XP no servidor.
 */
export async function submitSessionAnswersAction(
  payload: SessionSubmissionPayload
): Promise<SessionSubmissionResult> {
  return evaluateAndRecordSession(payload);
}

/**
 * Server Action para atualização dos dados de perfil (Nome, UF e Categoria CNH).
 */
export async function updateStudentProfileAction(data: {
  fullName?: string;
  uf?: string | null;
  targetCategory?: string;
}): Promise<{ success: boolean; error?: string }> {
  return updateStudentProfile(data);
}
