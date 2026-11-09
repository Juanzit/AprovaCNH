import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Integridade das Migrations, Políticas RLS e Preservação de Curadoria Humana (P0 / AGENTS.md)', () => {
  const migration6Path = path.resolve('supabase/migrations/20261108000006_add_questions_sin_021_to_030.sql');
  const migration7Path = path.resolve('supabase/migrations/20261109000007_remediate_sin_021_to_030_editorial_safety.sql');
  const migration8Path = path.resolve('supabase/migrations/20261109000008_harden_rls_student_eligibility.sql');

  const migration6Sql = fs.readFileSync(migration6Path, 'utf8');
  const migration7Sql = fs.readFileSync(migration7Path, 'utf8');
  const migration8Sql = fs.readFileSync(migration8Path, 'utf8');

  it('a migration 000006 histórica está preservada como na main', () => {
    expect(fs.existsSync(migration6Path)).toBe(true);
    expect(migration6Sql).toMatch(/\bBEGIN;\s*/);
    expect(migration6Sql.trim()).toMatch(/COMMIT;$/);
    for (let i = 21; i <= 30; i++) {
      const id = `sin-0${i}`;
      expect(migration6Sql).toContain(`'${id}'`);
    }
  });

  it('a migration 000007 realiza saneamento cirúrgico sem tocar em conteúdo, fontes ou notas humanas', () => {
    expect(fs.existsSync(migration7Path)).toBe(true);
    expect(migration7Sql).toMatch(/\bBEGIN;\s*/);
    expect(migration7Sql.trim()).toMatch(/COMMIT;$/);

    // 1. NÃO sobrescreve conteúdo pedagógico (enunciado, opções, gabarito, explicação)
    expect(migration7Sql).not.toContain('statement =');
    expect(migration7Sql).not.toContain('options =');
    expect(migration7Sql).not.toContain('correct_option_id =');
    expect(migration7Sql).not.toContain('explanation =');

    // 2. NÃO toca em question_sources nem altera metadados de fontes
    expect(migration7Sql).not.toContain('UPDATE public.question_sources');

    // 3. NÃO sobrescreve notas de revisão
    expect(migration7Sql).not.toContain('verification_notes =');

    // 4. Remove EXCLUSIVAMENTE aprovadores fictícios explícitos
    expect(migration7Sql).toContain("approved_by IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')");
    expect(migration7Sql).toContain('approved_by = NULL');
    expect(migration7Sql).toContain('approved_at = NULL');

    // 5. Preserva qualquer questão que possua aprovação humana legítima
    expect(migration7Sql).toContain("NOT IN ('Tech Lead / Responsável pelo Produto', 'Antigravity')");
  });

  it('a migration 000008 alinha as políticas de RLS à regra estrita status = aprovada AND is_example = false', () => {
    expect(fs.existsSync(migration8Path)).toBe(true);
    expect(migration8Sql).toMatch(/\bBEGIN;\s*/);
    expect(migration8Sql.trim()).toMatch(/COMMIT;$/);

    // 1. Atualiza as 3 políticas discentes
    expect(migration8Sql).toContain('DROP POLICY IF EXISTS "questions_select_student" ON public.questions;');
    expect(migration8Sql).toContain('CREATE POLICY "questions_select_student"');
    expect(migration8Sql).toContain('DROP POLICY IF EXISTS "sources_select_student" ON public.question_sources;');
    expect(migration8Sql).toContain('CREATE POLICY "sources_select_student"');
    expect(migration8Sql).toContain('DROP POLICY IF EXISTS "reviews_select_student" ON public.question_reviews;');
    expect(migration8Sql).toContain('CREATE POLICY "reviews_select_student"');

    // 2. Elimina a regra permissiva de rascunhos e exemplos no corpo executável das políticas
    const executableSql = migration8Sql.replace(/--.*$/gm, '');
    expect(executableSql).not.toContain("status = 'rascunho'");
    expect(executableSql).not.toContain('is_example = true');

    // 3. Exige estritamente aprovada e não-exemplo para students/anon
    expect(executableSql).toContain("status = 'aprovada'");
    expect(executableSql).toContain('is_example = false');
  });
});
