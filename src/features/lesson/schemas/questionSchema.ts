import { z } from 'zod';

export const optionIdSchema = z.enum(['a', 'b', 'c', 'd']);

export const questionOptionSchema = z.object({
  id: optionIdSchema,
  text: z.string().min(1, 'O texto da alternativa não pode ser vazio.'),
});

export const questionSourceSchema = z.object({
  kind: z.enum(['official', 'licensed', 'demo']),
  document: z.string().nullable(),
  provision: z.string().nullable(),
  url: z.string().url().nullable().or(z.null()),
  checkedAt: z.string().nullable(),
  effectiveFrom: z.string().nullable(),
  effectiveUntil: z.string().nullable(),
  sourceVersion: z.string().nullable(),
  licenseNote: z.string().nullable(),
  verificationStatus: z.enum(['verified', 'pending', 'not_applicable']),
});

export const questionReviewSchema = z.object({
  generatorModel: z.string().nullable(),
  verifierModel: z.string().nullable(),
  verificationNotes: z.string().nullable(),
  approvedBy: z.string().nullable(),
  approvedAt: z.string().nullable(),
  approvalMethod: z.enum(['individual_human_review', 'authorized_official_batch']).nullable().optional(),
  approvalBatchId: z.string().nullable().optional(),
});

export const questionSchema = z
  .object({
    id: z.string().min(1),
    sourceQuestionId: z.string().min(1).optional(),
    difficulty: z.enum(['facil', 'intermediario', 'dificil']).optional(),
    signCode: z.string().nullable().optional(),
    signAssetCodes: z.array(z.string().min(1)).optional(),
    version: z.number().int().positive(),
    statement: z.string().min(5, 'O enunciado deve ser descritivo.'),
    options: z.tuple([
      questionOptionSchema,
      questionOptionSchema,
      questionOptionSchema,
      questionOptionSchema,
    ]),
    correctOptionId: optionIdSchema,
    explanation: z.string().min(1, 'A explicação é obrigatória.'),
    topic: z.string().min(1),
    subtopic: z.string().optional(),
    ufs: z.array(z.string()),
    categories: z.array(z.string()),
    source: questionSourceSchema,
    status: z.enum(['rascunho', 'em_revisao', 'aprovada', 'suspensa', 'obsoleta']),
    isExample: z.boolean(),
    review: questionReviewSchema.nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Unicidade de IDs nas alternativas
    const optionIds = data.options.map((o) => o.id);
    const uniqueIds = new Set(optionIds);
    if (uniqueIds.size !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Os IDs das quatro alternativas devem ser únicos (a, b, c, d).',
        path: ['options'],
      });
    }

    // 2. Garantir que o gabarito corresponda a uma alternativa existente
    const correctOptionExists = data.options.some((o) => o.id === data.correctOptionId);
    if (!correctOptionExists) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `O gabarito '${data.correctOptionId}' não corresponde a nenhuma das alternativas da questão.`,
        path: ['correctOptionId'],
      });
    }

    // 3. Regra mandatória para questões demonstrativas (D009)
    if (data.isExample) {
      if (data.status !== 'rascunho') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões demonstrativas (isExample: true) devem obrigatoriamente possuir status "rascunho".',
          path: ['status'],
        });
      }
      if (data.source.kind !== 'demo') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões demonstrativas devem possuir source.kind como "demo".',
          path: ['source', 'kind'],
        });
      }
      if (data.source.verificationStatus !== 'pending') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões demonstrativas não validadas devem possuir verificationStatus "pending".',
          path: ['source', 'verificationStatus'],
        });
      }
    }

    // 4. Proibição de "BR" como código de UF (D014)
    if (data.ufs.includes('BR')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Não utilize "BR" como código de UF. Use ufs: [] para indicar ausência de restrição estadual.',
        path: ['ufs'],
      });
    }

    // 5. Regras para status 'em_revisao' (com isExample: false)
    if (data.status === 'em_revisao' && !data.isExample) {
      if (data.source.kind !== 'official' && data.source.kind !== 'licensed') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões em revisão devem possuir source.kind como "official" ou "licensed".',
          path: ['source', 'kind'],
        });
      }
      if (!data.source.document || data.source.document.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões em revisão exigem source.document preenchido.',
          path: ['source', 'document'],
        });
      }
      if (!data.source.provision || data.source.provision.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões em revisão exigem source.provision preenchido.',
          path: ['source', 'provision'],
        });
      }
      if (!data.source.url || data.source.url.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões em revisão exigem source.url preenchido.',
          path: ['source', 'url'],
        });
      }
      if (!data.source.checkedAt || data.source.checkedAt.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões em revisão exigem source.checkedAt preenchido.',
          path: ['source', 'checkedAt'],
        });
      }
    }

    // 6. Regras para status 'aprovada' (D003 + D008 + D011)
    if (data.status === 'aprovada') {
      if (data.isExample) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões aprovadas não podem ser marcadas como demonstrativas (isExample: false obrigatório).',
          path: ['isExample'],
        });
      }
      if (data.source.kind === 'demo') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões aprovadas não podem ter source.kind "demo".',
          path: ['source', 'kind'],
        });
      }
      if (data.source.verificationStatus !== 'verified') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões aprovadas devem ter source.verificationStatus como "verified".',
          path: ['source', 'verificationStatus'],
        });
      }

      const requiredSourceFields: Array<keyof typeof data.source> = [
        'document',
        'provision',
        'url',
        'checkedAt',
        'effectiveFrom',
        'sourceVersion',
        'licenseNote',
      ];

      for (const field of requiredSourceFields) {
        const val = data.source[field];
        if (!val || (typeof val === 'string' && val.trim() === '')) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Questões aprovadas exigem source.${field} preenchido.`,
            path: ['source', field],
          });
        }
      }

      if (!data.review) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões aprovadas exigem o objeto review de auditoria.',
          path: ['review'],
        });
      } else {
        if (data.review.approvalMethod === 'authorized_official_batch') {
          if (!data.review.approvalBatchId || data.review.approvalBatchId.trim() === '') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Aprovação oficial em lote exige review.approvalBatchId rastreável.',
              path: ['review', 'approvalBatchId'],
            });
          }
          if (data.review.generatorModel || data.review.verifierModel) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Aprovação autorizada em lote não pode declarar modelos como revisores individuais.',
              path: ['review'],
            });
          }
        } else {
          if (!data.review.generatorModel || data.review.generatorModel.trim() === '') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Questões aprovadas por revisão individual exigem review.generatorModel preenchido.',
              path: ['review', 'generatorModel'],
            });
          }
          if (!data.review.verifierModel || data.review.verifierModel.trim() === '') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Questões aprovadas por revisão individual exigem review.verifierModel preenchido.',
              path: ['review', 'verifierModel'],
            });
          }
          if (
            data.review.generatorModel &&
            data.review.verifierModel &&
            data.review.generatorModel === data.review.verifierModel
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'O modelo verificador (verifierModel) deve ser diferente do modelo gerador (generatorModel).',
              path: ['review', 'verifierModel'],
            });
          }
        }
        if (!data.review.approvedBy || data.review.approvedBy.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Questões aprovadas exigem review.approvedBy preenchido.',
            path: ['review', 'approvedBy'],
          });
        }
        if (!data.review.approvedAt || data.review.approvedAt.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Questões aprovadas exigem review.approvedAt preenchido.',
            path: ['review', 'approvedAt'],
          });
        }
      }
    }
  });

export const lessonSeedSchema = z
  .array(questionSchema)
  .length(5, 'O seed da lição T001 deve conter exatamente 5 questões.');

export const questionBankSchema = z
  .array(questionSchema)
  .min(20, 'O banco de questões deve conter no mínimo 20 questões.');

export type ValidatedQuestion = z.infer<typeof questionSchema>;
export type ValidatedQuestionReview = z.infer<typeof questionReviewSchema>;
export type ValidatedLessonSeed = z.infer<typeof lessonSeedSchema>;
export type ValidatedQuestionBank = z.infer<typeof questionBankSchema>;
