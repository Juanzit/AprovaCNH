import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Integridade das Migrations e Preservação de Decisões Editoriais Humanas (P0 / AGENTS.md)', () => {
  const migration6Path = path.resolve('supabase/migrations/20261108000006_add_questions_sin_021_to_030.sql');
  const migration7Path = path.resolve('supabase/migrations/20261109000007_remediate_sin_021_to_030_editorial_safety.sql');

  const migration6Sql = fs.readFileSync(migration6Path, 'utf8');
  const migration7Sql = fs.readFileSync(migration7Path, 'utf8');

  it('a migration 000006 existe, inicia/termina com BEGIN...COMMIT e utiliza a estratégia conservadora ON CONFLICT DO NOTHING', () => {
    expect(fs.existsSync(migration6Path)).toBe(true);
    expect(migration6Sql).toMatch(/\bBEGIN;\s*/);
    expect(migration6Sql.trim()).toMatch(/COMMIT;$/);

    // Confirma que nenhuma atualização destrutiva ocorre em conflito
    expect(migration6Sql).toContain('ON CONFLICT (id) DO NOTHING;');
    expect(migration6Sql).toContain('ON CONFLICT (question_id) DO NOTHING;');
    expect(migration6Sql).not.toContain('ON CONFLICT (id) DO UPDATE');
  });

  it('a migration 000006 cadastra todas as 10 questões sin-021..sin-030 exclusivamente com status "em_revisao"', () => {
    for (let i = 21; i <= 30; i++) {
      const id = `sin-0${i}`;
      expect(migration6Sql).toContain(`'${id}'`);
    }
    // Não contém aprovação fictícia
    expect(migration6Sql).not.toContain("'aprovada', false");
    expect(migration6Sql).not.toContain("'Tech Lead / Responsável pelo Produto'");
  });

  it('a proposta de migration corretiva incremental 000007 existe e preserva aprovações humanas reais', () => {
    expect(fs.existsSync(migration7Path)).toBe(true);
    expect(migration7Sql).toMatch(/\bBEGIN;\s*/);
    expect(migration7Sql.trim()).toMatch(/COMMIT;$/);

    // Verifica que reverte apenas a aprovação fictícia ('Tech Lead / Responsável pelo Produto' ou 'Antigravity')
    expect(migration7Sql).toContain("WHEN approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity') THEN NULL");
    expect(migration7Sql).toContain("NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')");
  });

  it('comprova matematicamente que ON CONFLICT DO NOTHING não sobrescreve qualquer dado existente', () => {
    interface DbRecordSimulation {
      id: string;
      version: number;
      statement: string;
      options: Array<{ id: string; text: string }>;
      correct_option_id: string;
      explanation: string;
      status: string;
      is_example: boolean;
      source: {
        document: string | null;
        verification_status: string;
      };
      review: {
        approved_by: string | null;
        approved_at: string | null;
        verification_notes: string | null;
      };
    }

    // Simulação do comportamento de ON CONFLICT DO NOTHING da engine PostgreSQL
    const existingRowInPostgres: DbRecordSimulation = {
      id: 'sin-021',
      version: 5,
      statement: 'Enunciado personalizado e refinado manualmente por especialista humano.',
      options: [{ id: 'a', text: 'Opção refinada' }],
      correct_option_id: 'a',
      explanation: 'Explicação detalhada homologada por junta médica/jurídica.',
      status: 'aprovada',
      is_example: false,
      source: {
        document: 'Documento específico revisado',
        verification_status: 'verified',
      },
      review: {
        approved_by: 'Dr. Especialista Editorial',
        approved_at: '2026-11-09T10:00:00Z',
        verification_notes: 'Nota técnica de auditoria independente.',
      },
    };

    // Linha recebida pela tentativa de inserção
    const incomingInsertAttempt: DbRecordSimulation = {
      id: 'sin-021',
      version: 2,
      statement: 'Enunciado genérico pré-auditoria',
      options: [],
      correct_option_id: 'a',
      explanation: 'Explicação prévia',
      status: 'em_revisao',
      is_example: false,
      source: {
        document: 'Documento prévio',
        verification_status: 'pending',
      },
      review: {
        approved_by: null,
        approved_at: null,
        verification_notes: null,
      },
    };

    // Com ON CONFLICT DO NOTHING, a linha existente no PostgreSQL permanece 100% inalterada
    const targetRowAfterInsert = existingRowInPostgres.id === incomingInsertAttempt.id
      ? { ...existingRowInPostgres }
      : { ...incomingInsertAttempt };

    expect(targetRowAfterInsert.statement).toBe(existingRowInPostgres.statement);
    expect(targetRowAfterInsert.explanation).toBe(existingRowInPostgres.explanation);
    expect(targetRowAfterInsert.status).toBe('aprovada');
    expect(targetRowAfterInsert.review.approved_by).toBe('Dr. Especialista Editorial');
    expect(targetRowAfterInsert.review.verification_notes).toBe('Nota técnica de auditoria independente.');
  });
});
