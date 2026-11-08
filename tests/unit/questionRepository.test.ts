import { describe, it, expect, vi } from 'vitest';
import {
  mapAndValidateDatabaseQuestion,
  getFallbackApprovedQuestions,
  getApprovedQuestionsByTopic,
} from '@/features/lesson/server/questionRepository';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('questionRepository (Anti-Corruption Layer)', () => {
  const validDbRow = {
    id: 'sin-db-001',
    version: 1,
    statement: 'Qual a conduta correta diante da ordem de parada do agente de trânsito?',
    options: [
      { id: 'a', text: 'Parar o veículo imediatamente conforme a determinação.' },
      { id: 'b', text: 'Ignorar a ordem caso o semáforo esteja verde.' },
      { id: 'c', text: 'Acelerar para desobstruir a via.' },
      { id: 'd', text: 'Aguardar sinalização de pedestres.' },
    ],
    correct_option_id: 'a',
    explanation: 'As ordens do agente prevalecem sobre os demais sinais viários (Art. 89, I do CTB).',
    topic: 'Sinalização de Trânsito',
    subtopic: 'Ordens do Agente (Art. 195)',
    ufs: [],
    categories: ['A', 'B'],
    status: 'aprovada',
    is_example: false,
    question_sources: [
      {
        kind: 'official',
        document: 'Resolução CONTRAN nº 985/2022 (MBFT)',
        provision: 'Art. 195 (Ficha 583-50)',
        url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf',
        checked_at: '2026-11-07T23:00:00Z',
        effective_from: '2023-01-02',
        effective_until: null,
        source_version: 'MBFT 2022',
        license_note: 'Domínio Público',
        verification_status: 'verified',
      },
    ],
    question_reviews: [
      {
        generator_model: 'Antigravity/Gemini-3.8-Flash',
        verifier_model: 'Independent/Auditor-Juridico',
        verification_notes: 'Validado em conformidade com o CTB.',
        approved_by: 'Tech Lead / Responsável pelo Produto',
        approved_at: '2026-11-07T23:43:10Z',
      },
    ],
  };

  it('mapeia e valida com sucesso um registro válido do PostgreSQL no modelo Zod de domínio', () => {
    const question = mapAndValidateDatabaseQuestion(validDbRow);

    expect(question.id).toBe('sin-db-001');
    expect(question.status).toBe('aprovada');
    expect(question.correctOptionId).toBe('a');
    expect(question.options).toHaveLength(4);
    expect(question.source.kind).toBe('official');
    expect(question.source.verificationStatus).toBe('verified');
    expect(question.review?.approvedBy).toBe('Tech Lead / Responsável pelo Produto');
  });

  it('rejeita com erro Zod quando a tupla de alternativas contém menos de 4 itens', () => {
    const invalidRow = {
      ...validDbRow,
      options: [
        { id: 'a', text: 'Opção 1' },
        { id: 'b', text: 'Opção 2' },
      ],
    };

    expect(() => mapAndValidateDatabaseQuestion(invalidRow)).toThrow();
  });

  it('rejeita com erro Zod quando o modelo gerador e o modelo verificador são idênticos (D003)', () => {
    const invalidRow = {
      ...validDbRow,
      question_reviews: [
        {
          ...validDbRow.question_reviews[0],
          generator_model: 'Mesmo-Modelo',
          verifier_model: 'Mesmo-Modelo',
        },
      ],
    };

    expect(() => mapAndValidateDatabaseQuestion(invalidRow)).toThrow();
  });

  it('rejeita com erro Zod quando ufs contém "BR" (D014)', () => {
    const invalidRow = {
      ...validDbRow,
      ufs: ['BR'],
    };

    expect(() => mapAndValidateDatabaseQuestion(invalidRow)).toThrow();
  });

  it('carrega e valida os 20 registros do acervo local homologado via fallback', () => {
    const fallback = getFallbackApprovedQuestions();
    expect(fallback).toHaveLength(20);
    fallback.forEach((q) => {
      expect(q.status).toBe('aprovada');
      expect(q.options).toHaveLength(4);
      expect(q.source.verificationStatus).toBe('verified');
      expect(q.review?.approvedBy).toBeTruthy();
    });
  });

  it('retorna os dados do fallback quando o cliente Supabase lança exceção ou erro', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Tabela não encontrada'),
              }),
            }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const questions = await getApprovedQuestionsByTopic('Sinalização de Trânsito');
    expect(questions).toHaveLength(20);
    expect(questions[0].id).toBe('sin-001');
  });
});
