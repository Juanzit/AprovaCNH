import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OptionList } from '@/features/lesson/components/OptionList';
import type { QuestionOption } from '@/features/lesson/types/question';

const mockOptions: [QuestionOption, QuestionOption, QuestionOption, QuestionOption] = [
  { id: 'a', text: 'Opção Alfa' },
  { id: 'b', text: 'Opção Bravo' },
  { id: 'c', text: 'Opção Charlie' },
  { id: 'd', text: 'Opção Delta' },
];

describe('OptionList Component', () => {
  it('deve renderizar fieldset com legend acessível e aviso de questão demonstrativa', () => {
    render(
      <OptionList
        statement="Qual a finalidade da sinalização?"
        options={mockOptions}
        selectedOptionId={null}
        correctOptionId="a"
        isAnswerSubmitted={false}
        onSelectOption={vi.fn()}
        isExample={true}
      />
    );

    const legend = screen.getByText('Qual a finalidade da sinalização?');
    expect(legend).toBeInTheDocument();
    expect(legend.tagName.toLowerCase()).toBe('legend');

    const demoNotice = screen.getByText(/Questão demonstrativa de interface/i);
    expect(demoNotice).toBeInTheDocument();
  });

  it('deve renderizar exatamente quatro alternativas como inputs do tipo radio', () => {
    render(
      <OptionList
        statement="Qual a finalidade da sinalização?"
        options={mockOptions}
        selectedOptionId="b"
        correctOptionId="a"
        isAnswerSubmitted={false}
        onSelectOption={vi.fn()}
      />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);

    const radioB = screen.getByLabelText(/Opção Bravo/i);
    expect(radioB).toBeChecked();
  });

  it('deve disparar onSelectOption ao clicar na alternativa', () => {
    const handleSelect = vi.fn();

    render(
      <OptionList
        statement="Qual a finalidade da sinalização?"
        options={mockOptions}
        selectedOptionId={null}
        correctOptionId="a"
        isAnswerSubmitted={false}
        onSelectOption={handleSelect}
      />
    );

    const radioC = screen.getByLabelText(/Opção Charlie/i);
    fireEvent.click(radioC);

    expect(handleSelect).toHaveBeenCalledWith('c');
  });

  it('deve desabilitar todos os rádios quando a resposta for submetida', () => {
    render(
      <OptionList
        statement="Qual a finalidade da sinalização?"
        options={mockOptions}
        selectedOptionId="a"
        correctOptionId="a"
        isAnswerSubmitted={true}
        onSelectOption={vi.fn()}
      />
    );

    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });
});
