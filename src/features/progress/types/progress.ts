export type SessionStatus = 'available' | 'in_progress' | 'completed';

export interface StudentProfile {
  id: string;
  email: string;
  fullName: string | null;
  uf: string | null;
  targetCategory: string | null;
  role: 'student' | 'reviewer' | 'admin';
  xpTotal: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export interface LessonSessionProgress {
  sessionId: number;
  topic: string;
  status: SessionStatus;
  score: number;
  maxScore: number;
  xpEarned: number;
  completedAt: string | null;
}

export interface UserSubmittedAnswer {
  questionId: string;
  selectedOptionId: string;
}

export interface SessionSubmissionPayload {
  topic: string;
  sessionId: number;
  answers: UserSubmittedAnswer[];
}

export interface QuestionEvaluationResult {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
}

export interface SessionSubmissionResult {
  success: boolean;
  score: number;
  maxScore: number;
  xpAwarded: number;
  isFirstCompletion: boolean;
  currentStreak: number;
  longestStreak: number;
  results: QuestionEvaluationResult[];
}
