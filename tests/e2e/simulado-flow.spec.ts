import { test, expect } from '@playwright/test';

test.describe('Simulado Multidisciplinar Proporcional — Fase 6.1 / BNQ v1.0', () => {
  test('exibe as regras do simulado multidisciplinar (30 questões, 60 min, meta 20) no lobby', async ({ page }) => {
    await page.goto('/simulado');
    await expect(page.getByRole('heading', { name: /Simulado Multidisciplinar Proporcional/i })).toBeVisible();
    await expect(page.getByTestId('rule-total-questions')).toContainText('30 questões');
    await expect(page.getByTestId('rule-duration')).toContainText('60 minutos');
    await expect(page.getByTestId('rule-passing-score')).toContainText('20 acertos');
    await expect(page.getByTestId('start-simulado-cta')).toBeVisible();
  });

  test('inicia, navega, marca questão, entrega e abre o gabarito comentado', async ({ page }) => {
    await page.goto('/simulado/prova');
    await expect(page.getByTestId('simulado-timer')).toBeVisible();
    await expect(page.getByText('Questão 1 de 30')).toBeVisible();
    const firstRadio = page.locator('input[type="radio"]').first();
    await firstRadio.check();
    const markBtn = page.getByTestId('mark-review-btn');
    await markBtn.click();
    await expect(markBtn).toHaveAttribute('aria-pressed', 'true');
    await page.getByTestId('toggle-nav-drawer-btn').click();
    await expect(page.getByTestId('simulado-nav-drawer')).toBeVisible();
    await expect(page.getByTestId('nav-flag-1')).toBeVisible();
    await page.getByTestId('nav-question-5').click();
    await expect(page.getByText('Questão 5 de 30')).toBeVisible();
    await page.getByTestId('open-finish-modal-btn').click();
    await expect(page.getByTestId('unanswered-warning')).toContainText('29 questão(ões) em branco');
    await page.getByTestId('confirm-finish-btn').click();
    await expect(page).toHaveURL(/\/simulado\/resultado\//, { timeout: 15000 });
    await expect(page.getByTestId('simulado-result-summary')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Gabarito Comentado da Plataforma/i })).toBeVisible();
    await expect(page.getByTestId('simulado-approval-badge')).toBeVisible();
    await page.getByTestId('filter-errors-btn').click();
    await expect(page.getByTestId('filter-errors-btn')).toHaveAttribute('aria-pressed', 'true');
  });

  test('permite escolher tempo estendido de 120 minutos (Art. 33, § 2º)', async ({ page }) => {
    await page.goto('/simulado');
    const pcdLabel = page.locator('label[for="duration-opt-120"]');
    await expect(pcdLabel).toContainText('TEA');
    await expect(pcdLabel).toContainText('Art. 33, § 2º');
    await page.locator('input#duration-opt-120').check();
    const cta = page.getByTestId('start-simulado-cta');
    await expect(cta).toContainText('120 min');
    await cta.click();
    await expect(page).toHaveURL(/\/simulado\/prova\?tempo=120/);
    await expect(page.getByTestId('simulado-timer')).toContainText(/120:00|119:\d{2}/);
  });

  test('preserva respostas e tempo ao recarregar durante o simulado', async ({ page }) => {
    await page.goto('/simulado/prova');
    const firstRadio = page.locator('input[type="radio"]').first();
    await firstRadio.check();
    await expect(firstRadio).toBeChecked();
    await page.getByTestId('mark-review-btn').click();
    await expect(page.getByTestId('mark-review-btn')).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.locator('input[type="radio"]').first()).toBeChecked();
    await expect(page.getByTestId('mark-review-btn')).toHaveAttribute('aria-pressed', 'true');
  });
});
