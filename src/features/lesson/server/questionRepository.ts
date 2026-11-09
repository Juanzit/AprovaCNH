import { createClient } from '@/lib/supabase/server';
import {
  isQuestionEligibleForStudents,
  questionSchema,
  type ValidatedQuestion,
} from '../schemas/questionSchema';
import fallbackQuestionsRaw from '@/data/questions-sinalizacao.json';

interface DatabaseQuestionRow {
  id: string;
  version: number;
  statement: string;
  options: unknown;
  correct_option_id: string;
  explanation: string;
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
  question_reviews:
    | {
        generator_model: string | null;
        verifier_model: string | null;
        verification_notes: string | null;
        approved_by: string | null;
        approved_at: string | null;
      }
    | Array<{
        generator_model: string | null;
        verifier_model: string | null;
        verification_notes: string | null;
        approved_by: string | null;
        approved_at: string | null;
      }>
    | null;
}

/**
 * Mapeia uma linha bruta do PostgreSQL/Supabase para a estrutura de domínio do AprovaCNH
 * e aplica a validação estrita do Zod (Anti-Corruption Layer).
 */
export function mapAndValidateDatabaseQuestion(row: DatabaseQuestionRow): ValidatedQuestion {
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
    correctOptionId: row.correct_option_id,
    explanation: row.explanation,
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
    review: reviewRaw
      ? {
          generatorModel: reviewRaw.generator_model ?? null,
          verifierModel: reviewRaw.verifier_model ?? null,
          verificationNotes: reviewRaw.verification_notes ?? null,
          approvedBy: reviewRaw.approved_by ?? null,
          approvedAt: reviewRaw.approved_at ?? null,
        }
      : null,
  };

  return questionSchema.parse(candidate);
}

/**
 * Busca questões aprovadas de um determinado tema no Supabase.
 * Se o banco ainda não contiver as tabelas, estiver em versão anterior ao acervo local
 * ou se a consulta falhar, recorre ao acervo local aprovado (DETRAN-MG / SENATRAN v2).
 */
export async function getApprovedQuestionsByTopic(
  topic = 'Sinalização de Trânsito',
  options: { fallbackToLocal?: boolean } = { fallbackToLocal: true }
): Promise<ValidatedQuestion[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
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
        ),
        question_reviews (
          generator_model,
          verifier_model,
          verification_notes,
          approved_by,
          approved_at
        )
      `)
      .eq('status', 'aprovada')
      .ilike('topic', `%${topic}%`)
      .order('id', { ascending: true });

    if (error) {
      console.warn(`[Supabase Repository] Aviso ao consultar 'questions': ${error.message}`);
      if (options.fallbackToLocal) {
        return getFallbackApprovedQuestions();
      }
      throw error;
    }

    if (!data || data.length === 0) {
      if (options.fallbackToLocal) {
        return getFallbackApprovedQuestions();
      }
      return [];
    }

    // Passa todos os registros pela Anti-Corruption Layer do Zod
    const validatedQuestions = (data as unknown as DatabaseQuestionRow[])
      .map(mapAndValidateDatabaseQuestion)
      .filter(isQuestionEligibleForStudents);

    // Se o banco ainda estiver na versão 1 (pré-atualização DETRAN-MG v2) e o fallback estiver ativo,
    // entrega imediatamente a versão 2 atualizada sem quebrar o estudo do aluno.
    if (options.fallbackToLocal && validatedQuestions.some((q) => q.version < 2)) {
      return getFallbackApprovedQuestions();
    }

    if (options.fallbackToLocal) {
      const fallback = getFallbackApprovedQuestions();
      if (validatedQuestions.length < fallback.length) {
        const byId = new Map(validatedQuestions.map((q) => [q.id, q]));
        for (const q of fallback) {
          if (!byId.has(q.id)) {
            byId.set(q.id, q);
          }
        }
        return Array.from(byId.values()).filter(isQuestionEligibleForStudents);
      }
    }

    return validatedQuestions;
  } catch (err) {
    if (options.fallbackToLocal) {
      return getFallbackApprovedQuestions();
    }
    throw err;
  }
}

/**
 * Carrega e valida o acervo local homologado como fallback seguro.
 */
export function getFallbackApprovedQuestions(): ValidatedQuestion[] {
  return (fallbackQuestionsRaw as unknown[]).map((q) => questionSchema.parse(q)).filter(isQuestionEligibleForStudents);
}
