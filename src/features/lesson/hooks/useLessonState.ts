import { useState, useCallback, useMemo } from 'react';
import type { Question, OptionId } from '../types/question';
import { calculateLessonXp, type XpBreakdown } from '../utils/xpCalculator';

export interface UseLessonStateReturn {
  currentQuestion: Question | undefined;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedOptionId: OptionId | null;
  isAnswerSubmitted: boolean;
  isCorrect: boolean | null;
  correctAnswersCount: number;
  isCompleted: boolean;
  xpBreakdown: XpBreakdown;
  selectOption: (id: OptionId) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  resetLesson: () => void;
}

export function useLessonState(questions: Question[]): UseLessonStateReturn {
  const totalQuestions = questions.length;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<OptionId | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const isCorrect = useMemo(() => {
    if (!isAnswerSubmitted || !selectedOptionId || !currentQuestion) {
      return null;
    }
    return selectedOptionId === currentQuestion.correctOptionId;
  }, [isAnswerSubmitted, selectedOptionId, currentQuestion]);

  const selectOption = useCallback((id: OptionId) => {
    if (isAnswerSubmitted) {
      return; // Bloqueia alteração após confirmação
    }
    setSelectedOptionId(id);
  }, [isAnswerSubmitted]);

  const submitAnswer = useCallback(() => {
    if (isAnswerSubmitted || !selectedOptionId || !currentQuestion) {
      return; // Bloqueia envios duplicados ou sem alternativa selecionada
    }

    const correct = selectedOptionId === currentQuestion.correctOptionId;
    if (correct) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
    setIsAnswerSubmitted(true);
  }, [isAnswerSubmitted, selectedOptionId, currentQuestion]);

  const nextQuestion = useCallback(() => {
    if (!isAnswerSubmitted) {
      return; // Só pode avançar se respondeu
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsCompleted(true);
    }
  }, [isAnswerSubmitted, currentQuestionIndex, totalQuestions]);

  const resetLesson = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setIsCompleted(false);
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
    selectOption,
    submitAnswer,
    nextQuestion,
    resetLesson,
  };
}
