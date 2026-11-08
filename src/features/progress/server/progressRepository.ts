import { createClient } from '@/lib/supabase/server';
import { getApprovedQuestionsByTopic } from '@/features/lesson/server/questionRepository';
import { calculateDailyStreak } from '../utils/streakCalculator';
import type {
  StudentProfile,
  LessonSessionProgress,
  SessionSubmissionPayload,
  SessionSubmissionResult,
  QuestionEvaluationResult,
} from '../types/progress';

export const GUEST_PROFILE: StudentProfile = {
  id: 'guest',
  email: 'visitante@aprovacnh.com.br',
  fullName: 'Estudante Visitante',
  uf: 'MG',
  targetCategory: 'B',
  role: 'student',
  xpTotal: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
};

/**
 * Obtém o perfil do aluno autenticado no Supabase.
 * Retorna o perfil de visitante caso o usuário não esteja logado ou em caso de fallback.
 */
export async function getStudentProfile(): Promise<StudentProfile> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return GUEST_PROFILE;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, uf, target_category, role, xp_total, current_streak, longest_streak, last_activity_date')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !profile) {
      return {
        ...GUEST_PROFILE,
        id: user.id,
        email: user.email ?? GUEST_PROFILE.email,
        fullName: user.user_metadata?.full_name ?? GUEST_PROFILE.fullName,
        uf: user.user_metadata?.uf ?? 'MG',
        targetCategory: user.user_metadata?.target_category ?? 'B',
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      uf: profile.uf ?? 'MG',
      targetCategory: profile.target_category,
      role: (profile.role as StudentProfile['role']) ?? 'student',
      xpTotal: profile.xp_total ?? 0,
      currentStreak: profile.current_streak ?? 0,
      longestStreak: profile.longest_streak ?? 0,
      lastActivityDate: profile.last_activity_date,
    };
  } catch {
    return GUEST_PROFILE;
  }
}

/**
 * Atualiza os dados de perfil (Nome, UF e Categoria CNH) do aluno.
 */
export async function updateStudentProfile(data: {
  fullName?: string;
  uf?: string | null;
  targetCategory?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (data.uf && data.uf.trim().toUpperCase() === 'BR') {
      return { success: false, error: 'A sigla "BR" não é permitida como código de UF (D014).' };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.fullName !== undefined) updates.full_name = data.fullName.trim();
    if (data.uf !== undefined) updates.uf = data.uf ? data.uf.trim().toUpperCase() : null;
    if (data.targetCategory !== undefined) updates.target_category = data.targetCategory;

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro ao atualizar perfil.',
    };
  }
}

/**
 * Retorna o mapa de progresso das 4 sessões da trilha de um determinado tema.
 */
export async function getLessonTopicProgress(
  topic = 'Sinalização de Trânsito'
): Promise<LessonSessionProgress[]> {
  const defaultSessions: LessonSessionProgress[] = [1, 2, 3, 4].map((id) => ({
    sessionId: id,
    topic,
    status: 'available',
    score: 0,
    maxScore: 5,
    xpEarned: 0,
    completedAt: null,
  }));

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return defaultSessions;
    }

    const { data: rows, error } = await supabase
      .from('lesson_progress')
      .select('session_id, topic, status, score, max_score, xp_earned, completed_at')
      .eq('user_id', user.id)
      .eq('topic', topic);

    if (error || !rows || rows.length === 0) {
      return defaultSessions;
    }

    const progressMap = new Map<number, (typeof rows)[0]>();
    for (const row of rows) {
      progressMap.set(row.session_id, row);
    }

    return defaultSessions.map((session) => {
      const saved = progressMap.get(session.sessionId);
      if (!saved) return session;

      return {
        sessionId: session.sessionId,
        topic,
        status: (saved.status as LessonSessionProgress['status']) ?? 'available',
        score: saved.score ?? 0,
        maxScore: saved.max_score ?? 5,
        xpEarned: saved.xp_earned ?? 0,
        completedAt: saved.completed_at,
      };
    });
  } catch {
    return defaultSessions;
  }
}

/**
 * Avalia as respostas submetidas no servidor, apura o gabarito oficial,
 * calcula o XP (apenas na 1ª conclusão) e atualiza o streak diário e progresso.
 */
export async function evaluateAndRecordSession(
  payload: SessionSubmissionPayload
): Promise<SessionSubmissionResult> {
  const allQuestions = await getApprovedQuestionsByTopic(payload.topic);

  // Isola as 5 questões da sessão (Sessão 1: 0-5, Sessão 2: 5-10, etc.)
  const sessionNum = Math.max(1, Math.min(4, payload.sessionId));
  const startIndex = (sessionNum - 1) * 5;
  const sessionQuestions = allQuestions.slice(startIndex, startIndex + 5);

  const questionMap = new Map(sessionQuestions.map((q) => [q.id, q]));
  let score = 0;
  const results: QuestionEvaluationResult[] = [];

  for (const submitted of payload.answers) {
    const officialQ = questionMap.get(submitted.questionId);
    if (!officialQ) continue;

    const isCorrect = submitted.selectedOptionId === officialQ.correctOptionId;
    if (isCorrect) {
      score += 1;
    }

    results.push({
      questionId: submitted.questionId,
      selectedOptionId: submitted.selectedOptionId,
      correctOptionId: officialQ.correctOptionId,
      isCorrect,
    });
  }

  // Obter usuário autenticado
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se não autenticado (modo visitante), calcula os resultados em memória sem gravar no banco
  if (!user) {
    const xpSimulated = score * 10 + (results.length === 5 ? 20 : 0);
    return {
      success: true,
      score,
      maxScore: 5,
      xpAwarded: xpSimulated,
      isFirstCompletion: true,
      currentStreak: 1,
      longestStreak: 1,
      results,
    };
  }

  // 1. Verifica se a sessão já foi concluída previamente (Regra: XP apenas na 1ª conclusão)
  const { data: previousProgress } = await supabase
    .from('lesson_progress')
    .select('status, score, xp_earned')
    .eq('user_id', user.id)
    .eq('topic', payload.topic)
    .eq('session_id', sessionNum)
    .maybeSingle();

  const isFirstCompletion = previousProgress?.status !== 'completed';

  // Concede XP somente na primeira conclusão (máximo 70 XP: 10 por acerto + 20 bônus)
  const xpAwarded = isFirstCompletion ? score * 10 + (results.length === 5 ? 20 : 0) : 0;

  // 2. Registra o histórico individual de respostas em user_answers
  if (results.length > 0) {
    const answersToInsert = results.map((r) => ({
      user_id: user.id,
      question_id: r.questionId,
      session_id: sessionNum,
      selected_option_id: r.selectedOptionId,
      is_correct: r.isCorrect,
    }));

    await supabase.from('user_answers').insert(answersToInsert);
  }

  // 3. Atualiza ou insere o progresso da sessão
  await supabase.from('lesson_progress').upsert(
    {
      user_id: user.id,
      topic: payload.topic,
      session_id: sessionNum,
      status: 'completed',
      score,
      max_score: 5,
      xp_earned: isFirstCompletion ? xpAwarded : previousProgress?.xp_earned ?? 0,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,topic,session_id' }
  );

  // 4. Se houve XP concedido, grava no extrato de transações
  if (xpAwarded > 0) {
    await supabase.from('xp_transactions').insert({
      user_id: user.id,
      amount: xpAwarded,
      reason: 'lesson_session_completed',
      reference_id: `${payload.topic}_sessao_${sessionNum}`,
    });
  }

  // 5. Calcula o streak diário temporal (America/Sao_Paulo) e atualiza o perfil
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('xp_total, current_streak, longest_streak, last_activity_date')
    .eq('id', user.id)
    .maybeSingle();

  const streakResult = calculateDailyStreak(
    currentProfile?.current_streak ?? 0,
    currentProfile?.longest_streak ?? 0,
    currentProfile?.last_activity_date ?? null
  );

  const updatedXpTotal = (currentProfile?.xp_total ?? 0) + xpAwarded;

  await supabase
    .from('profiles')
    .update({
      xp_total: updatedXpTotal,
      current_streak: streakResult.currentStreak,
      longest_streak: streakResult.longestStreak,
      last_activity_date: streakResult.lastActivityDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  return {
    success: true,
    score,
    maxScore: 5,
    xpAwarded,
    isFirstCompletion,
    currentStreak: streakResult.currentStreak,
    longestStreak: streakResult.longestStreak,
    results,
  };
}
