import { describe, it, expect, vi } from 'vitest';
import {
  mapAndValidateDatabaseQuestion,
  getFallbackApprovedQuestions,
  getAuthoritativeQuestionsForServer,
  getApprovedQuestionsByTopic,
  getQuestionAnswerKey,
  getQuestionAnswerKeys,
} from '@/features/lesson/server/questionRepository';
import { isQuestionEligibleForStudents } from '@/features/lesson/schemas/questionSchema';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

describe('questionRepository (Anti-Corruption Layer & Segurança Editorial)', () => {
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

  it('resolve gabaritos do seed aprovado no servidor sem esperar consulta remota', async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    vi.mocked(createAdminClient).mockClear();

    const answerKey = await getQuestionAnswerKey('sin-001');
    const answerKeys = await getQuestionAnswerKeys(['sin-001', 'sin-002']);

    expect(answerKey?.questionId).toBe('sin-001');
    expect(answerKey?.explanation.length).toBeGreaterThan(0);
    expect(answerKeys.has('sin-001')).toBe(true);
    expect(answerKeys.has('sin-002')).toBe(true);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

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

  // Requisito Obrigatório 1: Um conjunto com 20 aprovadas e 10 em revisão retorna somente 20 questões no fallback
  it('carrega o acervo local via fallback e retorna EXCLUSIVAMENTE as 20 questões aprovadas (filtrando as 10 em revisão)', () => {
    const fallback = getFallbackApprovedQuestions();
    expect(fallback).toHaveLength(20);

    fallback.forEach((q) => {
      expect(isQuestionEligibleForStudents(q)).toBe(true);
      expect(q.status).toBe('aprovada');
      expect(q.isExample).toBe(false);
      expect(q.options).toHaveLength(4);
      expect(q.source.verificationStatus).toBe('verified');
    });

    const authoritativeFallback = getAuthoritativeQuestionsForServer();
    expect(authoritativeFallback).toHaveLength(20);
    authoritativeFallback.forEach((q) => {
      expect(q.review?.approvedBy).toBeTruthy();
    });

    const anyInReview = fallback.some((q) => (q.status as string) === 'em_revisao');
    expect(anyInReview).toBe(false);
  });

  // Requisito Obrigatório 5: Nenhuma questão em revisão chega à lição, SRS, fallback ou simulado
  it('garante que nenhuma questão com status em_revisao é retornada por getApprovedQuestionsByTopic via fallback', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const mockBuilder: Record<string, any> = {};
    mockBuilder.select = vi.fn().mockReturnValue(mockBuilder);
    mockBuilder.eq = vi.fn().mockReturnValue(mockBuilder);
    mockBuilder.ilike = vi.fn().mockReturnValue(mockBuilder);
    mockBuilder.order = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('Tabela não migrada'),
    });

    vi.mocked(createClient).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue(mockBuilder),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const questions = await getApprovedQuestionsByTopic('Sinalização de Trânsito');
    expect(questions).toHaveLength(20);
    questions.forEach((q) => {
      expect(q.status).toBe('aprovada');
      expect(q.isExample).toBe(false);
    });
    expect(questions.some((q) => (q.status as string) === 'em_revisao')).toBe(false);
  });

  // Requisito Obrigatório 6: A ausência de questões aprovadas não causa retorno indiscriminado do JSON
  it('a ausência de questões aprovadas no banco e no fallback não causa retorno indiscriminado do JSON (retorna array vazio)', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const mockQueryBuilder: Record<string, unknown> = {};
    mockQueryBuilder.eq = vi.fn().mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.ilike = vi.fn().mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.order = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    mockQueryBuilder.select = vi.fn().mockReturnValue(mockQueryBuilder);

    vi.mocked(createClient).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue(mockQueryBuilder),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const questions = await getApprovedQuestionsByTopic('Topico Inexistente Sem Fallback', { fallbackToLocal: false });
    expect(questions).toEqual([]);
  });
});
