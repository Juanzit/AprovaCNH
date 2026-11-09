import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const SEED_PATH = fileURLToPath(new URL('../src/data/bnq-v1.0-clean.json', import.meta.url));
const EXPECTED_ROWS = 1489;
const BATCH_SIZE = 100;
const BATCH_ID = 'SENATRAN-BNQ-v1.0-2026-11-09';

function requiredEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) return value.trim();
  }
  throw new Error(`Variável obrigatória ausente: ${names.join(' ou ')}`);
}

function chunks(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function assertSeed(rows) {
  if (!Array.isArray(rows) || rows.length !== EXPECTED_ROWS) {
    throw new Error(`Seed inválido: esperado ${EXPECTED_ROWS} registros; recebido ${rows?.length ?? 'não-array'}.`);
  }

  const ids = new Set();
  const sourceIds = new Set();

  for (const [index, row] of rows.entries()) {
    if (!row?.id || !row.sourceQuestionId) {
      throw new Error(`Registro ${index} sem ID interno ou ID de origem.`);
    }
    if (ids.has(row.id) || sourceIds.has(row.sourceQuestionId)) {
      throw new Error(`ID duplicado no seed: ${row.id} / ${row.sourceQuestionId}.`);
    }
    ids.add(row.id);
    sourceIds.add(row.sourceQuestionId);

    if (row.status !== 'aprovada' || row.isExample !== false) {
      throw new Error(`Registro ${row.id} não está marcado como aprovado/não demonstrativo.`);
    }
    if (
      row.review?.approvalMethod !== 'authorized_official_batch' ||
      row.review?.approvalBatchId !== BATCH_ID ||
      !row.review?.approvedBy ||
      !row.review?.approvedAt
    ) {
      throw new Error(`Registro ${row.id} sem trilha de autorização do lote.`);
    }
    if (!Array.isArray(row.options) || row.options.length !== 4) {
      throw new Error(`Registro ${row.id} não possui exatamente quatro alternativas.`);
    }
  }
}

async function upsertInBatches(client, table, rows, conflictKey, label) {
  let acknowledged = 0;
  const groups = chunks(rows, BATCH_SIZE);

  for (let index = 0; index < groups.length; index += 1) {
    const { data, error } = await client
      .from(table)
      .upsert(groups[index], {
        onConflict: conflictKey,
        ignoreDuplicates: true,
      })
      .select(conflictKey);

    if (error) {
      throw new Error(`Falha em ${label}, lote ${index + 1}/${groups.length}: ${error.message}`);
    }
    acknowledged += data?.length ?? 0;
    process.stdout.write(`${label}: lote ${index + 1}/${groups.length} concluído\n`);
  }

  return acknowledged;
}

async function main() {
  const supabaseUrl = requiredEnv('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!/^https:\/\//i.test(supabaseUrl)) {
    throw new Error('SUPABASE_URL deve ser uma URL HTTPS.');
  }

  const raw = await readFile(SEED_PATH, 'utf8');
  const questions = JSON.parse(raw);
  assertSeed(questions);

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const questionRows = questions.map((question) => ({
    id: question.id,
    source_question_id: question.sourceQuestionId,
    difficulty: question.difficulty,
    sign_code: question.signCode,
    sign_asset_codes: question.signAssetCodes ?? [],
    version: question.version,
    statement: question.statement,
    options: question.options,
    correct_option_id: question.correctOptionId,
    explanation: question.explanation,
    topic: question.topic,
    subtopic: question.subtopic,
    ufs: question.ufs,
    categories: question.categories,
    status: question.status,
    is_example: question.isExample,
  }));

  const sourceRows = questions.map((question) => ({
    question_id: question.id,
    kind: question.source.kind,
    document: question.source.document,
    provision: question.source.provision,
    url: question.source.url,
    checked_at: question.source.checkedAt,
    effective_from: question.source.effectiveFrom,
    effective_until: question.source.effectiveUntil,
    source_version: question.source.sourceVersion,
    license_note: question.source.licenseNote,
    verification_status: question.source.verificationStatus,
  }));

  const reviewRows = questions.map((question) => ({
    question_id: question.id,
    generator_model: question.review.generatorModel,
    verifier_model: question.review.verifierModel,
    verification_notes: question.review.verificationNotes,
    approved_by: question.review.approvedBy,
    approved_at: question.review.approvedAt,
    approval_method: question.review.approvalMethod,
    approval_batch_id: question.review.approvalBatchId,
  }));

  console.log(`BNQ v1.0 validado: ${questions.length} questões; lote ${BATCH_ID}.`);
  console.log('Modo idempotente: conflitos são ignorados; decisões existentes não são sobrescritas.');

  const questionCount = await upsertInBatches(
    client, 'questions', questionRows, 'id', 'questions'
  );
  const sourceCount = await upsertInBatches(
    client, 'question_sources', sourceRows, 'question_id', 'question_sources'
  );
  const reviewCount = await upsertInBatches(
    client, 'question_reviews', reviewRows, 'question_id', 'question_reviews'
  );

  console.log(JSON.stringify({
    sourceRows: questions.length,
    insertedOrAcknowledged: {
      questions: questionCount,
      question_sources: sourceCount,
      question_reviews: reviewCount,
    },
    batchId: BATCH_ID,
    conflictPolicy: 'ignore-duplicates',
  }, null, 2));
}

main().catch((error) => {
  console.error('[BNQ ingestion failed]', error);
  process.exitCode = 1;
});
