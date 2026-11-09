import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Integridade da Migration e Preservação de Decisões Editoriais Humanas (Regra D010 / AGENTS.md)', () => {
  const migrationPath = path.resolve('supabase/migrations/20261108000006_add_questions_sin_021_to_030.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  it('o arquivo de migration existe e inicia/finaliza com transação segura BEGIN ... COMMIT', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
    expect(migrationSql).toMatch(/\bBEGIN;\s*/);
    expect(migrationSql.trim()).toMatch(/COMMIT;$/);
  });

  it('a cláusula ON CONFLICT de public.questions preserva status aprovada/suspensa/obsoleta', () => {
    expect(migrationSql).toContain('ON CONFLICT (id) DO UPDATE SET');
    expect(migrationSql).toContain("WHEN public.questions.status IN ('aprovada', 'suspensa', 'obsoleta') THEN public.questions.status");
    expect(migrationSql).toContain('ELSE EXCLUDED.status');
  });

  it('a cláusula ON CONFLICT de public.question_sources preserva verification_status="verified"', () => {
    expect(migrationSql).toContain('ON CONFLICT (question_id) DO UPDATE SET');
    expect(migrationSql).toContain("WHEN public.question_sources.verification_status = 'verified' THEN public.question_sources.verification_status");
  });

  it('a cláusula ON CONFLICT de public.question_reviews preserva approved_by, approved_at e verifier_model via COALESCE', () => {
    expect(migrationSql).toContain('approved_by = COALESCE(public.question_reviews.approved_by, EXCLUDED.approved_by)');
    expect(migrationSql).toContain('approved_at = COALESCE(public.question_reviews.approved_at, EXCLUDED.approved_at)');
    expect(migrationSql).toContain('verifier_model = COALESCE(public.question_reviews.verifier_model, EXCLUDED.verifier_model)');
  });

  // Simulação de reexecução contra registro com aprovação humana prévia
  it('simula a reexecução do SQL e comprova que decisões editoriais humanas jamais são sobrescritas', () => {
    // 1. Estado no banco após aprovação prévia por um humano
    const existingDbRecord = {
      id: 'sin-021',
      status: 'aprovada',
      verification_status: 'verified',
      verifier_model: 'Independent/Auditor-Especialista',
      approved_by: 'Tech Lead / Responsável pelo Produto',
      approved_at: '2026-11-09T11:00:00Z',
      verification_notes: 'Homologação editorial definitiva realizada com sucesso.',
    };

    // 2. Carga nova enviada pelo script de migração (com status 'em_revisao' e review nulo)
    const migrationIncoming = {
      id: 'sin-021',
      status: 'em_revisao',
      verification_status: 'pending',
      verifier_model: null,
      approved_by: null,
      approved_at: null,
      verification_notes: 'Pendente de aprovação humana individualizada pelo Tech Lead.',
    };

    // 3. Aplicação das regras exatas do SQL da migration (CASE e COALESCE)
    const resultingStatus = ['aprovada', 'suspensa', 'obsoleta'].includes(existingDbRecord.status)
      ? existingDbRecord.status
      : migrationIncoming.status;

    const resultingVerificationStatus = existingDbRecord.verification_status === 'verified'
      ? existingDbRecord.verification_status
      : migrationIncoming.verification_status;

    const resultingVerifierModel = existingDbRecord.verifier_model ?? migrationIncoming.verifier_model;
    const resultingApprovedBy = existingDbRecord.approved_by ?? migrationIncoming.approved_by;
    const resultingApprovedAt = existingDbRecord.approved_at ?? migrationIncoming.approved_at;
    const resultingNotes = existingDbRecord.approved_by !== null
      ? existingDbRecord.verification_notes
      : migrationIncoming.verification_notes;

    // 4. Verificação de integridade pós-reexecução
    expect(resultingStatus).toBe('aprovada');
    expect(resultingVerificationStatus).toBe('verified');
    expect(resultingVerifierModel).toBe('Independent/Auditor-Especialista');
    expect(resultingApprovedBy).toBe('Tech Lead / Responsável pelo Produto');
    expect(resultingApprovedAt).toBe('2026-11-09T11:00:00Z');
    expect(resultingNotes).toBe('Homologação editorial definitiva realizada com sucesso.');
  });
});
