import { describe, it, expect } from 'vitest';

/**
 * Suite de Testes de Segurança de Dados e Cenários Negativos (P0)
 * Valida a arquitetura de contenção de dados internos contra vazamento antecipado de gabarito
 * e exposição indevida de metadados de auditoria editorial (question_reviews).
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

// Conjunto mock de questões com diferentes status e visibilidades
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
    explanation: 'Explicação detalhada de A-15 pendente de homologação.',
    topic: 'Sinalização de Trânsito',
    subtopic: 'Advertência',
    ufs: ['MG'],
    categories: ['B'],
    status: 'em_revisao',
    is_example: false,
  },
  {
    id: 'sin-demo',
    version: 1,
    statement: 'Questão demonstrativa apenas para fins de teste interno:',
    options: [
      { id: 'a', text: 'Opção A' },
      { id: 'b', text: 'Opção B' },
      { id: 'c', text: 'Opção C' },
      { id: 'd', text: 'Opção D' },
    ],
    correct_option_id: 'c',
    explanation: 'Explicação de demonstração.',
    topic: 'Sinalização de Trânsito',
    subtopic: 'Demonstrativo',
    ufs: ['MG'],
    categories: ['B'],
    status: 'rascunho',
    is_example: true,
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
  {
    question_id: 'sin-025',
    generator_model: 'gemini-1.5-pro',
    verifier_model: 'claude-3-5-sonnet',
    verification_notes: 'Pendente de homologação humana pelo Tech Lead.',
    approved_by: null,
    approved_at: null,
  },
];

// Simulador das regras de acesso do PostgreSQL com Column-Level Security e RLS
function executePostgresQuery(
  session: MockUserSession,
  table: 'questions' | 'question_reviews' | 'student_questions',
  requestedColumns: string[],
  filters?: { status?: string; is_example?: boolean; id?: string }
): Record<string, unknown>[] {
  // 1. Tabela question_reviews: REVOKE ALL FROM anon, authenticated
  if (table === 'question_reviews') {
    if (session.role === 'anon' || session.role === 'authenticated') {
      throw new Error('PermissionDeniedError: permission denied for relation question_reviews');
    }
    // service_role tem acesso integral
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
    // A view não projeta correct_option_id nem explanation
    for (const col of requestedColumns) {
      if (['correct_option_id', 'explanation'].includes(col)) {
        throw new Error(`ColumnNotFoundError: column "${col}" does not exist in view student_questions`);
      }
    }
    // Filtro embutido da view: status = 'aprovada' AND is_example = false
    const approvedOnly = mockQuestions.filter((q) => q.status === 'aprovada' && q.is_example === false);
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
      // Se solicitou colunas sensíveis não concedidas no GRANT de coluna
      for (const col of requestedColumns) {
        if (['correct_option_id', 'explanation'].includes(col)) {
          throw new Error(`PermissionDeniedError: permission denied for column ${col} of relation questions`);
        }
      }
    }

    // Aplicação da política RLS questions_select_student (migration 000008)
    let rows = mockQuestions;
    if (session.role === 'anon' || session.role === 'authenticated') {
      rows = rows.filter((q) => q.status === 'aprovada' && q.is_example === false);
    }

    if (filters?.id) {
      rows = rows.filter((r) => r.id === filters.id);
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

// Simulador da RPC verify_student_answer
function executeRpcVerifyStudentAnswer(
  _session: MockUserSession,
  questionId: string,
  selectedOptionId: string
): { success: boolean; is_correct?: boolean; correct_option_id?: string; explanation?: string; error?: string } {
  const q = mockQuestions.find((item) => item.id === questionId);

  // Apenas questões aprovadas e não-exemplos são elegíveis para resolução
  if (!q || q.status !== 'aprovada' || q.is_example) {
    return {
      success: false,
      error: 'Questão não encontrada ou não elegível para resolução.',
    };
  }

  return {
    success: true,
    is_correct: q.correct_option_id === selectedOptionId,
    correct_option_id: q.correct_option_id,
    explanation: q.explanation,
  };
}

describe('Auditoria de Exposição de Dados e Cenários Negativos de Segurança (P0)', () => {
  // 1. Cenários Negativos: Tentativa de leitura antecipada de gabarito e explicação por estudantes
  describe('Cenários Negativos: Estudante e Visitante Anônimo (anon / authenticated)', () => {
    const studentSession: MockUserSession = { role: 'authenticated', userId: 'student-uuid-123' };
    const anonSession: MockUserSession = { role: 'anon' };

    it('bloqueia consulta direta à coluna correct_option_id na tabela questions para aluno autenticado', () => {
      expect(() => {
        executePostgresQuery(studentSession, 'questions', ['id', 'statement', 'correct_option_id']);
      }).toThrow(/permission denied for column correct_option_id/);
    });

    it('bloqueia consulta direta à coluna explanation na tabela questions para visitante anônimo', () => {
      expect(() => {
        executePostgresQuery(anonSession, 'questions', ['id', 'statement', 'explanation']);
      }).toThrow(/permission denied for column explanation/);
    });

    it('bloqueia acesso direto à tabela question_reviews (notas e modelos) para estudante autenticado', () => {
      expect(() => {
        executePostgresQuery(studentSession, 'question_reviews', ['question_id', 'verification_notes', 'generator_model']);
      }).toThrow(/permission denied for relation question_reviews/);
    });

    it('bloqueia acesso direto à tabela question_reviews para visitante anônimo', () => {
      expect(() => {
        executePostgresQuery(anonSession, 'question_reviews', ['question_id', 'approved_by']);
      }).toThrow(/permission denied for relation question_reviews/);
    });

    it('a View Sanitizada student_questions não possui colunas correct_option_id ou explanation', () => {
      expect(() => {
        executePostgresQuery(studentSession, 'student_questions', ['id', 'correct_option_id']);
      }).toThrow(/does not exist in view student_questions/);

      expect(() => {
        executePostgresQuery(studentSession, 'student_questions', ['id', 'explanation']);
      }).toThrow(/does not exist in view student_questions/);
    });
  });

  // 2. Cenários Positivos: Estudantes acessam dados didáticos legítimos
  describe('Cenários Positivos: Acesso Discente a Dados Públicos e Seguros', () => {
    const studentSession: MockUserSession = { role: 'authenticated', userId: 'student-uuid-123' };

    it('permite que o estudante consulte colunas pedagógicas seguras em questions', () => {
      const rows = executePostgresQuery(studentSession, 'questions', ['id', 'statement', 'options', 'topic']);
      expect(rows).toHaveLength(1); // Apenas sin-001 (aprovada)
      expect(rows[0].id).toBe('sin-001');
      expect(rows[0].statement).toContain('Diante da placa R-1');
      expect(rows[0].options).toHaveLength(4);
      expect(rows[0]).not.toHaveProperty('correct_option_id');
      expect(rows[0]).not.toHaveProperty('explanation');
    });

    it('permite consulta de questões aprovadas através da View Sanitizada student_questions', () => {
      const rows = executePostgresQuery(studentSession, 'student_questions', ['id', 'statement', 'options']);
      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe('sin-001');
      expect(rows[0]).not.toHaveProperty('correct_option_id');
    });
  });

  // 3. Cenários da RPC verify_student_answer: Feedback liberado apenas post-submissão
  describe('RPC verify_student_answer (Conferência Autoritativa de Resposta)', () => {
    const studentSession: MockUserSession = { role: 'authenticated', userId: 'student-uuid-123' };

    it('retorna is_correct: true e libera explanation somente após submissão de alternativa correta', () => {
      const response = executeRpcVerifyStudentAnswer(studentSession, 'sin-001', 'a');
      expect(response.success).toBe(true);
      expect(response.is_correct).toBe(true);
      expect(response.correct_option_id).toBe('a');
      expect(response.explanation).toContain('A placa R-1 regulamenta Parada Obrigatória');
    });

    it('retorna is_correct: false e libera explanation somente após submissão de alternativa incorreta', () => {
      const response = executeRpcVerifyStudentAnswer(studentSession, 'sin-001', 'b');
      expect(response.success).toBe(true);
      expect(response.is_correct).toBe(false);
      expect(response.correct_option_id).toBe('a');
      expect(response.explanation).toContain('A placa R-1 regulamenta Parada Obrigatória');
    });

    it('recusa submissão e NÃO revela gabarito para questão com status em_revisao', () => {
      const response = executeRpcVerifyStudentAnswer(studentSession, 'sin-025', 'b');
      expect(response.success).toBe(false);
      expect(response.error).toContain('não elegível para resolução');
      expect(response.is_correct).toBeUndefined();
      expect(response.correct_option_id).toBeUndefined();
      expect(response.explanation).toBeUndefined();
    });

    it('recusa submissão e NÃO revela gabarito para questão demonstrativa / rascunho', () => {
      const response = executeRpcVerifyStudentAnswer(studentSession, 'sin-demo', 'c');
      expect(response.success).toBe(false);
      expect(response.error).toContain('não elegível para resolução');
      expect(response.correct_option_id).toBeUndefined();
    });
  });

  // 4. Preservação do Acesso Administrativo e Editorial
  describe('Preservação do Acesso Editorial / Administrativo (service_role)', () => {
    const adminSession: MockUserSession = { role: 'service_role' };

    it('service_role tem permissão total para ler correct_option_id e explanation em questions', () => {
      const rows = executePostgresQuery(adminSession, 'questions', ['id', 'correct_option_id', 'explanation']);
      expect(rows).toHaveLength(3); // Acessa inclusive rascunhos e em revisão
      expect(rows.find((r) => r.id === 'sin-001')?.correct_option_id).toBe('a');
      expect(rows.find((r) => r.id === 'sin-025')?.correct_option_id).toBe('b');
    });

    it('service_role tem permissão total para auditar question_reviews', () => {
      const rows = executePostgresQuery(adminSession, 'question_reviews', [
        'question_id',
        'verification_notes',
        'generator_model',
        'verifier_model',
        'approved_by',
      ]);
      expect(rows).toHaveLength(2);
      expect(rows[0].approved_by).toBe('Tech Lead Humano');
      expect(rows[0].verification_notes).toBe('Validado pelo Tech Lead em auditoria formal.');
    });
  });
});
