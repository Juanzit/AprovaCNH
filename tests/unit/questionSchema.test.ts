import { describe, it, expect } from 'vitest';
import {
  questionSchema,
  lessonSeedSchema,
  questionBankSchema,
} from '@/features/lesson/schemas/questionSchema';
import rawSeed from '@/data/seed-sinalizacao.json';
import rawBank from '@/data/questions-sinalizacao.json';

describe('questionSchema & lessonSeedSchema (T001)', () => {
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
      correctOptionId: 'd',
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
      expect(messages).toContain(
        'Questões demonstrativas (isExample: true) devem obrigatoriamente possuir status "rascunho".'
      );
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
      expect(messages).toContain(
        'Não utilize "BR" como código de UF. Use ufs: [] para indicar ausência de restrição estadual.'
      );
    }
  });
});

describe('questionSchema & questionBankSchema (T002 - Piloto Editorial Aprovado)', () => {
  it('deve validar com 100% de sucesso as 20 questões em status "aprovada" de questions-sinalizacao.json', () => {
    const result = questionBankSchema.safeParse(rawBank);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThanOrEqual(20);
      result.data.forEach((q) => {
        expect(q.isExample).toBe(false);
        expect(q.status).toBe('aprovada');
        expect(q.source.kind).toBe('official');
        expect(q.source.verificationStatus).toBe('verified');
        expect(q.source.document).toBeTruthy();
        expect(q.source.provision).toBeTruthy();
        expect(q.source.url).toBeTruthy();
        expect(q.source.checkedAt).toBeTruthy();
        expect(q.source.effectiveFrom).toBeTruthy();
        expect(q.source.sourceVersion).toBeTruthy();
        expect(q.source.licenseNote).toBeTruthy();
        expect(q.review?.generatorModel).toBeTruthy();
        expect(q.review?.verifierModel).toBeTruthy();
        expect(q.review?.verifierModel).not.toBe(q.review?.generatorModel);
        expect(q.review?.approvedBy).toBe('Tech Lead / Responsável pelo Produto');
        expect(q.review?.approvedAt).toBeTruthy();
        expect(q.options).toHaveLength(4);
        expect(q.ufs).toContain('MG');
      });
    }
  });

  it('deve rejeitar questão em status "em_revisao" (isExample: false) se source.kind for "demo"', () => {
    const invalidSourceKind = {
      ...rawBank[0],
      status: 'em_revisao',
      source: {
        ...rawBank[0].source,
        kind: 'demo',
      },
    };
    const result = questionSchema.safeParse(invalidSourceKind);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain(
        'Questões em revisão devem possuir source.kind como "official" ou "licensed".'
      );
    }
  });

  it('deve rejeitar questão em status "em_revisao" sem dispositivo legal (source.provision nulo)', () => {
    const missingProvision = {
      ...rawBank[0],
      status: 'em_revisao',
      source: {
        ...rawBank[0].source,
        provision: null,
      },
    };
    const result = questionSchema.safeParse(missingProvision);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Questões em revisão exigem source.provision preenchido.');
    }
  });

  it('deve rejeitar questão com status "aprovada" se isExample for true', () => {
    const invalidApproved = {
      ...rawBank[0],
      status: 'aprovada',
      isExample: true,
      source: {
        ...rawBank[0].source,
        verificationStatus: 'verified',
      },
      review: {
        generatorModel: 'model-a',
        verifierModel: 'model-b',
        verificationNotes: 'OK',
        approvedBy: 'Tech Lead',
        approvedAt: '2026-11-06T15:00:00Z',
      },
    };
    const result = questionSchema.safeParse(invalidApproved);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain(
        'Questões aprovadas não podem ser marcadas como demonstrativas (isExample: false obrigatório).'
      );
    }
  });

  it('deve rejeitar questão com status "aprovada" se source.kind for "demo"', () => {
    const invalidKindApproved = {
      ...rawBank[0],
      status: 'aprovada',
      isExample: false,
      source: {
        ...rawBank[0].source,
        kind: 'demo',
        verificationStatus: 'verified',
      },
      review: {
        generatorModel: 'model-a',
        verifierModel: 'model-b',
        verificationNotes: 'OK',
        approvedBy: 'Tech Lead',
        approvedAt: '2026-11-06T15:00:00Z',
      },
    };
    const result = questionSchema.safeParse(invalidKindApproved);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Questões aprovadas não podem ter source.kind "demo".');
    }
  });

  it('deve rejeitar questão com status "aprovada" sem approvedBy no review', () => {
    const unapproved = {
      ...rawBank[0],
      status: 'aprovada',
      isExample: false,
      source: {
        ...rawBank[0].source,
        verificationStatus: 'verified',
      },
      review: {
        generatorModel: 'model-a',
        verifierModel: 'model-b',
        verificationNotes: 'OK',
        approvedBy: null,
        approvedAt: null,
      },
    };
    const result = questionSchema.safeParse(unapproved);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Questões aprovadas exigem review.approvedBy preenchido.');
    }
  });

  it('deve rejeitar questão com status "aprovada" quando generatorModel === verifierModel (dupla verificação independente)', () => {
    const sameModel = {
      ...rawBank[0],
      status: 'aprovada',
      isExample: false,
      source: {
        ...rawBank[0].source,
        verificationStatus: 'verified',
      },
      review: {
        generatorModel: 'gemini-3.8-flash',
        verifierModel: 'gemini-3.8-flash',
        verificationNotes: 'Audit notes',
        approvedBy: 'Tech Lead',
        approvedAt: '2026-11-06T15:00:00Z',
      },
    };
    const result = questionSchema.safeParse(sameModel);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain(
        'O modelo verificador (verifierModel) deve ser diferente do modelo gerador (generatorModel).'
      );
    }
  });

  it('deve aprovar questão válida com dupla verificação independente e aprovação humana', () => {
    const fullyApproved = {
      ...rawBank[0],
      status: 'aprovada',
      isExample: false,
      source: {
        ...rawBank[0].source,
        verificationStatus: 'verified',
      },
      review: {
        generatorModel: 'Antigravity/Gemini-3.8-Flash',
        verifierModel: 'Independent/Claude-3.7-Sonnet',
        verificationNotes: 'Gabarito e fundamentação checados integralmente com o Art. 89 do CTB.',
        approvedBy: 'Tech Lead / Head Editorial',
        approvedAt: '2026-11-06T16:00:00Z',
      },
    };
    const result = questionSchema.safeParse(fullyApproved);
    expect(result.success).toBe(true);
  });
});
