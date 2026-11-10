import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLessonState } from '@/features/lesson/hooks/useLessonState';
import rawSeed from '@/data/seed-sinalizacao.json';
import { lessonSeedSchema } from '@/features/lesson/schemas/questionSchema';

const sampleQuestions = lessonSeedSchema.parse(rawSeed);

describe('useLessonState', () => {
  it('deve inicializar com o primeiro item da lista e estado zerado', () => {
    const { result } = renderHook(() => useLessonState(sampleQuestions));

    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.selectedOptionId).toBeNull();
    expect(result.current.isAnswerSubmitted).toBe(false);
    expect(result.current.isCorrect).toBeNull();
    expect(result.current.correctAnswersCount).toBe(0);
    expect(result.current.isCompleted).toBe(false);
  });

  it('deve permitir seleção de opção antes de confirmar', () => {
    const { result } = renderHook(() => useLessonState(sampleQuestions));

    act(() => {
      result.current.selectOption('a');
    });

    expect(result.current.selectedOptionId).toBe('a');
  });

  it('deve processar acerto e bloquear novas seleções após submit', () => {
    const { result } = renderHook(() => useLessonState(sampleQuestions));

    // A questão 1 tem correctOptionId: 'a'
    act(() => {
      result.current.selectOption('a');
    });

    act(() => {
      result.current.submitAnswer();
    });

    expect(result.current.isAnswerSubmitted).toBe(true);
    expect(result.current.isCorrect).toBe(true);
    expect(result.current.correctAnswersCount).toBe(1);

    // Tentar trocar para 'b' após submit deve ser ignorado
    act(() => {
      result.current.selectOption('b');
    });

    expect(result.current.selectedOptionId).toBe('a');
  });

  it('exibe o feedback formativo sincronamente sem chamar a validação remota', () => {
    const onVerifyAnswer = vi.fn().mockResolvedValue({
      isCorrect: true,
      correctOptionId: 'a',
      explanation: 'A explicação pedagógica já está no DTO formativo.',
    });
    const { result } = renderHook(() => useLessonState(sampleQuestions, { onVerifyAnswer }));

    act(() => {
      result.current.selectOption(sampleQuestions[0].correctOptionId);
    });
    act(() => {
      result.current.submitAnswer();
    });

    expect(result.current.isAnswerSubmitted).toBe(true);
    expect(result.current.isCorrect).toBe(true);
    expect(result.current.revealedAnswer?.explanation).toBeTruthy();
    expect(onVerifyAnswer).not.toHaveBeenCalled();
  });

  it('deve ignorar chamadas duplicadas de submitAnswer sem pontuar a mais', () => {
    const { result } = renderHook(() => useLessonState(sampleQuestions));

    act(() => {
      result.current.selectOption('a');
    });

    act(() => {
      result.current.submitAnswer();
    });

    expect(result.current.correctAnswersCount).toBe(1);

    act(() => {
      result.current.submitAnswer();
    });

    expect(result.current.correctAnswersCount).toBe(1);
  });

  it('deve avançar as 5 questões até a conclusão e conceder o bônus de 20 XP', () => {
    const { result } = renderHook(() => useLessonState(sampleQuestions));

    for (let i = 0; i < sampleQuestions.length; i++) {
      const q = sampleQuestions[i];
      act(() => {
        result.current.selectOption(q.correctOptionId);
      });
      act(() => {
        result.current.submitAnswer();
      });
      act(() => {
        result.current.nextQuestion();
      });
    }

    expect(result.current.isCompleted).toBe(true);
    expect(result.current.correctAnswersCount).toBe(5);
    expect(result.current.xpBreakdown.totalXp).toBe(70); // 50 + 20
  });

  it('deve reiniciar a lição ao chamar resetLesson', () => {
    const { result } = renderHook(() => useLessonState(sampleQuestions));

    act(() => {
      result.current.selectOption('a');
      result.current.submitAnswer();
      result.current.resetLesson();
    });

    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.selectedOptionId).toBeNull();
    expect(result.current.isAnswerSubmitted).toBe(false);
    expect(result.current.correctAnswersCount).toBe(0);
    expect(result.current.isCompleted).toBe(false);
  });
});
