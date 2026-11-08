import { test, expect } from '@playwright/test';

test.describe('Fluxo da Lição de Sinalização — T002 (Piloto MBFT Aprovado)', () => {
  test('deve navegar da home para a lição de sinalização oficial', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(
      page.getByRole('heading', { name: /Sinalização de Trânsito/i })
    ).toBeVisible();

    const startButton = page.getByRole('link', { name: /Continuar de onde parou/i });
    await expect(startButton).toBeVisible();
    await startButton.click();

    await expect(page).toHaveURL(/\/licao\/sinalizacao/, { timeout: 15000 });
    await expect(page.getByText('Questão 1 de 5')).toBeVisible({ timeout: 15000 });
  });

  test('deve responder as 5 questões da Sessão 1, exibir feedback com fundamentação oficial e concluir com 70 XP', async ({
    page,
  }) => {
    await page.goto('/licao/sinalizacao');

    // Questão 1 (sin-001: Prevalência do Agente de Trânsito - Art. 195)
    await expect(page.getByText('Questão 1 de 5')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Questão Oficial Aprovada/i)).toBeVisible();

    // Selecionar alternativa 'b' (gabarito da Q1)
    const radioQ1 = page.getByLabel(/As ordens do agente de trânsito têm prevalência sobre as normas de circulação/i);
    await radioQ1.check();
    await expect(radioQ1).toBeChecked();

    // Confirmar resposta
    const confirmButton = page.getByRole('button', { name: /Confirmar resposta/i });
    await confirmButton.click();

    // Feedback imediato
    const feedbackStatus = page.getByRole('status');
    await expect(feedbackStatus).toBeVisible();
    await expect(page.getByText('Resposta correta!')).toBeVisible();
    await expect(page.getByTestId('source-document')).toContainText('Resolução CONTRAN nº 985/2022');
    await expect(page.getByTestId('source-provision')).toContainText('Art. 195 (Ficha MBFT 583-50');

    // Bloqueio de reenvio / alteração
    await expect(radioQ1).toBeDisabled();

    // Avançar para Q2
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Questão 2 (sin-002: Três Pressupostos de Caracterização da Infração do Art. 195)
    await expect(page.getByText('Questão 2 de 5')).toBeVisible();
    const radioQ2 = page.getByLabel(/Ordem relativa à normatização do trânsito em geral; ordem emanada da autoridade ou do agente/i);
    await radioQ2.check();
    await page.getByRole('button', { name: /Confirmar resposta/i }).click();
    await expect(page.getByText('Resposta correta!')).toBeVisible();
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Questão 3 (sin-003: Formas de emissão da ordem e uso conjunto de apito)
    await expect(page.getByText('Questão 3 de 5')).toBeVisible();
    const radioQ3 = page.getByLabel(/A ordem pode ser verbal ou escrita, bem como através de gestos ou sinais sonoros, sendo que os sinais sonoros de apito somente devem ser utilizados em conjunto com os gestos dos agentes/i);
    await radioQ3.check();
    await page.getByRole('button', { name: /Confirmar resposta/i }).click();
    await expect(page.getByText('Resposta correta!')).toBeVisible();
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Questão 4 (sin-004: Autuação por desobediência a restrição médica na CNH)
    await expect(page.getByText('Questão 4 de 5')).toBeVisible();
    const radioQ4 = page.getByLabel(/Condutor que desobedecer restrição imposta pela autoridade de trânsito, com base no exame de saúde/i);
    await radioQ4.check();
    await page.getByRole('button', { name: /Confirmar resposta/i }).click();
    await expect(page.getByText('Resposta correta!')).toBeVisible();
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Questão 5 (sin-005: Conflito de enquadramento ordem de parada por gesto)
    await expect(page.getByText('Questão 5 de 5')).toBeVisible();
    const radioQ5 = page.getByLabel(/Não autuar pelo Art. 195, devendo utilizar o enquadramento específico: 605-02, Art. 208 do CTB/i);
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
