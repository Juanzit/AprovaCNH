import { createClient } from '@/lib/supabase/server';
import { getApprovedQuestionsByTopic } from '@/features/lesson/server/questionRepository';
import { calculateDailyStreak } from '@/features/progress/utils/streakCalculator';
import {
  DEFAULT_EXAM_CONFIG,
  examConfigSchema,
  simuladoSubmissionSchema,
  type ExamConfig,
  type SimuladoEvaluatedItem,
  type SimuladoHistorySummary,
  type SimuladoQuestionItem,
  type SimuladoResult,
  type SimuladoStatus,
} from '../types/simulado';
import {
  evaluateSimuladoSubmission,
  generateSimuladoQuestions,
} from '../utils/simuladoGenerator';

interface DbExamConfigRow {
  id: string;
  name: string;
  uf: string | null;
  total_questions: number;
  duration_minutes: number;
  passing_score: number;
  normative_act: string;
  effective_from: string;
  effective_until: string | null;
  version: number;
  is_active: boolean;
}

/**
 * Busca a configuração oficial ativa para o simulado no Supabase.
 * Em caso de tabela ainda não migrada ou falha de rede, retorna DEFAULT_EXAM_CONFIG (D007).
 */
export async function getActiveExamConfig(uf: string | null = 'MG'): Promise<ExamConfig> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('exam_configs')
      .select(
        'id, name, uf, total_questions, duration_minutes, passing_score, normative_act, effective_from, effective_until, version, is_active'
      )
      .eq('is_active', true);

    if (uf) {
      query = query.eq('uf', uf.toUpperCase());
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return DEFAULT_EXAM_CONFIG;
    }

    const row = data as unknown as DbExamConfigRow;
    const parsed = examConfigSchema.safeParse({
      id: row.id,
      name: row.name,
      uf: row.uf,
      totalQuestions: row.total_questions,
      durationMinutes: row.duration_minutes,
      passingScore: row.passing_score,
      normativeAct: row.normative_act,
      effectiveFrom: row.effective_from,
      effectiveUntil: row.effective_until,
      version: row.version,
      isActive: row.is_active,
    });

    return parsed.success ? parsed.data : DEFAULT_EXAM_CONFIG;
  } catch {
    return DEFAULT_EXAM_CONFIG;
  }
}

/**
 * Inicializa uma nova sessão de Simulado Configurável (30 questões, 60 min, corte 20).
 * Persiste no Supabase quando o aluno está autenticado; retorna sessão em memória para visitantes.
 */
async function getBnqApprovedQuestionBank() {
  const approvedQuestions = await getApprovedQuestionsByTopic(null);
  return approvedQuestions.filter((question) => question.id.startsWith('bnq-p'));
}

export async function initializeSimuladoSession(options?: {
  uf?: string | null;
  seed?: number;
  durationMinutes?: number;
}): Promise<{
  simuladoId: string;
  config: ExamConfig;
  startedAt: string;
  items: SimuladoQuestionItem[];
  isGuest: boolean;
}> {
  const [baseConfig, questions] = await Promise.all([
    getActiveExamConfig(options?.uf ?? 'MG'),
    getBnqApprovedQuestionBank(),
  ]);

  const config: ExamConfig = options?.durationMinutes
    ? { ...baseConfig, durationMinutes: options.durationMinutes }
    : baseConfig;

  const items = generateSimuladoQuestions(questions, {
    totalQuestions: config.totalQuestions,
    uf: config.uf,
    seed: options?.seed,
  });

  const startedAt = new Date().toISOString();
  const fallbackId = `sim-${Date.now()}`;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        simuladoId: fallbackId,
        config,
        startedAt,
        items,
        isGuest: true,
      };
    }

    // Verifica se já existe uma sessão recente em andamento (recuperação transparente em caso de reload)
    const { data: existingSession } = await supabase
      .from('simulado_sessions')
      .select('id, started_at, total_questions, passing_score, status')
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSession?.started_at) {
      const elapsedSec = (Date.now() - new Date(existingSession.started_at).getTime()) / 1000;
      if (elapsedSec < config.durationMinutes * 60) {
        const { data: existingAnswers } = await supabase
          .from('simulado_answers')
          .select('question_id, question_order, selected_option_id, is_marked_for_review')
          .eq('simulado_id', existingSession.id)
          .order('question_order', { ascending: true });

        if (existingAnswers && existingAnswers.length === config.totalQuestions) {
          const questionMap = new Map(questions.map((q) => [q.id, q]));
          const restoredItems: SimuladoQuestionItem[] = [];
          for (const ans of existingAnswers) {
            const q = questionMap.get(ans.question_id);
            if (q) {
              restoredItems.push({
                questionOrder: ans.question_order,
                question: q,
              });
            }
          }

          if (restoredItems.length === config.totalQuestions) {
            return {
              simuladoId: existingSession.id,
              config,
              startedAt: existingSession.started_at,
              items: restoredItems,
              isGuest: false,
            };
          }
        }
      }
    }

    const { data: sessionRow, error: sessionErr } = await supabase
      .from('simulado_sessions')
      .insert({
        user_id: user.id,
        config_id: config.id,
        started_at: startedAt,
        total_questions: config.totalQuestions,
        passing_score: config.passingScore,
        status: 'in_progress',
      })
      .select('id, started_at')
      .single();

    if (sessionErr || !sessionRow) {
      return {
        simuladoId: fallbackId,
        config,
        startedAt,
        items,
        isGuest: false,
      };
    }

    const answerRows = items.map((item) => ({
      simulado_id: sessionRow.id,
      question_id: item.question.id,
      question_order: item.questionOrder,
      selected_option_id: null,
      is_marked_for_review: false,
    }));

    await supabase.from('simulado_answers').insert(answerRows);

    return {
      simuladoId: sessionRow.id,
      config,
      startedAt: sessionRow.started_at ?? startedAt,
      items,
      isGuest: false,
    };
  } catch {
    return {
      simuladoId: fallbackId,
      config,
      startedAt,
      items,
      isGuest: true,
    };
  }
}

/**
 * Avalia autoritativamente as respostas do simulado no servidor, calcula aprovação (corte 20/30),
 * atualiza sessão, respostas, XP e streak no Supabase (quando autenticado) e devolve o gabarito completo.
 */
export async function submitAndEvaluateSimulado(rawPayload: unknown): Promise<{
  success: boolean;
  result?: SimuladoResult;
  error?: string;
}> {
  const parsed = simuladoSubmissionSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Dados de submissão do simulado inválidos.',
    };
  }

  const payload = parsed.data;
  const [baseConfig, questions] = await Promise.all([
    getActiveExamConfig('MG'),
    getBnqApprovedQuestionBank(),
  ]);

  const config: ExamConfig = payload.durationMinutes
    ? { ...baseConfig, durationMinutes: payload.durationMinutes }
    : baseConfig;

  const finishedAt = new Date().toISOString();
  const result = evaluateSimuladoSubmission(payload, questions, config, finishedAt);

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && !payload.simuladoId.startsWith('sim-')) {
      // Prevenção contra submissão duplicada (idempotência no servidor)
      const { data: existingSession } = await supabase
        .from('simulado_sessions')
        .select('status, score, is_approved, xp_earned, duration_seconds')
        .eq('id', payload.simuladoId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (
        existingSession &&
        (existingSession.status === 'completed' || existingSession.status === 'timed_out')
      ) {
        return {
          success: true,
          result,
        };
      }
      await supabase
        .from('simulado_sessions')
        .update({
          finished_at: finishedAt,
          duration_seconds: result.durationSeconds,
          score: result.score,
          is_approved: result.isApproved,
          status: result.status,
          xp_earned: result.xpEarned,
        })
        .eq('id', payload.simuladoId)
        .eq('user_id', user.id);

      for (const evalItem of result.evaluatedItems) {
        await supabase
          .from('simulado_answers')
          .update({
            selected_option_id: evalItem.selectedOptionId,
            is_marked_for_review: evalItem.isMarkedForReview,
            is_correct: evalItem.isCorrect,
            answered_at: evalItem.selectedOptionId ? finishedAt : null,
          })
          .eq('simulado_id', payload.simuladoId)
          .eq('question_order', evalItem.questionOrder);
      }

      // Persiste também no histórico global user_answers as questões respondidas para alimentar o SRS
      const answeredForSrs = result.evaluatedItems
        .filter((item) => item.selectedOptionId !== null)
        .map((item) => ({
          user_id: user.id,
          question_id: item.question.id,
          session_id: 1,
          selected_option_id: item.selectedOptionId!,
          is_correct: item.isCorrect,
          answered_at: finishedAt,
        }));

      if (answeredForSrs.length > 0) {
        await supabase.from('user_answers').insert(answeredForSrs);
      }

      // Credita XP e atualiza streak diário do perfil
      if (result.xpEarned > 0) {
        await supabase.from('xp_transactions').insert({
          user_id: user.id,
          amount: result.xpEarned,
          reason: result.isApproved ? 'simulado_aprovado' : 'simulado_concluido',
          reference_id: payload.simuladoId,
        });

        const { data: profileData } = await supabase
          .from('profiles')
          .select('xp_total, current_streak, longest_streak, last_activity_date')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData) {
          const streakCalc = calculateDailyStreak(
            profileData.last_activity_date,
            profileData.current_streak ?? 0,
            profileData.longest_streak ?? 0,
            new Date(finishedAt)
          );

          await supabase
            .from('profiles')
            .update({
              xp_total: (profileData.xp_total ?? 0) + result.xpEarned,
              current_streak: streakCalc.currentStreak,
              longest_streak: streakCalc.longestStreak,
              last_activity_date: streakCalc.lastActivityDate,
              updated_at: finishedAt,
            })
            .eq('id', user.id);
        }
      }
    }
  } catch {
    // Em modo visitante ou erro transitório de persistência, retorna o resultado calculado sem bloquear o aluno
  }

  return {
    success: true,
    result,
  };
}

/**
 * Recupera o resultado detalhado de um simulado salvo no Supabase pelo ID.
 */
export async function getSimuladoResultById(simuladoId: string): Promise<SimuladoResult | null> {
  if (!simuladoId || simuladoId.startsWith('sim-')) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: sessionRow, error: sessionErr } = await supabase
      .from('simulado_sessions')
      .select(
        'id, config_id, started_at, finished_at, duration_seconds, total_questions, score, passing_score, is_approved, status, xp_earned'
      )
      .eq('id', simuladoId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (sessionErr || !sessionRow) return null;

    const [{ data: answerRows }, config, questions] = await Promise.all([
      supabase
        .from('simulado_answers')
        .select('question_id, question_order, selected_option_id, is_marked_for_review, is_correct')
        .eq('simulado_id', simuladoId)
        .order('question_order', { ascending: true }),
      getActiveExamConfig('MG'),
      getApprovedQuestionsByTopic(null),
    ]);

    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const evaluatedItems: SimuladoEvaluatedItem[] = [];
    let answeredCount = 0;

    for (const row of answerRows ?? []) {
      const q = questionMap.get(row.question_id);
      if (!q) continue;
      const selectedOptionId = row.selected_option_id as SimuladoEvaluatedItem['selectedOptionId'];
      if (selectedOptionId !== null) answeredCount++;

      evaluatedItems.push({
        questionOrder: row.question_order,
        question: q,
        selectedOptionId,
        isMarkedForReview: Boolean(row.is_marked_for_review),
        isCorrect:
          row.is_correct ??
          (selectedOptionId !== null && selectedOptionId === q.correctOptionId),
      });
    }

    const totalQuestions = sessionRow.total_questions ?? config.totalQuestions;
    const score = sessionRow.score ?? 0;

    return {
      simuladoId: sessionRow.id,
      config,
      startedAt: sessionRow.started_at,
      finishedAt: sessionRow.finished_at ?? sessionRow.started_at,
      durationSeconds: sessionRow.duration_seconds ?? 0,
      totalQuestions,
      answeredCount,
      unansweredCount: Math.max(0, totalQuestions - answeredCount),
      score,
      passingScore: sessionRow.passing_score ?? config.passingScore,
      accuracyPercent: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
      isApproved: Boolean(sessionRow.is_approved ?? score >= config.passingScore),
      status: (sessionRow.status as SimuladoStatus) ?? 'completed',
      xpEarned: sessionRow.xp_earned ?? 0,
      evaluatedItems,
    };
  } catch {
    return null;
  }
}

/**
 * Lista o histórico de simulados concluídos pelo usuário autenticado no Supabase.
 */
export async function getSimuladoHistory(): Promise<SimuladoHistorySummary[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('simulado_sessions')
      .select(
        'id, config_id, started_at, finished_at, duration_seconds, total_questions, score, passing_score, is_approved, status, xp_earned'
      )
      .eq('user_id', user.id)
      .in('status', ['completed', 'timed_out'])
      .order('created_at', { ascending: false })
      .limit(25);

    if (error || !data) return [];

    return data.map((row) => {
      const total = row.total_questions ?? 30;
      const score = row.score ?? 0;
      const passingScore = row.passing_score ?? 20;
      return {
        id: row.id,
        configId: row.config_id,
        startedAt: row.started_at,
        finishedAt: row.finished_at,
        durationSeconds: row.duration_seconds ?? 0,
        totalQuestions: total,
        score,
        passingScore,
        accuracyPercent: total > 0 ? Math.round((score / total) * 100) : 0,
        isApproved: Boolean(row.is_approved ?? score >= passingScore),
        status: (row.status as SimuladoStatus) ?? 'completed',
        xpEarned: row.xp_earned ?? 0,
      };
    });
  } catch {
    return [];
  }
}
