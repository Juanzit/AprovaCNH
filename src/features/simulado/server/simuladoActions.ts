'use server';

import { revalidatePath } from 'next/cache';
import { submitAndEvaluateSimulado } from './simuladoRepository';
import type { SimuladoResult, SimuladoSubmissionPayload } from '../types/simulado';

export async function submitSimuladoAction(
  payload: SimuladoSubmissionPayload
): Promise<{
  success: boolean;
  result?: SimuladoResult;
  error?: string;
}> {
  const response = await submitAndEvaluateSimulado(payload);
  if (response.success) {
    revalidatePath('/');
    revalidatePath('/simulado');
    revalidatePath('/simulado/historico');
    revalidatePath('/revisao');
  }
  return response;
}
