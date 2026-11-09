'use server';

import { getQuestionAnswerKey } from '../server/questionRepository';
import type { OptionId } from '../types/question';

export interface VerifyLessonAnswerResult {
  success: boolean;
  isCorrect?: boolean;
  correctOptionId?: OptionId;
  explanation?: string;
  error?: string;
}

/**
 * Server Action para conferência autoritativa da resposta de uma questão de lição.
 * EXCLUSIVO DO SERVIDOR: O cliente jamais recebe o gabarito antes de submeter a resposta.
 * Apenas após o envio o servidor verifica a chave de resposta e libera o feedback didático.
 */
export async function verifyLessonAnswerAction(
  questionId: string,
  selectedOptionId: OptionId
): Promise<VerifyLessonAnswerResult> {
  if (!questionId || !selectedOptionId) {
    return {
      success: false,
      error: 'Parâmetros de submissão incompletos.',
    };
  }

  const answerKey = await getQuestionAnswerKey(questionId);
  if (!answerKey) {
    return {
      success: false,
      error: 'Questão não encontrada ou gabarito indisponível no servidor.',
    };
  }

  const isCorrect = answerKey.correctOptionId === selectedOptionId;

  return {
    success: true,
    isCorrect,
    correctOptionId: answerKey.correctOptionId,
    explanation: answerKey.explanation,
  };
}
