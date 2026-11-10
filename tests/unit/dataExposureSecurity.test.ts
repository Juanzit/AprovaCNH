import { describe, it, expect, beforeEach } from 'vitest';
import { generateSimuladoQuestions } from '@/features/simulado/utils/simuladoGenerator';
import { toStudentQuestion } from '@/features/lesson/schemas/questionSchema';
import { getFallbackApprovedQuestions } from '@/features/lesson/server/questionRepository';
import type { StudentQuestion } from '@/features/lesson/types/question';

/**
 * Suite de Testes de Segurança de Dados e Cenários Negativos (P0)
 * Simulação rigorosa do modelo de controle de acesso PostgreSQL,
 * integridade da RPC vinculada a sessões persistidas (Anti-Oráculo)
 * e isolamento físico do frontend contra vazamento antecipado de gabarito.
 */

interface MockUserSession {
  role: 'anon' | 'authenticated' | 'service_role';
  userId?: string;
}

interface QuestionDbRow {
  id: string;
  version: number;
  statement: string;
  options: Array<{ id: string; text: string }>;
  correct_option_id: string;
  explanation: string;
  topic: string;
  subtopic: string | null;
  ufs: string[];
  categories: string[];
  status: 'rascunho' | 'em_revisao' | 'aprovada' | 'suspensa' | 'obsoleta';
  is_example: boolean;
}

interface ReviewDbRow {
  question_id: string;
  generator_model: string | null;
  verifier_model: string | null;
  verification_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
}

interface SimuladoSessionRow {
  id: string;
  user_id: string | null;
  guest_token: string | null;
  status: 'in_progress' | 'completed' | 'abandoned' | 'timed_out';
  score: number;
  passing_score: number;
  is_approved: boolean | null;
  started_at: string;
  finished_at: string | null;
}

interface SimuladoAnswerRow {
  simulado_id: string;
  question_id: string;
  question_order: number;
  selected_option_id: string | null;
  is_correct: boolean | null;
}

// Conjunto mock de questões
const mockQuestions: QuestionDbRow[] = [
  {
    id: 'sin-001',
    version: 1,
    statement: 'Diante da placa R-1, o condutor deve:',
    options: [
      { id: 'a', text: 'Parar obrigatoriamente o veículo' },
      { id: 'b', text: 'Reduzir a velocidade e seguir' },
      { id: 'c', text: 'Acelerar' },
      { id: 'd', text: 'Dar preferência apenas a ônibus' },
    ],
    correct_option_id: 'a',
    explanation: 'A placa R-1 regulamenta Parada Obrigatória (Resolução CONTRAN 973/2022).',
    topic: 'Sinalização de Trânsito',
    subtopic: 'Regulamentação',
    ufs: ['MG'],
    categories: ['B'],
    status: 'aprovada',
    is_example: false,
  },
  {
    id: 'sin-002',
    version: 1,
    statement: 'A placa R-2 indica:',
    options: [
      { id: 'a', text: 'Dê a preferência' },
      { id: 'b', text: 'Siga em frente' },
      { id: 'c', text: 'Parada obrigatória' },
      { id: 'd', text: 'Sentido proibido' },
    ],
    correct_option_id: 'a',
    explanation: 'A placa R-2 regulamenta Dê a Preferência (Resolução CONTRAN 973/2022).',
    topic: 'Sinalização de Trânsito',
    subtopic: 'Regulamentação',
    ufs: ['MG'],
    categories: ['B'],
    status: 'aprovada',
    is_example: false,
  },
  {
    id: 'sin-025',
    version: 1,
    statement: 'A placa A-15 indica parada obrigatória à frente:',
    options: [
      { id: 'a', text: 'Opção A' },
      { id: 'b', text: 'Opção B' },
      { id: 'c', text: 'Opção C' },
      { id: 'd', text: 'Opção D' },
    ],
    correct_option_id: 'b',
    explanation: 'Explicação pendente de homologação.',
    topic: 'Sinalização de Trânsito',
    subtopic: 'Advertência',
    ufs: ['MG'],
    categories: ['B'],
    status: 'em_revisao',
    is_example: false,
  },
];

const mockReviews: ReviewDbRow[] = [
  {
    question_id: 'sin-001',
    generator_model: 'gemini-1.5-pro',
    verifier_model: 'claude-3-5-sonnet',
    verification_notes: 'Validado pelo Tech Lead em auditoria formal.',
    approved_by: 'Tech Lead Humano',
    approved_at: '2026-11-08T10:00:00Z',
  },
];

// Simulador das regras do PostgreSQL com Column-Level Security e RLS
function simulatePostgresQuery(
  session: MockUserSession,
  table: 'questions' | 'question_reviews' | 'student_questions',
  requestedColumns: string[]
): Record<string, unknown>[] {
  // 1. Tabela question_reviews: REVOKE ALL FROM anon, authenticated
  if (table === 'question_reviews') {
    if (session.role === 'anon' || session.role === 'authenticated') {
      throw new Error('PermissionDeniedError: permission denied for relation question_reviews');
    }
    return mockReviews.map((r) => {
      const projected: Record<string, unknown> = {};
      for (const col of requestedColumns) {
        projected[col] = (r as unknown as Record<string, unknown>)[col];
      }
      return projected;
    });
  }

  // 2. View student_questions (com security_invoker = true)
  if (table === 'student_questions') {
    for (const col of requestedColumns) {
      if (['correct_option_id', 'explanation'].includes(col)) {
        throw new Error(`ColumnNotFoundError: column "${col}" does not exist in view student_questions`);
      }
    }
    const approvedOnly = mockQuestions.filter((q) => q.status === 'aprovada' && !q.is_example);
    return approvedOnly.map((q) => {
      const projected: Record<string, unknown> = {};
      for (const col of requestedColumns) {
        projected[col] = (q as unknown as Record<string, unknown>)[col];
      }
      return projected;
    });
  }

  // 3. Tabela questions com Column-Level Security (CLS)
  if (table === 'questions') {
    if (session.role === 'anon' || session.role === 'authenticated') {
      for (const col of requestedColumns) {
        if (['correct_option_id', 'explanation'].includes(col)) {
          throw new Error(`PermissionDeniedError: permission denied for column ${col} of relation questions`);
        }
      }
    }

    let rows = mockQuestions;
    if (session.role === 'anon' || session.role === 'authenticated') {
      rows = rows.filter((q) => q.status === 'aprovada' && !q.is_example);
    }

    return rows.map((q) => {
      const projected: Record<string, unknown> = {};
      for (const col of requestedColumns) {
        projected[col] = (q as unknown as Record<string, unknown>)[col];
      }
      return projected;
    });
  }

  return [];
}

// Simulador das RPCs transacionais blindadas da Migration 000009
class MockSimuladoDbState {
  sessions: Map<string, SimuladoSessionRow> = new Map();
  answers: Map<string, SimuladoAnswerRow[]> = new Map();

  constructor() {
    this.reset();
  }

  reset() {
    this.sessions.clear();
    this.answers.clear();

    // Sessão 1: Em andamento do aluno 123
    this.sessions.set('sess-active-123', {
      id: 'sess-active-123',
      user_id: 'user-student-123',
      guest_token: null,
      status: 'in_progress',
      score: 0,
      passing_score: 20,
      is_approved: null,
      started_at: new Date().toISOString(),
      finished_at: null,
    });
    this.answers.set('sess-active-123', [
      { simulado_id: 'sess-active-123', question_id: 'sin-001', question_order: 1, selected_option_id: null, is_correct: null },
      { simulado_id: 'sess-active-123', question_id: 'sin-002', question_order: 2, selected_option_id: null, is_correct: null },
    ]);

    // Sessão 2: Em andamento de Convidado com token opaco
    this.sessions.set('sess-guest-abc', {
      id: 'sess-guest-abc',
      user_id: null,
      guest_token: 'valid-guest-secret-token',
      status: 'in_progress',
      score: 0,
      passing_score: 20,
      is_approved: null,
      started_at: new Date().toISOString(),
      finished_at: null,
    });
    this.answers.set('sess-guest-abc', [
      { simulado_id: 'sess-guest-abc', question_id: 'sin-001', question_order: 1, selected_option_id: null, is_correct: null },
    ]);

    // Sessão 3: Já concluída
    this.sessions.set('sess-completed-999', {
      id: 'sess-completed-999',
      user_id: 'user-student-123',
      guest_token: null,
      status: 'completed',
      score: 25,
      passing_score: 20,
      is_approved: true,
      started_at: new Date(Date.now() - 3600000).toISOString(),
      finished_at: new Date().toISOString(),
    });
    this.answers.set('sess-completed-999', [
      { simulado_id: 'sess-completed-999', question_id: 'sin-001', question_order: 1, selected_option_id: 'a', is_correct: true },
    ]);
  }

  // RPC: record_simulado_answer
  recordSimuladoAnswer(
    session: MockUserSession,
    p_session_id: string,
    p_question_id: string,
    p_selected_option_id: string,
    p_guest_token?: string
  ): { success: boolean; session_id: string; question_id: string; recorded_at: string } {
    const s = this.sessions.get(p_session_id);
    if (!s) {
      throw new Error('Tentativa não encontrada (sessão inválida).');
    }

    if (s.status !== 'in_progress') {
      throw new Error(`A tentativa não está em andamento (status: ${s.status}).`);
    }

    // Validação de propriedade
    if (s.user_id !== null) {
      if (!session.userId || session.userId !== s.user_id) {
        throw new Error('Não autorizado: esta tentativa pertence a outro usuário.');
      }
    } else {
      if (!p_guest_token || s.guest_token !== p_guest_token) {
        throw new Error('Não autorizado: token opaco de convidado inválido.');
      }
    }

    // Validação de questão na tentativa
    const answersList = this.answers.get(p_session_id) || [];
    const item = answersList.find((a) => a.question_id === p_question_id);
    if (!item) {
      throw new Error('Questão não atribuída a esta tentativa de simulado.');
    }

    // Imutabilidade da primeira submissão
    if (item.selected_option_id !== null) {
      throw new Error('Resposta já submetida e imutável para esta questão nesta tentativa.');
    }

    item.selected_option_id = p_selected_option_id;

    // RETORNO SEGURO: Não contém correct_option_id nem explanation
    return {
      success: true,
      session_id: p_session_id,
      question_id: p_question_id,
      recorded_at: new Date().toISOString(),
    };
  }

  // RPC: finish_and_evaluate_simulado
  finishAndEvaluateSimulado(
    session: MockUserSession,
    p_session_id: string,
    p_guest_token?: string
  ) {
    const s = this.sessions.get(p_session_id);
    if (!s) {
      throw new Error('Tentativa não encontrada.');
    }

    if (s.status === 'completed') {
      // Idempotência: retorna resultado previamente consolidado
      const answersList = this.answers.get(p_session_id) || [];
      const items = answersList.map((a) => {
        const q = mockQuestions.find((mq) => mq.id === a.question_id)!;
        return {
          question_id: a.question_id,
          selected_option_id: a.selected_option_id,
          correct_option_id: q.correct_option_id,
          is_correct: a.is_correct,
          explanation: q.explanation,
        };
      });
      return { success: true, status: 'completed', score: s.score, items };
    }

    if (s.status !== 'in_progress') {
      throw new Error(`Tentativa não está em andamento (status: ${s.status}).`);
    }

    // Validação de propriedade
    if (s.user_id !== null) {
      if (!session.userId || session.userId !== s.user_id) {
        throw new Error('Não autorizado: esta tentativa pertence a outro usuário.');
      }
    } else {
      if (!p_guest_token || s.guest_token !== p_guest_token) {
        throw new Error('Não autorizado: token opaco de convidado inválido.');
      }
    }

    const answersList = this.answers.get(p_session_id) || [];
    let score = 0;
    const evaluatedItems = [];

    for (const a of answersList) {
      const q = mockQuestions.find((mq) => mq.id === a.question_id)!;
      const isCorrect = a.selected_option_id !== null && a.selected_option_id === q.correct_option_id;
      if (isCorrect) score++;
      a.is_correct = isCorrect;
      evaluatedItems.push({
        question_id: a.question_id,
        selected_option_id: a.selected_option_id,
        correct_option_id: q.correct_option_id,
        is_correct: isCorrect,
        explanation: q.explanation,
      });
    }

    s.status = 'completed';
    s.score = score;
    s.is_approved = score >= s.passing_score;

    // Apenas após a conclusão formal libera gabarito e explicação
    return {
      success: true,
      status: 'completed',
      score,
      is_approved: s.is_approved,
      items: evaluatedItems,
    };
  }
}

describe('Auditoria de Segurança de Gabarito, Anti-Oráculo e Isolamento Frontend (P0)', () => {
  const db = new MockSimuladoDbState();

  beforeEach(() => {
    db.reset();
  });

  // ==============================================================================
  // 1. TESTES DE CONSULTA DIRETA AO POSTGREST (CLS e Revogação de Tabelas)
  // ==============================================================================
  describe('1. Tentativa de Consulta Direta via PostgREST (anon / authenticated)', () => {
    const studentSession: MockUserSession = { role: 'authenticated', userId: 'user-student-123' };
    const anonSession: MockUserSession = { role: 'anon' };

    it('bloqueia consulta direta à coluna correct_option_id para estudante autenticado', () => {
      expect(() => {
        simulatePostgresQuery(studentSession, 'questions', ['id', 'statement', 'correct_option_id']);
      }).toThrow(/permission denied for column correct_option_id/);
    });

    it('bloqueia consulta direta à coluna explanation para visitante anônimo', () => {
      expect(() => {
        simulatePostgresQuery(anonSession, 'questions', ['id', 'statement', 'explanation']);
      }).toThrow(/permission denied for column explanation/);
    });

    it('bloqueia acesso direto à tabela question_reviews para estudante autenticado', () => {
      expect(() => {
        simulatePostgresQuery(studentSession, 'question_reviews', ['question_id', 'verification_notes']);
      }).toThrow(/permission denied for relation question_reviews/);
    });

    it('bloqueia acesso direto à tabela question_reviews para visitante anônimo', () => {
      expect(() => {
        simulatePostgresQuery(anonSession, 'question_reviews', ['question_id', 'approved_by']);
      }).toThrow(/permission denied for relation question_reviews/);
    });

    it('a View Sanitizada student_questions não possui as colunas correct_option_id ou explanation', () => {
      expect(() => {
        simulatePostgresQuery(studentSession, 'student_questions', ['id', 'correct_option_id']);
      }).toThrow(/does not exist in view student_questions/);

      expect(() => {
        simulatePostgresQuery(studentSession, 'student_questions', ['id', 'explanation']);
      }).toThrow(/does not exist in view student_questions/);
    });
  });

  // ==============================================================================
  // 2. TESTES DA RPC TRANSACIONAL DE RESPOSTA (Anti-Oráculo de Gabarito)
  // ==============================================================================
  describe('2. RPC record_simulado_answer: Proteção Anti-Oráculo e Imutabilidade', () => {
    const studentSession: MockUserSession = { role: 'authenticated', userId: 'user-student-123' };
    const otherStudentSession: MockUserSession = { role: 'authenticated', userId: 'user-attacker-666' };

    it('rejeita chamada com sessão inexistente', () => {
      expect(() => {
        db.recordSimuladoAnswer(studentSession, 'sess-inexistente', 'sin-001', 'a');
      }).toThrow(/Tentativa não encontrada/);
    });

    it('rejeita chamada para tentativa pertencente a outro usuário', () => {
      expect(() => {
        db.recordSimuladoAnswer(otherStudentSession, 'sess-active-123', 'sin-001', 'a');
      }).toThrow(/Não autorizado: esta tentativa pertence a outro usuário/);
    });

    it('rejeita tentativa de convidado com token inválido ou ausente', () => {
      expect(() => {
        db.recordSimuladoAnswer({ role: 'anon' }, 'sess-guest-abc', 'sin-001', 'a', 'token-falso');
      }).toThrow(/token opaco de convidado inválido/);
    });

    it('rejeita submissão para tentativa já concluída', () => {
      expect(() => {
        db.recordSimuladoAnswer(studentSession, 'sess-completed-999', 'sin-001', 'b');
      }).toThrow(/A tentativa não está em andamento/);
    });

    it('rejeita submissão para questão que não pertence àquela tentativa', () => {
      expect(() => {
        db.recordSimuladoAnswer(studentSession, 'sess-active-123', 'sin-025', 'b');
      }).toThrow(/Questão não atribuída a esta tentativa/);
    });

    it('grava a primeira submissão com sucesso e JAMAIS retorna correct_option_id ou explanation', () => {
      const res = db.recordSimuladoAnswer(studentSession, 'sess-active-123', 'sin-001', 'a');
      expect(res.success).toBe(true);
      expect(res).not.toHaveProperty('correct_option_id');
      expect(res).not.toHaveProperty('is_correct');
      expect(res).not.toHaveProperty('explanation');
    });

    it('ANTI-ORÁCULO / FORÇA BRUTA: rejeita resposta repetida para a mesma questão na mesma tentativa', () => {
      // 1ª submissão: opção 'a'
      db.recordSimuladoAnswer(studentSession, 'sess-active-123', 'sin-001', 'a');

      // Tentativa de oráculo/força bruta: tentar opção 'b' na mesma questão
      expect(() => {
        db.recordSimuladoAnswer(studentSession, 'sess-active-123', 'sin-001', 'b');
      }).toThrow(/Resposta já submetida e imutável para esta questão nesta tentativa/);
    });
  });

  // ==============================================================================
  // 3. TESTES DA RPC DE FINALIZAÇÃO E CORREÇÃO AUTORIZADA
  // ==============================================================================
  describe('3. RPC finish_and_evaluate_simulado: Liberação Oportuna do Gabarito', () => {
    const studentSession: MockUserSession = { role: 'authenticated', userId: 'user-student-123' };

    it('libera o gabarito e a explicação exclusivamente após a finalização da tentativa', () => {
      // Aluno responde sin-001
      db.recordSimuladoAnswer(studentSession, 'sess-active-123', 'sin-001', 'a');

      // Finaliza o simulado formalmente
      const result = db.finishAndEvaluateSimulado(studentSession, 'sess-active-123');

      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
      expect(result.items).toHaveLength(2);

      const item1 = result.items.find((i) => i.question_id === 'sin-001')!;
      expect(item1.selected_option_id).toBe('a');
      expect(item1.correct_option_id).toBe('a');
      expect(item1.is_correct).toBe(true);
      expect(item1.explanation).toContain('Parada Obrigatória');
    });

    it('é idempotente: reconsultar tentativa concluída retorna o gabarito sem reavaliação', () => {
      const res = db.finishAndEvaluateSimulado(studentSession, 'sess-completed-999');
      expect(res.success).toBe(true);
      expect(res.status).toBe('completed');
      expect(res.score).toBe(25);
    });
  });

  // ==============================================================================
  // 4. INSPEÇÃO DE DADOS ENTREGUES AO FRONTEND (SimuladoContainer e LessonContainer)
  // ==============================================================================
  describe('4. Isolamento Físico de Dados no Frontend (StudentQuestion DTO)', () => {
    it('garante que generateSimuladoQuestions entrega SimuladoQuestionItem sem correctOptionId ou explanation', () => {
      const fallbackQuestions = getFallbackApprovedQuestions();
      // Simula banco com 30 questões aprovadas
      const fullBank = Array.from({ length: 30 }, (_, idx) => {
        const base = fallbackQuestions[idx % fallbackQuestions.length];
        return {
          ...base,
          id: `sim-mock-${idx + 1}`,
          ufs: ['MG'],
          // Forja chaves para testar se são expurgadas pelo gerador
          correctOptionId: 'a',
          explanation: 'Segredo que não pode vazar ao cliente',
        };
      });

      const items = generateSimuladoQuestions(fullBank as any, { totalQuestions: 30, uf: 'MG' });
      expect(items).toHaveLength(30);

      // Inspeciona exaustivamente todos os 30 itens entregues ao SimuladoContainer
      for (const item of items) {
        const q = item.question as unknown as Record<string, unknown>;
        expect(q.id).toBeDefined();
        expect(q.statement).toBeDefined();
        expect(q.options).toBeDefined();

        // O gabarito e a explicação NÃO PODEM EXISTIR no objeto entregue
        expect(q.correctOptionId).toBeUndefined();
        expect(q.explanation).toBeUndefined();
        expect(q.review).toBeUndefined();
      }
    });

    it('toStudentQuestion sanitiza e remove rigorosamente correctOptionId, explanation e review', () => {
      const rawQuestion = {
        id: 'sin-test-leak',
        version: 1,
        statement: 'Enunciado de teste de vazamento:',
        options: [
          { id: 'a', text: 'A' },
          { id: 'b', text: 'B' },
          { id: 'c', text: 'C' },
          { id: 'd', text: 'D' },
        ],
        correctOptionId: 'a',
        explanation: 'Explicação privada do servidor',
        topic: 'Sinalização',
        ufs: ['MG'],
        categories: ['B'],
        source: {
          kind: 'official',
          document: 'CTB',
          provision: 'Art. 29',
          url: 'https://www.planalto.gov.br',
          checkedAt: '2026-11-09T00:00:00Z',
          effectiveFrom: '1998-01-22',
          sourceVersion: 'v1',
          verificationStatus: 'verified',
        },
        status: 'aprovada',
        isExample: false,
        review: {
          generatorModel: 'gemini',
          verifierModel: 'claude',
          verificationNotes: 'Confidencial',
          approvedBy: 'Tech Lead',
          approvedAt: '2026-11-09',
        },
      };

      const studentQ = toStudentQuestion(rawQuestion) as unknown as Record<string, unknown>;
      expect(studentQ.id).toBe('sin-test-leak');
      expect(studentQ.correctOptionId).toBeUndefined();
      expect(studentQ.explanation).toBeUndefined();
      expect(studentQ.review).toBeUndefined();
    });
  });

  // ==============================================================================
  // 5. PRESERVAÇÃO DE service_role E ACESSO EDITORIAL
  // ==============================================================================
  describe('5. Preservação do Acesso Administrativo e Editorial Autorizado', () => {
    const adminSession: MockUserSession = { role: 'service_role' };

    it('service_role preserva acesso irrestrito para leitura de correct_option_id e explanation', () => {
      const rows = simulatePostgresQuery(adminSession, 'questions', ['id', 'correct_option_id', 'explanation']);
      expect(rows).toHaveLength(3);
      expect(rows[0].correct_option_id).toBe('a');
    });

    it('service_role preserva acesso para auditoria de question_reviews', () => {
      const rows = simulatePostgresQuery(adminSession, 'question_reviews', ['question_id', 'verification_notes', 'approved_by']);
      expect(rows).toHaveLength(1);
      expect(rows[0].approved_by).toBe('Tech Lead Humano');
      expect(rows[0].verification_notes).toContain('Tech Lead');
    });
  });
});
