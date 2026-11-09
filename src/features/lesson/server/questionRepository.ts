import { createClient } from '@/lib/supabase/server';
import { questionSchema, type ValidatedQuestion } from '../schemas/questionSchema';
import fallbackQuestionsRaw from '@/data/questions-sinalizacao.json';
import bnqQuestionsRaw from '@/data/bnq-v1.0-clean.json';

interface DatabaseQuestionRow {
  id: string;
  version: number;
  source_question_id: string | null;
  difficulty: string | null;
  sign_code: string | null;
  sign_asset_codes: string[] | null;
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
        approval_method: string | null;
        approval_batch_id: string | null;
      }
    | Array<{
        generator_model: string | null;
        verifier_model: string | null;
        verification_notes: string | null;
        approved_by: string | null;
        approved_at: string | null;
        approval_method: string | null;
        approval_batch_id: string | null;
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
    sourceQuestionId: row.source_question_id ?? undefined,
    difficulty: row.difficulty ?? undefined,
    signCode: row.sign_code ?? null,
    signAssetCodes: row.sign_asset_codes ?? [],
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
          approvalMethod: (reviewRaw.approval_method as 'individual_human_review' | 'authorized_official_batch' | null) ?? null,
          approvalBatchId: reviewRaw.approval_batch_id ?? null,
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
  topic: string | null = 'Sinalização de Trânsito',
  options: { fallbackToLocal?: boolean } = { fallbackToLocal: true }
): Promise<ValidatedQuestion[]> {
  const PAGE_SIZE = 500;

  try {
    const supabase = await createClient();
    const allRows: DatabaseQuestionRow[] = [];

    for (let from = 0; ; from += PAGE_SIZE) {
      let query = supabase
        .from('questions')
        .select(`
          id,
          source_question_id,
          difficulty,
          sign_code,
          sign_asset_codes,
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
            approved_at,
            approval_method,
            approval_batch_id
          )
        `)
        .eq('status', 'aprovada');

      if (topic) query = query.eq('topic', topic);

      const { data, error } = await query
        .order('id', { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.warn(`[Supabase Repository] Aviso ao consultar 'questions': ${error.message}`);
        if (options.fallbackToLocal) return getFallbackApprovedQuestions(topic);
        throw error;
      }

      const page = (data ?? []) as unknown as DatabaseQuestionRow[];
      allRows.push(...page);
      if (page.length < PAGE_SIZE) break;
    }

    if (allRows.length === 0) return [];

    const validatedQuestions = allRows.map(mapAndValidateDatabaseQuestion);
    return validatedQuestions.filter((question) => question.status === 'aprovada' && !question.isExample);
  } catch (err) {
    if (options.fallbackToLocal) return getFallbackApprovedQuestions(topic);
    throw err;
  }
}

/**
 * Carrega e valida o acervo local homologado como fallback seguro.
 */
export function getFallbackApprovedQuestions(topic: string | null = null): ValidatedQuestion[] {
  const localRows = [
    ...(fallbackQuestionsRaw as unknown[]),
    ...(bnqQuestionsRaw as unknown[]),
  ];
  const approved = localRows.filter((raw) => {
    if (!raw || typeof raw !== 'object') return false;
    const q = raw as { status?: unknown; isExample?: unknown; topic?: unknown };
    return q.status === 'aprovada' && q.isExample === false && (!topic || q.topic === topic);
  });
  const byId = new Map<string, ValidatedQuestion>();
  for (const raw of approved) {
    const parsed = questionSchema.parse(raw);
    if (!byId.has(parsed.id)) byId.set(parsed.id, parsed);
  }
  return [...byId.values()];
}
