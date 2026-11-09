import { describe, it, expect, vi } from 'vitest';
import {
  mapAndValidateDatabaseQuestion,
  getFallbackApprovedQuestions,
  getApprovedQuestionsByTopic,
} from '@/features/lesson/server/questionRepository';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

describe('questionRepository — validação, fallback e gate de publicação', () => {
  const validDbRow = {
    id: 'bnq-db-001',
    source_question_id: 'p1-m1-q1',
    difficulty: 'facil',
    sign_code: 'A-33a',
    sign_asset_codes: [],
    version: 1,
    statement: 'Ao ver a placa de área escolar, qual conduta deve adotar?',
    options: [
      { id: 'a', text: 'Reduzir a velocidade e redobrar a atenção.' },
      { id: 'b', text: 'Acelerar para passar rapidamente.' },
      { id: 'c', text: 'Buzinar para avisar os pedestres.' },
      { id: 'd', text: 'Manter a velocidade sem observar o entorno.' },
    ],
    correct_option_id: 'a',
    explanation: 'A placa alerta para área escolar e exige prudência.',
    topic: 'Sinalização de Trânsito',
    subtopic: 'Módulo 1: Placas, Cores e Caminhos',
    ufs: [],
    categories: [],
    status: 'aprovada',
    is_example: false,
    question_sources: [{
      kind: 'official',
      document: 'Banco Nacional de Questões v1.0 — SENATRAN',
      provision: 'Parte 1, Módulo 1, questão p1-m1-q1',
      url: 'https://eadcnh.bsa.estaleiro.serpro.gov.br/cursos/673a6cc7e3bb091c6db844aa/material-complementar',
      checked_at: '2026-11-09T14:00:00Z',
      effective_from: '2025-12-01',
      effective_until: null,
      source_version: 'BNQ v1.0',
      license_note: 'Origem oficial do material-fonte; autorização de lote registrada separadamente.',
      verification_status: 'verified',
    }],
    question_reviews: [{
      generator_model: null,
      verifier_model: null,
      verification_notes: 'Autorização de lote aprovada pelo responsável do produto.',
      approved_by: 'Responsável pelo Produto — autorização expressa de lote (2026-11-09)',
      approved_at: '2026-11-09T14:00:00Z',
      approval_method: 'authorized_official_batch',
      approval_batch_id: 'SENATRAN-BNQ-v1.0-2026-11-09',
    }],
  };

  it('mapeia metadados BNQ, código da placa e aprovação de lote sem inventar revisão por IA', () => {
    const question = mapAndValidateDatabaseQuestion(validDbRow);
    expect(question.id).toBe('bnq-db-001');
    expect(question.sourceQuestionId).toBe('p1-m1-q1');
    expect(question.difficulty).toBe('facil');
    expect(question.signCode).toBe('A-33a');
    expect(question.signAssetCodes).toEqual([]);
    expect(question.review?.approvalMethod).toBe('authorized_official_batch');
    expect(question.review?.approvalBatchId).toBe('SENATRAN-BNQ-v1.0-2026-11-09');
    expect(question.review?.generatorModel).toBeNull();
    expect(question.review?.verifierModel).toBeNull();
  });

  it('rejeita uma linha com menos de quatro alternativas', () => {
    const invalid = { ...validDbRow, options: validDbRow.options.slice(0, 2) };
    expect(() => mapAndValidateDatabaseQuestion(invalid)).toThrow();
  });

  it('rejeita uma UF BR, preservando a convenção D014', () => {
    expect(() => mapAndValidateDatabaseQuestion({ ...validDbRow, ufs: ['BR'] })).toThrow();
  });

  it('fallback local contém o BNQ completo e somente questões aprovadas não demonstrativas', () => {
    const fallback = getFallbackApprovedQuestions();
    expect(fallback).toHaveLength(1509);
    expect(fallback.filter((question) => question.id.startsWith('bnq-p'))).toHaveLength(1489);
    expect(fallback.every((question) => question.status === 'aprovada' && !question.isExample)).toBe(true);
    expect(fallback.some((question) => question.status === 'em_revisao')).toBe(false);
  });

  it('fallback respeita topic como disciplina clássica', () => {
    const defensive = getFallbackApprovedQuestions('Direção Defensiva e Circulação Segura');
    expect(defensive).toHaveLength(469);
    expect(defensive.every((question) => question.topic === 'Direção Defensiva e Circulação Segura')).toBe(true);
  });

  it('usa fallback filtrado por topic quando Supabase está indisponível', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockRejectedValueOnce(new Error('offline'));

    const questions = await getApprovedQuestionsByTopic('Primeiros Socorros e Sinistros');
    expect(questions).toHaveLength(44);
    expect(questions.every((question) => question.status === 'aprovada')).toBe(true);
    expect(questions.every((question) => question.topic === 'Primeiros Socorros e Sinistros')).toBe(true);
  });
});
