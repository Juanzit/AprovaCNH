'use server';

import { revalidatePath } from 'next/cache';
import { submitReviewSession } from '../server/reviewRepository';

export async function submitReviewSessionAction(
  answers: Array<{ questionId: string; selectedOptionId: string }>
) {
  try {
    const result = await submitReviewSession(answers);
    revalidatePath('/revisao');
    revalidatePath('/revisao/pratica');
    revalidatePath('/');
    return result;
  } catch (err) {
    console.error('[Review Action Error]:', err);
    return {
      success: false,
      totalAnswers: 0,
      correctCount: 0,
      results: [],
      error: 'Falha ao registrar sessão de revisão no servidor.',
    };
  }
}
