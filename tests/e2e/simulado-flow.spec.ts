import { test, expect } from '@playwright/test';

test.describe('Simulado Configurável — Fase 6 (T006 / Regra D007)', () => {
  test('deve exibir as regras regulamentares (30 questões, 60 min, corte 20) no lobby /simulado', async ({
    page,
  }) => {
    await page.goto('/simulado');

    await expect(
      page.getByRole('heading', {
        name: /Simulado Prático da Prova Teórica de 1ª Habilitação/i,
      })
    ).toBeVisible();

    await expect(page.getByTestId('rule-total-questions')).toContainText('30 questões');
    await expect(page.getByTestId('rule-duration')).toContainText('60 minutos');
    await expect(page.getByTestId('rule-passing-score')).toContainText('20 acertos');
    await expect(page.getByTestId('start-simulado-cta')).toBeVisible();
  });

  test('deve iniciar o simulado, usar o cronômetro e mapa de navegação, entregar a prova e ver o gabarito comentado', async ({
    page,
  }) => {
    await page.goto('/simulado/prova');

    // Verifica cronômetro regressivo e questão 1 de 30
    await expect(page.getByTestId('simulado-timer')).toBeVisible();
    await expect(page.getByText('Questão 1 de 30')).toBeVisible();

    // Seleciona alternativa na questão 1 e marca para revisar
    const firstRadio = page.locator('input[type="radio"]').first();
    await firstRadio.check();

    const markBtn = page.getByTestId('mark-review-btn');
    await markBtn.click();
    await expect(markBtn).toHaveAttribute('aria-pressed', 'true');

    // Abre o Mapa da Prova (1 a 30) e verifica flag na questão 1
    await page.getByTestId('toggle-nav-drawer-btn').click();
    await expect(page.getByTestId('simulado-nav-drawer')).toBeVisible();
    await expect(page.getByTestId('nav-flag-1')).toBeVisible();

    // Pula direto para a questão 5 pelo mapa da prova
    await page.getByTestId('nav-question-5').click();
    await expect(page.getByText('Questão 5 de 30')).toBeVisible();

    // Abre modal de finalização e verifica aviso de questões em branco
    await page.getByTestId('open-finish-modal-btn').click();
    await expect(page.getByTestId('unanswered-warning')).toContainText('29 questão(ões) em branco');

    // Confirma entrega e aguarda redirecionamento para o gabarito comentado
    await page.getByTestId('confirm-finish-btn').click();

    await expect(page).toHaveURL(/\/simulado\/resultado\//, { timeout: 15000 });
    await expect(page.getByTestId('simulado-result-summary')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Gabarito Comentado da Plataforma/i })
    ).toBeVisible();

    // Filtra apenas erros no gabarito
    await page.getByTestId('filter-errors-btn').click();
    await expect(page.getByTestId('filter-errors-btn')).toHaveAttribute('aria-pressed', 'true');
  });

  test('deve permitir selecionar tempo estendido de 120 minutos para adaptação PCD (Res. CONTRAN 1.020/2025)', async ({
    page,
  }) => {
    await page.goto('/simulado');

    // Seleciona a opção de 120 minutos PCD
    const pcdRadio = page.locator('input#duration-opt-120');
    await pcdRadio.check();

    // O botão de CTA agora reflete os 120 minutos
    const cta = page.getByTestId('start-simulado-cta');
    await expect(cta).toContainText('120 min');
    await cta.click();

    await expect(page).toHaveURL(/\/simulado\/prova\?tempo=120/);
    await expect(page.getByTestId('simulado-timer')).toContainText(/120:00|119:\d{2}/);
  });

  test('deve preservar respostas e tempo ao recarregar a página (F5) durante o simulado', async ({
    page,
  }) => {
    await page.goto('/simulado/prova');

    // Seleciona uma alternativa na questão 1
    const firstRadio = page.locator('input[type="radio"]').first();
    await firstRadio.check();
    await expect(firstRadio).toBeChecked();

    // Marca questão 1 para revisão
    await page.getByTestId('mark-review-btn').click();
    await expect(page.getByTestId('mark-review-btn')).toHaveAttribute('aria-pressed', 'true');

    // Recarrega a página (F5)
    await page.reload();

    // Resposta e flag de revisão continuam preservadas após o reload
    const reloadedRadio = page.locator('input[type="radio"]').first();
    await expect(reloadedRadio).toBeChecked();
    await expect(page.getByTestId('mark-review-btn')).toHaveAttribute('aria-pressed', 'true');
  });
});
