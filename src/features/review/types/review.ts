import type { Question } from '@/features/lesson/types/question';

export interface UserAnswerRecord {
  id: string;
  question_id: string;
  session_id: number;
  selected_option_id: string;
  is_correct: boolean;
  answered_at: string;
}

export interface QuestionReviewStats {
  questionId: string;
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  errorRate: number;
  lastIsCorrect: boolean;
  lastAnsweredAt: string;
  consecutiveCorrect: number;
  priorityScore: number;
  idealIntervalDays: number;
  daysSinceLastAnswer: number;
  isOverdue: boolean;
  explanationReason: string;
}

export type MasteryStatus = 'critico' | 'em_progresso' | 'dominado' | 'nao_praticado';

export interface SubtopicMastery {
  subtopic: string;
  legalProvision: string;
  sessionId: number;
  totalQuestions: number;
  attemptedQuestions: number;
  masteryScore: number; // 0 a 100
  status: MasteryStatus;
  statusLabel: string;
}

export interface ReviewItem {
  question: Question;
  stats: QuestionReviewStats;
}

export interface ReviewDashboardData {
  subtopics: SubtopicMastery[];
  queue: ReviewItem[];
  totalOverdue: number;
  totalRecentErrors: number;
  totalPracticedQuestions: number;
}
