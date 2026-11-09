import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Integridade das Migrations e Preservação de Decisões Editoriais Humanas (P0 / AGENTS.md)', () => {
  const migration6Path = path.resolve('supabase/migrations/20261108000006_add_questions_sin_021_to_030.sql');
  const migration7Path = path.resolve('supabase/migrations/20261109000007_remediate_sin_021_to_030_editorial_safety.sql');

  const migration6Sql = fs.readFileSync(migration6Path, 'utf8');
  const migration7Sql = fs.readFileSync(migration7Path, 'utf8');

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
});
