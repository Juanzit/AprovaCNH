import { test, expect } from '@playwright/test';

test.describe('Fluxo da Lição de Sinalização — Estilo DETRAN-MG / SENATRAN (v2)', () => {
  test('deve navegar da home para a lição de sinalização oficial', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(
      page.getByRole('heading', { name: /Sinalização de Trânsito/i })
    ).toBeVisible();

    const startButton = page.getByTestId('primary-unit-cta');
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveText(
      /Começar primeira sessão|Continuar estudando|Próxima sessão|Revisar unidade/i
    );
    await startButton.click();

    await expect(page).toHaveURL(/\/licao\/sinalizacao/, { timeout: 15000 });
    await expect(page.getByText('Questão 1 de 5')).toBeVisible({ timeout: 15000 });
  });

  test('deve responder as 5 questões da Sessão 1 (DETRAN-MG / SENATRAN), exibir micro-aula e concluir com 70 XP', async ({
    page,
  }) => {
    await page.goto('/licao/sinalizacao');

    // Questão 1 (sin-001: Hierarquia da Sinalização - Art. 89, I do CTB)
    await expect(page.getByText('Questão 1 de 5')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Questão baseada no MBFT — Legislação Vigente/i)).toBeVisible();

    const radioQ1 = page.getByLabel(
      /Parar o veículo, pois as ordens do agente de trânsito têm prevalência sobre as normas de circulação/i
    );
    await radioQ1.check();
    await expect(radioQ1).toBeChecked();

    const confirmButton = page.getByRole('button', { name: /Confirmar resposta/i });
    await confirmButton.click();

    // Feedback imediato em formato de micro-aula (3 blocos)
    const feedbackStatus = page.getByRole('status');
    await expect(feedbackStatus).toBeVisible();
    await expect(page.getByText('Resposta correta!')).toBeVisible();
    await expect(page.getByTestId('explanation-block')).toBeVisible();
    await expect(page.getByTestId('rule-summary-block')).toBeVisible();
    await expect(page.getByTestId('legal-source-block')).toBeVisible();
    await expect(page.getByTestId('source-document')).toContainText('Código de Trânsito Brasileiro');
    await expect(page.getByTestId('source-provision')).toContainText('CTB Arts. 89');

    await expect(radioQ1).toBeDisabled();
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Questão 2 (sin-002: Sinais Sonoros de Apito — 2 silvos breves = Pare)
    await expect(page.getByText('Questão 2 de 5')).toBeVisible();
    const radioQ2 = page.getByLabel(
      /Pare — o condutor deve imobilizar o veículo imediatamente com segurança/i
    );
    await radioQ2.check();
    await page.getByRole('button', { name: /Confirmar resposta/i }).click();
    await expect(page.getByText('Resposta correta!')).toBeVisible();
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Questão 3 (sin-003: Sinais Sonoros de Apito — 1 silvo breve = Siga / 1 longo = Diminua a marcha)
    await expect(page.getByText('Questão 3 de 5')).toBeVisible();
    const radioQ3 = page.getByLabel(
      /Um silvo breve significa 'Siga' e um silvo longo significa 'Diminua a marcha'/i
    );
    await radioQ3.check();
    await page.getByRole('button', { name: /Confirmar resposta/i }).click();
    await expect(page.getByText('Resposta correta!')).toBeVisible();
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Questão 4 (sin-004: Gesto do Agente — Braço levantado verticalmente)
    await expect(page.getByText('Questão 4 de 5')).toBeVisible();
    const radioQ4 = page.getByLabel(
      /Ordem de parada obrigatória para todos os veículos que se aproximam/i
    );
    await radioQ4.check();
    await page.getByRole('button', { name: /Confirmar resposta/i }).click();
    await expect(page.getByText('Resposta correta!')).toBeVisible();
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Questão 5 (sin-005: Natureza da Infração do Art. 195 — Grave, 5 pontos)
    await expect(page.getByText('Questão 5 de 5')).toBeVisible();
    const radioQ5 = page.getByLabel(
      /Infração grave \(5 pontos\), sujeita à penalidade de multa/i
    );
    await radioQ5.check();
    await page.getByRole('button', { name: /Confirmar resposta/i }).click();
    await expect(page.getByText('Resposta correta!')).toBeVisible();

    // Botão final da última questão
    const finishButton = page.getByRole('button', { name: /Finalizar lição/i });
    await expect(finishButton).toBeVisible();
    await finishButton.click();

    // Tela de conclusão e validação do XP
    await expect(page.getByRole('heading', { name: /Lição concluída!/i })).toBeVisible();
    await expect(page.getByTestId('score-text')).toHaveText('5 de 5');
    await expect(page.getByTestId('total-xp')).toHaveText('70 XP');

    // Botão de reiniciar
    const restartButton = page.getByRole('button', { name: /Repetir lição/i });
    await expect(restartButton).toBeVisible();
    await restartButton.click();

    // Volta para Q1
    await expect(page.getByText('Questão 1 de 5')).toBeVisible();
  });
});
