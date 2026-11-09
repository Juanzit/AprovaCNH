import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import rawBnq from '@/data/bnq-v1.0-clean.json';
import { questionBankSchema } from '@/features/lesson/schemas/questionSchema';

describe('Assets visuais do BNQ v1.0', () => {
  it('todo signAssetCode aponta para um SVG local importado', () => {
    const questions = questionBankSchema.parse(rawBnq);
    const visualQuestions = questions.filter((question) => (question.signAssetCodes ?? []).length > 0);
    expect(visualQuestions).toHaveLength(181);

    const codes = [...new Set(visualQuestions.flatMap((question) => question.signAssetCodes ?? []))];
    expect(codes).toHaveLength(65);
    for (const code of codes) {
      expect(existsSync(path.join(process.cwd(), 'public', 'signs', `${code}.svg`))).toBe(true);
    }
  });
});
