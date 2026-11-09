export type OptionId = 'a' | 'b' | 'c' | 'd';

export type QuestionStatus =
  | 'rascunho'
  | 'em_revisao'
  | 'aprovada'
  | 'suspensa'
  | 'obsoleta';

export type SourceVerificationStatus =
  | 'verified'
  | 'pending'
  | 'not_applicable';

export type SourceKind =
  | 'official'
  | 'licensed'
  | 'demo';

export interface QuestionSource {
  kind: SourceKind;
  document: string | null;
  provision: string | null;
  url: string | null;
  checkedAt: string | null;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
  sourceVersion: string | null;
  licenseNote: string | null;
  verificationStatus: SourceVerificationStatus;
}

export type QuestionApprovalMethod = 'individual_human_review' | 'authorized_official_batch';

export type QuestionDifficulty = 'facil' | 'intermediario' | 'dificil';

export interface QuestionReview {
  generatorModel: string | null;
  verifierModel: string | null;
  verificationNotes: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  approvalMethod?: QuestionApprovalMethod | null;
  approvalBatchId?: string | null;
}

export interface QuestionOption {
  id: OptionId;
  text: string;
}

export interface Question {
  id: string;
  sourceQuestionId?: string;
  difficulty?: QuestionDifficulty;
  signCode?: string | null;
  signAssetCodes?: string[];
  version: number;
  statement: string;
  options: [QuestionOption, QuestionOption, QuestionOption, QuestionOption];
  correctOptionId: OptionId;
  explanation: string;
  topic: string;
  subtopic?: string;
  ufs: string[];
  categories: string[];
  source: QuestionSource;
  status: QuestionStatus;
  isExample: boolean;
  review?: QuestionReview | null;
}
