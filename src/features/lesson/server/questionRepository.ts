import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  isQuestionEligibleForStudents,
  studentQuestionSchema,
  editorialQuestionSchema,
  questionAnswerKeySchema,
  toStudentQuestion,
  type ValidatedQuestion,
  type ValidatedStudentQuestion,
  type ValidatedQuestionAnswerKey,
  type ValidatedEditorialQuestion,
} from '../schemas/questionSchema';
import type { StudentQuestion, QuestionAnswerKey } from '../types/question';
import fallbackQuestionsRaw from '@/data/questions-sinalizacao.json';

export type RepositoryDataSource = 'remote' | 'local_fallback';

const APPROVED_QUESTION_CACHE_TTL_MS = 45_000;
const APPROVED_QUESTION_TIMEOUT_MS = 1_500;
const approvedQuestionCache = new Map<string, { expiresAt: number; result: QuestionLoadResult }>();

function withTimeout<T>(promiseLike: PromiseLike<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout ao consultar o acervo de questões.')), timeoutMs);
    Promise.resolve(promiseLike).then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}

function cacheApprovedQuestions(key: string, result: QuestionLoadResult, ttl = APPROVED_QUESTION_CACHE_TTL_MS) {
  approvedQuestionCache.set(key, { expiresAt: Date.now() + ttl, result });
}

export interface QuestionLoadResult {
  questions: StudentQuestion[];
  source: RepositoryDataSource;
  remoteError?: string;
}

interface DatabaseStudentRow {
  id: string;
  version: number;
  statement: string;
  options: unknown;
  topic: string;
  subtopic: string | null;
  ufs: string[] | null;
  categories: string[] | null;
  status: string;
  is_example: boolean;
  question_sources:
    | {
        kind: string;
        document: string | null;
        provision: string | null;
        url: string | null;
        checked_at: string | null;
        effective_from: string | null;
        effective_until: string | null;
        source_version: string | null;
        license_note: string | null;
        verification_status: string;
      }
    | Array<{
        kind: string;
        document: string | null;
        provision: string | null;
        url: string | null;
        checked_at: string | null;
        effective_from: string | null;
        effective_until: string | null;
        source_version: string | null;
        license_note: string | null;
        verification_status: string;
      }>
    | null;
}

/**
 * Mapeia uma linha completa do banco de dados (com fontes e revisões) para Question editorial.
 */
export function mapAndValidateEditorialQuestion(row: any): ValidatedQuestion {
  const sourceRaw = Array.isArray(row.question_sources)
    ? row.question_sources[0]
    : row.question_sources;
  const reviewRaw = Array.isArray(row.question_reviews)
    ? row.question_reviews[0]
    : row.question_reviews;

  const candidate = {
    id: row.id,
    version: row.version,
    statement: row.statement,
    options: row.options,
    correctOptionId: row.correct_option_id ?? row.correctOptionId,
    explanation: row.explanation,
    topic: row.topic,
    subtopic: row.subtopic ?? undefined,
    ufs: row.ufs ?? [],
    categories: row.categories ?? [],
    status: row.status,
    isExample: row.is_example ?? row.isExample,
    source: sourceRaw
      ? {
          kind: sourceRaw.kind ?? 'official',
          document: sourceRaw.document ?? null,
          provision: sourceRaw.provision ?? null,
          url: sourceRaw.url ?? null,
          checkedAt: sourceRaw.checked_at ?? sourceRaw.checkedAt ?? null,
          effectiveFrom: sourceRaw.effective_from ?? sourceRaw.effectiveFrom ?? null,
          effectiveUntil: sourceRaw.effective_until ?? sourceRaw.effectiveUntil ?? null,
          sourceVersion: sourceRaw.source_version ?? sourceRaw.sourceVersion ?? null,
          licenseNote: sourceRaw.license_note ?? sourceRaw.licenseNote ?? null,
          verificationStatus: sourceRaw.verification_status ?? sourceRaw.verificationStatus ?? 'pending',
        }
      : undefined,
    review: reviewRaw
      ? {
          generatorModel: reviewRaw.generator_model ?? reviewRaw.generatorModel,
          verifierModel: reviewRaw.verifier_model ?? reviewRaw.verifierModel,
          verificationNotes: reviewRaw.verification_notes ?? reviewRaw.verificationNotes,
          approvedBy: reviewRaw.approved_by ?? reviewRaw.approvedBy,
          approvedAt: reviewRaw.approved_at ?? reviewRaw.approvedAt,
        }
      : undefined,
  };

  return editorialQuestionSchema.parse(candidate);
}

export const mapAndValidateDatabaseQuestion = mapAndValidateEditorialQuestion;

/**
 * Mapeia uma linha discente pública para o DTO sanitizado StudentQuestion.
 * O Zod rejeita qualquer presença de correctOptionId ou explanation.
 */
export function mapAndValidateStudentQuestion(row: DatabaseStudentRow): ValidatedStudentQuestion {
  const sourceRaw = Array.isArray(row.question_sources)
    ? row.question_sources[0]
    : row.question_sources;

  const candidate = {
    id: row.id,
    version: row.version,
    statement: row.statement,
    options: row.options,
    topic: row.topic,
    subtopic: row.subtopic ?? undefined,
    ufs: row.ufs ?? [],
    categories: row.categories ?? [],
    status: row.status,
    isExample: row.is_example,
    source: {
      kind: sourceRaw?.kind ?? 'official',
      document: sourceRaw?.document ?? null,
      provision: sourceRaw?.provision ?? null,
      url: sourceRaw?.url ?? null,
      checkedAt: sourceRaw?.checked_at ?? null,
      effectiveFrom: sourceRaw?.effective_from ?? null,
      effectiveUntil: sourceRaw?.effective_until ?? null,
      sourceVersion: sourceRaw?.source_version ?? null,
      licenseNote: sourceRaw?.license_note ?? null,
      verificationStatus: sourceRaw?.verification_status ?? 'pending',
    },
  };

  return studentQuestionSchema.parse(candidate);
}

/**
 * Busca questões aprovadas sanitizadas para estudantes (Lição, Simulado, Revisão).
 * Consome exclusivamente a interface pública e segura (sem correct_option_id, explanation ou reviews).
 */
export async function getApprovedQuestionsWithReport(
  topic = 'Sinalização de Trânsito',
  options: { fallbackToLocal?: boolean } = { fallbackToLocal: true }
): Promise<QuestionLoadResult> {
  const cacheKey = topic.toLocaleLowerCase('pt-BR');
  if (options.fallbackToLocal !== false) {
    const cached = approvedQuestionCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.result;
    if (cached) approvedQuestionCache.delete(cacheKey);
  }

  try {
    const supabase = await createClient();

    // Consulta estritamente as colunas públicas permitidas na migration 000009
    const { data, error } = await withTimeout(supabase
      .from('questions')
      .select(`
        id,
        version,
        statement,
        options,
        topic,
        subtopic,
        ufs,
        categories,
        status,
        is_example,
        question_sources (
          kind,
          document,
          provision,
          url,
          checked_at,
          effective_from,
          effective_until,
          source_version,
          license_note,
          verification_status
        )
      `)
      .eq('status', 'aprovada')
      .eq('is_example', false)
      .ilike('topic', `%${topic}%`)
      .order('id', { ascending: true }), APPROVED_QUESTION_TIMEOUT_MS);

    if (error) {
      console.warn(
        `[QuestionRepository][ERROR] Falha na consulta remota ao Supabase: ${error.message} (Code: ${error.code}).`
      );
      if (options.fallbackToLocal) {
        const fallback = { questions: getFallbackApprovedQuestions(), source: 'local_fallback' as const, remoteError: error.message };
        cacheApprovedQuestions(cacheKey, fallback, 8_000);
        return fallback;
      }
      throw error;
    }

    if (!data || data.length === 0) {
      console.info('[QuestionRepository] Nenhuma questão remota retornada para o tópico solicitado.');
      if (options.fallbackToLocal) {
        const fallback = { questions: getFallbackApprovedQuestions(), source: 'local_fallback' as const };
        cacheApprovedQuestions(cacheKey, fallback, 8_000);
        return fallback;
      }
      return {
        questions: [],
        source: 'remote',
      };
    }

    // Validação estrita discente via studentQuestionSchema
    const validatedQuestions = (data as unknown as DatabaseStudentRow[])
      .map(mapAndValidateStudentQuestion)
      .filter((q) => isQuestionEligibleForStudents(q));

    // Complementa resultados remotos incompletos com o seed local já homologado.
    // A elegibilidade é mantida: questões em revisão jamais entram neste conjunto.
    const isSignalingTopic = topic.toLocaleLowerCase('pt-BR').includes('sinaliza');
    const mergedById = new Map(validatedQuestions.map((question) => [question.id, question]));
    if (isSignalingTopic) {
      for (const localQuestion of getFallbackApprovedQuestions()) {
        if (!mergedById.has(localQuestion.id)) mergedById.set(localQuestion.id, localQuestion);
      }
    }
    const mergedQuestions = Array.from(mergedById.values()).sort((a, b) => a.id.localeCompare(b.id, 'en'));
    const wasSupplemented = mergedQuestions.length > validatedQuestions.length;

    console.info(
      `[QuestionRepository] Disponíveis ${mergedQuestions.length} questões aprovadas sanitizadas (${validatedQuestions.length} remotas).`
    );
    const result: QuestionLoadResult = {
      questions: mergedQuestions,
      source: wasSupplemented ? 'local_fallback' : 'remote',
    };
    cacheApprovedQuestions(cacheKey, result);
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[QuestionRepository][EXCEPTION] Erro ao carregar questões remotas: ${message}`);
    if (options.fallbackToLocal) {
      const fallback = { questions: getFallbackApprovedQuestions(), source: 'local_fallback' as const, remoteError: message };
      cacheApprovedQuestions(cacheKey, fallback, 8_000);
      return fallback;
    }
    throw err;
  }
}

/**
 * Interface compatível padrão para consulta de questões discentes aprovadas.
 */
export async function getApprovedQuestionsByTopic(
  topic = 'Sinalização de Trânsito',
  options: { fallbackToLocal?: boolean } = { fallbackToLocal: true }
): Promise<StudentQuestion[]> {
  const result = await getApprovedQuestionsWithReport(topic, options);
  return result.questions;
}

/**
 * Carrega a chave de resposta privada de uma questão específica EXCLUSIVAMENTE no servidor.
 * Nunca expor para componentes cliente.
 */
export async function getQuestionAnswerKey(questionId: string): Promise<QuestionAnswerKey | null> {
  // Caminho rápido e privado no servidor para questões do seed editorial aprovado.
  const rawItem = (fallbackQuestionsRaw as unknown as Array<{
    id: string;
    correctOptionId: 'a' | 'b' | 'c' | 'd';
    explanation: string;
    status: string;
    isExample?: boolean;
  }>).find((q) => q.id === questionId && q.status === 'aprovada' && !q.isExample);

  if (rawItem) {
    return questionAnswerKeySchema.parse({
      questionId: rawItem.id,
      correctOptionId: rawItem.correctOptionId,
      explanation: rawItem.explanation,
    });
  }

  // Só consulta service_role para IDs ausentes do seed local aprovado.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from('questions')
        .select('id, correct_option_id, explanation, status, is_example')
        .eq('id', questionId)
        .maybeSingle();

      if (!error && data && data.status === 'aprovada' && !data.is_example) {
        return questionAnswerKeySchema.parse({
          questionId: data.id,
          correctOptionId: data.correct_option_id,
          explanation: data.explanation,
        });
      }
    } catch (err) {
      console.warn('[QuestionRepository] Falha ao consultar chave via service_role, recorrendo ao acervo local:', err);
    }
  }

  return null;
}

/**
 * Carrega em lote as chaves de resposta privadas no servidor.
 */
export async function getQuestionAnswerKeys(
  questionIds: string[]
): Promise<Map<string, QuestionAnswerKey>> {
  const keysMap = new Map<string, QuestionAnswerKey>();
  const idSet = new Set(questionIds);

  // Preenche primeiro as chaves do seed aprovado, sem aguardar a rede.
  for (const raw of fallbackQuestionsRaw as unknown as Array<{
    id: string;
    correctOptionId: 'a' | 'b' | 'c' | 'd';
    explanation: string;
    status: string;
    isExample?: boolean;
  }>) {
    if (idSet.has(raw.id) && raw.status === 'aprovada' && !raw.isExample) {
      keysMap.set(raw.id, questionAnswerKeySchema.parse({
        questionId: raw.id,
        correctOptionId: raw.correctOptionId,
        explanation: raw.explanation,
      }));
    }
  }
  const missingIds = questionIds.filter((id) => !keysMap.has(id));
  if (missingIds.length === 0) return keysMap;

  // Consulta remota somente para questões que não existem no seed local aprovado.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from('questions')
        .select('id, correct_option_id, explanation, status, is_example')
        .in('id', missingIds);

      if (!error && data) {
        for (const row of data) {
          if (row.status === 'aprovada' && !row.is_example) {
            keysMap.set(
              row.id,
              questionAnswerKeySchema.parse({
                questionId: row.id,
                correctOptionId: row.correct_option_id,
                explanation: row.explanation,
              })
            );
          }
        }
      }
    } catch (err) {
      console.warn('[QuestionRepository] Falha na consulta em lote via service_role:', err);
    }
  }

  return keysMap;
}

/**
 * Consulta autorizada exclusiva para o Painel Editorial no Servidor.
 * Exige cliente administrativo (service_role) e valida contra editorialQuestionSchema.
 */
export async function getEditorialQuestionsByTopic(
  topic = 'Sinalização de Trânsito'
): Promise<ValidatedEditorialQuestion[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('questions')
    .select(`
      id,
      version,
      statement,
      options,
      correct_option_id,
      explanation,
      topic,
      subtopic,
      ufs,
      categories,
      status,
      is_example,
      question_sources (*),
      question_reviews (*)
    `)
    .ilike('topic', `%${topic}%`)
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`[EditorialRepository] Erro ao carregar dados editoriais: ${error.message}`);
  }

  return (data || []).map((row: any) => {
    const sourceRaw = Array.isArray(row.question_sources) ? row.question_sources[0] : row.question_sources;
    const reviewRaw = Array.isArray(row.question_reviews) ? row.question_reviews[0] : row.question_reviews;

    return editorialQuestionSchema.parse({
      id: row.id,
      version: row.version,
      statement: row.statement,
      options: row.options,
      correctOptionId: row.correct_option_id,
      explanation: row.explanation,
      topic: row.topic,
      subtopic: row.subtopic ?? undefined,
      ufs: row.ufs ?? [],
      categories: row.categories ?? [],
      status: row.status,
      isExample: row.is_example,
      source: sourceRaw,
      review: reviewRaw,
    });
  });
}

/**
 * Acervo autoritativo server-only: une o catálogo remoto editorial ao seed local aprovado.
 * IDs são deduplicados e qualquer questão não aprovada é descartada; nunca promove pendências.
 */
export async function getAuthoritativeQuestionsWithFallback(
  topic = 'Sinalização de Trânsito'
): Promise<ValidatedQuestion[]> {
  const byId = new Map<string, ValidatedQuestion>();
  const normalizedTopic = topic.toLocaleLowerCase('pt-BR');

  for (const question of getAuthoritativeQuestionsForServer()) {
    if (question.topic.toLocaleLowerCase('pt-BR').includes(normalizedTopic)) {
      byId.set(question.id, question);
    }
  }

  try {
    const remoteQuestions = await getEditorialQuestionsByTopic(topic);
    for (const question of remoteQuestions) {
      if (isQuestionEligibleForStudents(question)) {
        byId.set(question.id, question as ValidatedQuestion);
      }
    }
  } catch (error) {
    console.warn('[QuestionRepository] Acervo remoto indisponível; usando seed local aprovado:', error);
  }

  return Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id, 'en'));
}

/**
 * Retorna as 20 questões homologadas do acervo local sanitizadas para estudantes.
 */
export function getFallbackApprovedQuestions(): StudentQuestion[] {
  return (fallbackQuestionsRaw as unknown[])
    .filter((q: any) => isQuestionEligibleForStudents(q))
    .map((q) => toStudentQuestion(q as any));
}

/**
 * Retorna as questões do acervo local completas com gabarito para uso exclusivo no servidor.
 */
export function getAuthoritativeQuestionsForServer(): ValidatedQuestion[] {
  return (fallbackQuestionsRaw as unknown[])
    .map((q) => editorialQuestionSchema.parse(q))
    .filter(isQuestionEligibleForStudents);
}
