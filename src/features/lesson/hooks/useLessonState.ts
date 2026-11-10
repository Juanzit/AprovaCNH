import { useState, useCallback, useMemo } from 'react';
import type { Question, StudentQuestion, OptionId } from '../types/question';
import { calculateLessonXp, type XpBreakdown } from '../utils/xpCalculator';

export interface RevealedAnswer {
  correctOptionId: OptionId;
  explanation: string;
}

export interface UseLessonStateOptions {
  /**
   * Callback assíncrono para validação autoritativa no servidor (Server Action).
   * O cliente nunca calcula o gabarito localmente nem possui acesso às chaves antes do envio.
   */
  onVerifyAnswer?: (
    questionId: string,
    selectedOptionId: OptionId
  ) => Promise<{
    isCorrect: boolean;
    correctOptionId: OptionId;
    explanation: string;
  }>;
}

export interface UseLessonStateReturn {
  currentQuestion: StudentQuestion | Question | undefined;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedOptionId: OptionId | null;
  isAnswerSubmitted: boolean;
  isCorrect: boolean | null;
  correctAnswersCount: number;
  isCompleted: boolean;
  xpBreakdown: XpBreakdown;
  submittedAnswers: Array<{ questionId: string; selectedOptionId: string }>;
  revealedAnswer: RevealedAnswer | null;
  isVerifying: boolean;
  selectOption: (id: OptionId) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  resetLesson: () => void;
}

export function useLessonState(
  questions: (StudentQuestion | Question)[],
  options?: UseLessonStateOptions
): UseLessonStateReturn {
  const totalQuestions = questions.length;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<OptionId | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState<RevealedAnswer | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<
    Array<{ questionId: string; selectedOptionId: string }>
  >([]);

  const currentQuestion = questions[currentQuestionIndex];

  const selectOption = useCallback(
    (id: OptionId) => {
      if (isAnswerSubmitted || isVerifying) {
        return; // Bloqueia alteração após confirmação ou durante conferência
      }
      setSelectedOptionId(id);
    },
    [isAnswerSubmitted, isVerifying]
  );

  const submitAnswer = useCallback(() => {
    if (isAnswerSubmitted || isVerifying || !selectedOptionId || !currentQuestion) {
      return;
    }

    const applyVerifiedAnswer = (correctOptionId: OptionId, explanation: string) => {
      const correct = selectedOptionId === correctOptionId;
      setIsCorrect(correct);
      setRevealedAnswer({ correctOptionId, explanation });
      if (correct) setCorrectAnswersCount((prev) => prev + 1);
      setSubmittedAnswers((prev) => [
        ...prev.filter((answer) => answer.questionId !== currentQuestion.id),
        { questionId: currentQuestion.id, selectedOptionId },
      ]);
      setIsAnswerSubmitted(true);
    };

    // Lição Guiada/Revisão: FormativeQuestion já contém a chave pedagógica.
    // Atualização síncrona: nenhum await, Server Action ou transition antes do feedback.
    if (
      'correctOptionId' in currentQuestion &&
      currentQuestion.correctOptionId &&
      'explanation' in currentQuestion
    ) {
      applyVerifiedAnswer(
        currentQuestion.correctOptionId,
        typeof currentQuestion.explanation === 'string' ? currentQuestion.explanation : ''
      );
      return;
    }

    // Fallback de compatibilidade para componentes que ainda recebem StudentQuestion sanitizada.
    if (options?.onVerifyAnswer) {
      setIsVerifying(true);
      void options.onVerifyAnswer(currentQuestion.id, selectedOptionId)
        .then((result) => applyVerifiedAnswer(result.correctOptionId, result.explanation))
        .catch((error) => {
          console.error('[useLessonState] Falha ao validar resposta no servidor:', error);
        })
        .finally(() => setIsVerifying(false));
    }
  }, [isAnswerSubmitted, isVerifying, selectedOptionId, currentQuestion, options]);

  const nextQuestion = useCallback(() => {
    if (!isAnswerSubmitted) {
      return; // Só pode avançar se respondeu
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
      setIsCorrect(null);
      setRevealedAnswer(null);
    } else {
      setIsCompleted(true);
    }
  }, [isAnswerSubmitted, currentQuestionIndex, totalQuestions]);

  const resetLesson = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(null);
    setRevealedAnswer(null);
    setCorrectAnswersCount(0);
    setIsCompleted(false);
    setSubmittedAnswers([]);
  }, []);

  const answeredCount = isCompleted
    ? totalQuestions
    : isAnswerSubmitted
    ? currentQuestionIndex + 1
    : currentQuestionIndex;

  const xpBreakdown = useMemo(() => {
    return calculateLessonXp(correctAnswersCount, answeredCount, totalQuestions);
  }, [correctAnswersCount, answeredCount, totalQuestions]);

  return {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    selectedOptionId,
    isAnswerSubmitted,
    isCorrect,
    correctAnswersCount,
    isCompleted,
    xpBreakdown,
    submittedAnswers,
    revealedAnswer,
    isVerifying,
    selectOption,
    submitAnswer,
    nextQuestion,
    resetLesson,
  };
}
