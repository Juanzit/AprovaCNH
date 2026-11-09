import { z } from 'zod';
import { optionIdSchema } from '@/features/lesson/schemas/questionSchema';
import type { OptionId, Question, StudentQuestion } from '@/features/lesson/types/question';

export const examConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  uf: z
    .string()
    .length(2)
    .refine((val) => val.toUpperCase() !== 'BR', {
      message: 'A sigla "BR" não é permitida (D014)',
    })
    .nullable(),
  totalQuestions: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  passingScore: z.number().int().positive(),
  normativeAct: z.string().min(1),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  effectiveUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  version: z.number().int().min(1),
  isActive: z.boolean(),
});

export type ExamConfig = z.infer<typeof examConfigSchema>;

export const DEFAULT_EXAM_CONFIG: ExamConfig = {
  id: 'detran-mg-default',
  name: 'Simulado Temático — Sinalização de Trânsito',
  uf: 'MG',
  totalQuestions: 30,
  durationMinutes: 60,
  passingScore: 20,
  normativeAct: 'Parâmetros baseados na Resolução CONTRAN nº 1.020/2025',
  effectiveFrom: '2025-01-01',
  effectiveUntil: null,
  version: 1,
  isActive: true,
};

export const simuladoStatusSchema = z.enum([
  'in_progress',
  'completed',
  'abandoned',
  'timed_out',
]);

export type SimuladoStatus = z.infer<typeof simuladoStatusSchema>;

export interface SimuladoQuestionItem {
  questionOrder: number; // 1 a 30
  question: StudentQuestion;
}

export interface SimuladoAnswerState {
  questionOrder: number;
  questionId: string;
  selectedOptionId: OptionId | null;
  isMarkedForReview: boolean;
}

export const simuladoAnswerInputSchema = z.object({
  questionOrder: z.number().int().min(1).max(30),
  questionId: z.string().min(1),
  selectedOptionId: optionIdSchema.nullable(),
  isMarkedForReview: z.boolean().default(false),
});

export const simuladoSubmissionSchema = z.object({
  simuladoId: z.string().min(1),
  configId: z.string().min(1).default('detran-mg-default'),
  startedAt: z.string().min(1),
  durationSeconds: z.number().int().min(0),
  durationMinutes: z.number().int().positive().optional(),
  timedOut: z.boolean().optional().default(false),
  items: z.array(simuladoAnswerInputSchema).min(1).max(30),
});

export type SimuladoSubmissionPayload = z.infer<typeof simuladoSubmissionSchema>;

export interface SimuladoEvaluatedItem {
  questionOrder: number;
  question: StudentQuestion;
  selectedOptionId: OptionId | null;
  isMarkedForReview: boolean;
  isCorrect: boolean;
  correctOptionId: OptionId;
  explanation: string;
}

export interface SimuladoResult {
  simuladoId: string;
  config: ExamConfig;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  score: number;
  passingScore: number;
  accuracyPercent: number;
  isApproved: boolean;
  status: SimuladoStatus;
  xpEarned: number;
  evaluatedItems: SimuladoEvaluatedItem[];
}

export interface SimuladoHistorySummary {
  id: string;
  configId: string;
  startedAt: string;
  finishedAt: string | null;
  durationSeconds: number;
  totalQuestions: number;
  score: number;
  passingScore: number;
  accuracyPercent: number;
  isApproved: boolean;
  status: SimuladoStatus;
  xpEarned: number;
}
