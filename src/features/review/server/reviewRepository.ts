import { createClient } from '@/lib/supabase/server';
import { getSupabaseAuthContext } from '@/lib/supabase/authContext';
import { getApprovedQuestionsByTopic, getQuestionAnswerKeys } from '@/features/lesson/server/questionRepository';
import type { Question, StudentQuestion } from '@/features/lesson/types/question';
import type {
  UserAnswerRecord,
  ReviewDashboardData,
  ReviewItem,
} from '../types/review';
import {
  calculateQuestionReviewStats,
  sortReviewQueue,
} from '../utils/srsAlgorithm';
import {
  calculateAllSubtopicsMastery,
  UNIT_1_SUBTOPICS,
} from '../utils/masteryCalculator';

// Armazenamento em memória para sessões de visitantes anônimos
export const inMemoryGuestAnswers: UserAnswerRecord[] = [];

/**
 * Consulta o histórico de respostas do aluno no Supabase.
 * Para usuários visitantes ou em fallback, utiliza o armazenamento em memória.
 */
export async function getUserAnswerRecords(customUserId?: string): Promise<UserAnswerRecord[]> {
  try {
    const authContext = customUserId ? null : await getSupabaseAuthContext();
    const supabase = authContext?.supabase ?? await createClient();
    const uid = customUserId ?? authContext?.user?.id;

    if (!uid) {
      return [...inMemoryGuestAnswers];
    }

    const { data, error } = await supabase
      .from('user_answers')
      .select('id, question_id, session_id, selected_option_id, is_correct, answered_at')
      .eq('user_id', uid)
      .order('answered_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return inMemoryGuestAnswers.filter((a) => a.id.startsWith(uid!)) || [];
    }

    return data.map((row) => ({
      id: row.id,
      question_id: row.question_id,
      session_id: row.session_id,
      selected_option_id: row.selected_option_id,
      is_correct: row.is_correct,
      answered_at: row.answered_at,
    }));
  } catch {
    return [...inMemoryGuestAnswers];
  }
}

/**
 * Monta os dados consolidados do centro de revisão:
 * - Indicadores de domínio por dispositivo legal / subtema
 * - Fila determinística de repetição espaçada com prioridades e explicações
 */
export async function getReviewDashboardData(customUserId?: string): Promise<ReviewDashboardData> {
  const allQuestions = await getApprovedQuestionsByTopic('Sinalização de Trânsito');
  const questionMap = new Map<string, StudentQuestion>(allQuestions.map((q) => [q.id, q]));

  const records = await getUserAnswerRecords(customUserId);

  // Agrupa respostas por question_id
  const answersByQuestionId = new Map<string, UserAnswerRecord[]>();
  for (const record of records) {
    const list = answersByQuestionId.get(record.question_id) ?? [];
    list.push(record);
    answersByQuestionId.set(record.question_id, list);
  }

  // 1. Diagnóstico de domínio de todos os subtemas
  const subtopics = calculateAllSubtopicsMastery(answersByQuestionId);

  // 2. Fila de repetição espaçada
  const queueItems: ReviewItem[] = [];
  const now = new Date();

  for (const [qId, answers] of answersByQuestionId.entries()) {
    const question = questionMap.get(qId);
    if (!question) continue;

    const stats = calculateQuestionReviewStats(qId, answers, now);
    if (stats) {
      queueItems.push({
        question,
        stats,
      });
    }
  }

  // Ordena a fila segundo regras determinísticas de prioridade (D018)
  const sortedQueue = sortReviewQueue(queueItems);

  const totalOverdue = sortedQueue.filter((item) => item.stats.isOverdue).length;
  const totalRecentErrors = sortedQueue.filter((item) => !item.stats.lastIsCorrect).length;
  const unitQuestionIds = new Set(UNIT_1_SUBTOPICS.flatMap((subtopic) => subtopic.questionIds));
  const totalPracticedQuestions = Array.from(answersByQuestionId.keys()).filter((id) =>
    unitQuestionIds.has(id)
  ).length;

  return {
    subtopics,
    queue: sortedQueue,
    totalOverdue,
    totalRecentErrors,
    totalPracticedQuestions,
  };
}

/**
 * Retorna as 5 questões prioritárias para um treino de revisão espaçada.
 * Se o aluno praticou menos de 5 questões ou tem poucas pendências, completa
 * deterministicamente com questões dos subtemas menos praticados.
 */
export async function getPriorityReviewQuestions(
  limit = 5,
  customUserId?: string
): Promise<(StudentQuestion | Question)[]> {
  const allQuestions = await getApprovedQuestionsByTopic('Sinalização de Trânsito');
  const dashboard = await getReviewDashboardData(customUserId);

  const selectedQuestions: (StudentQuestion | Question)[] = [];
  const selectedIds = new Set<string>();

  // 1. Primeiro seleciona da fila ordenada de prioridade (questões que precisam de revisão)
  for (const item of dashboard.queue) {
    if (selectedQuestions.length >= limit) break;
    selectedQuestions.push(item.question);
    selectedIds.add(item.question.id);
  }

  // 2. Se faltam questões para atingir o limite (ex.: aluno novo ou 100% dominado):
  // Complementa com questões que ainda não foram praticadas ou da sequência padrão
  if (selectedQuestions.length < limit) {
    for (const q of allQuestions) {
      if (selectedQuestions.length >= limit) break;
      if (!selectedIds.has(q.id)) {
        selectedQuestions.push(q);
        selectedIds.add(q.id);
      }
    }
  }

  return selectedQuestions;
}

/**
 * Submete as respostas de uma sessão de revisão espaçada e atualiza o histórico em user_answers.
 */
export async function submitReviewSession(
  answers: Array<{ questionId: string; selectedOptionId: string }>,
  customUserId?: string
) {
  const allQuestions = await getApprovedQuestionsByTopic('Sinalização de Trânsito');
  const answerKeys = await getQuestionAnswerKeys(answers.map((a) => a.questionId));
  const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

  const supabase = await createClient();
  let uid = customUserId;

  if (!uid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uid = user?.id;
  }

  const results = [];
  const nowIso = new Date().toISOString();

  // Localiza a sessão da questão para consistência
  const findSessionId = (qId: string): number => {
    for (const meta of UNIT_1_SUBTOPICS) {
      if (meta.questionIds.includes(qId)) return meta.sessionId;
    }
    return 1;
  };

  for (const sub of answers) {
    const q = questionMap.get(sub.questionId);
    const key = answerKeys.get(sub.questionId);
    if (!q || !key) continue;

    const isCorrect = sub.selectedOptionId === key.correctOptionId;
    const sessionId = findSessionId(sub.questionId);

    const record: UserAnswerRecord = {
      id: `ans-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      question_id: sub.questionId,
      session_id: sessionId,
      selected_option_id: sub.selectedOptionId,
      is_correct: isCorrect,
      answered_at: nowIso,
    };

    results.push(record);

    if (uid) {
      await supabase.from('user_answers').insert({
        user_id: uid,
        question_id: sub.questionId,
        session_id: sessionId,
        selected_option_id: sub.selectedOptionId,
        is_correct: isCorrect,
      });
    } else {
      inMemoryGuestAnswers.push(record);
    }
  }

  return {
    success: true,
    totalAnswers: results.length,
    correctCount: results.filter((r) => r.is_correct).length,
    results,
  };
}
