import { describe, it, expect } from 'vitest';
import { questionSchema, lessonSeedSchema } from '@/features/lesson/schemas/questionSchema';
import rawSeed from '@/data/seed-sinalizacao.json';

describe('questionSchema & lessonSeedSchema', () => {
  it('deve validar com sucesso o seed demonstrativo real de sinalização com 5 questões', () => {
    const result = lessonSeedSchema.safeParse(rawSeed);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(5);
      result.data.forEach((q) => {
        expect(q.isExample).toBe(true);
        expect(q.status).toBe('rascunho');
        expect(q.source.kind).toBe('demo');
        expect(q.source.verificationStatus).toBe('pending');
        expect(q.options).toHaveLength(4);
        expect(q.ufs).not.toContain('BR');
      });
    }
  });

  it('deve rejeitar questão quando o gabarito não corresponder a nenhuma alternativa', () => {
    const invalidQuestion = {
      ...rawSeed[0],
      correctOptionId: 'd', // mudando gabarito para 'd' mas removendo alternativa 'd'
      options: [
        { id: 'a', text: 'Opção A' },
        { id: 'b', text: 'Opção B' },
        { id: 'c', text: 'Opção C' },
        { id: 'a', text: 'Opção repetida' },
      ],
    };

    const result = questionSchema.safeParse(invalidQuestion);
    expect(result.success).toBe(false);
  });

  it('deve rejeitar questão quando houver IDs de alternativas duplicados', () => {
    const duplicateOptionsQuestion = {
      ...rawSeed[0],
      options: [
        { id: 'a', text: 'Opção A1' },
        { id: 'a', text: 'Opção A2' },
        { id: 'b', text: 'Opção B' },
        { id: 'c', text: 'Opção C' },
      ],
    };

    const result = questionSchema.safeParse(duplicateOptionsQuestion);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Os IDs das quatro alternativas devem ser únicos (a, b, c, d).');
    }
  });

  it('deve rejeitar questão demonstrativa (isExample: true) que não tenha status rascunho', () => {
    const invalidStatusQuestion = {
      ...rawSeed[0],
      status: 'aprovada',
    };

    const result = questionSchema.safeParse(invalidStatusQuestion);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Questões demonstrativas (isExample: true) devem obrigatoriamente possuir status "rascunho".');
    }
  });

  it('deve rejeitar questão contendo "BR" no array de UFs conforme D014', () => {
    const invalidUfQuestion = {
      ...rawSeed[0],
      ufs: ['BR'],
    };

    const result = questionSchema.safeParse(invalidUfQuestion);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Não utilize "BR" como código de UF. Use ufs: [] para indicar ausência de restrição estadual.');
    }
  });
});
