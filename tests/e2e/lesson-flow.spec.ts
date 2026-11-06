import { test, expect } from '@playwright/test';

test.describe('Fluxo da Lição de Sinalização — T002 (Piloto de Conteúdo Aprovado)', () => {
  test('deve navegar da home para a lição de sinalização oficial', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /Lição de Sinalização de Trânsito/i })
    ).toBeVisible();

    const startButton = page.getByRole('link', { name: /Iniciar lição de sinalização/i });
    await expect(startButton).toBeVisible();
    await startButton.click();

    await expect(page).toHaveURL(/\/licao\/sinalizacao/);
    await expect(page.getByText('Questão 1 de 5')).toBeVisible();
  });

  test('deve responder as 5 questões da Sessão 1, exibir feedback com fundamentação oficial e concluir com 70 XP', async ({
    page,
  }) => {
    await page.goto('/licao/sinalizacao');

    // Questão 1 (sin-001: Prevalência do Agente de Trânsito)
    await expect(page.getByText('Questão 1 de 5')).toBeVisible();
    await expect(page.getByText(/Questão Oficial Aprovada/i)).toBeVisible();

    // Selecionar alternativa 'b' (gabarito da Q1)
    const radioQ1 = page.getByLabel(/Obedecer à ordem de parada do agente de trânsito/i);
    await radioQ1.check();
    await expect(radioQ1).toBeChecked();

    // Confirmar resposta
    const confirmButton = page.getByRole('button', { name: /Confirmar resposta/i });
    await confirmButton.click();

    // Feedback imediato
    const feedbackStatus = page.getByRole('status');
    await expect(feedbackStatus).toBeVisible();
    await expect(page.getByText('Resposta correta!')).toBeVisible();
    await expect(page.getByTestId('source-document')).toContainText('Lei Federal nº 9.503/1997');
    await expect(page.getByTestId('source-provision')).toContainText('Art. 89, I');

    // Bloqueio de reenvio / alteração
    await expect(radioQ1).toBeDisabled();

    // Avançar para Q2
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Questão 2 (sin-002: Semáforo prevalece sobre placa R-2)
    await expect(page.getByText('Questão 2 de 5')).toBeVisible();
    const radioQ2 = page.getByLabel(/A indicação do semáforo na fase verde/i);
    await radioQ2.check();
    await page.getByRole('button', { name: /Confirmar resposta/i }).click();
    await expect(page.getByText('Resposta correta!')).toBeVisible();
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Questão 3 (sin-003: Vedação de publicidade em suporte de sinalização)
    await expect(page.getByText('Questão 3 de 5')).toBeVisible();
    const radioQ3 = page.getByLabel(/É expressamente proibida pelo CTB/i);
    await radioQ3.check();
    await page.getByRole('button', { name: /Confirmar resposta/i }).click();
    await expect(page.getByText('Resposta correta!')).toBeVisible();
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Questão 4 (sin-004: Sinalização insuficiente isenta penalidade)
    await expect(page.getByText('Questão 4 de 5')).toBeVisible();
    const radioQ4 = page.getByLabel(/Não serão aplicadas sanções por inobservância/i);
    await radioQ4.check();
    await page.getByRole('button', { name: /Confirmar resposta/i }).click();
    await expect(page.getByText('Resposta correta!')).toBeVisible();
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Questão 5 (sin-005: Reabertura de via recapeada exige sinalização prévia)
    await expect(page.getByText('Questão 5 de 5')).toBeVisible();
    const radioQ5 = page.getByLabel(/Contraria o CTB, pois nenhuma via pavimentada pode ser entregue/i);
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
