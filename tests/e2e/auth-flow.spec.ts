import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação — T003 (Persistência e Autenticação)', () => {
  test('deve navegar pelos links de autenticação do cabeçalho', async ({ page }) => {
    await page.goto('/');

    // Clica em 'Entrar' no cabeçalho
    await page.getByRole('link', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /entrar na sua conta/i })).toBeVisible();

    // Navega para 'Cadastre-se gratuitamente'
    await page.getByRole('link', { name: /cadastre-se gratuitamente/i }).click();
    await expect(page).toHaveURL(/\/cadastro/);
    await expect(page.getByRole('heading', { name: /criar conta de estudante/i })).toBeVisible();
  });

  test('deve exibir validação acessível ao tentar submeter credenciais inválidas na tela de login', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/e-mail/i);
    const passwordInput = page.getByLabel(/senha de acesso/i);
    const submitBtn = page.getByRole('button', { name: /entrar/i });

    await emailInput.fill('estudante.inexistente@aprovacnh.com.br');
    await passwordInput.fill('senhaerrada123');
    await submitBtn.click();

    // Aguarda o alerta acessível
    const alert = page.locator('#login-error-alert');
    await expect(alert).toBeVisible({ timeout: 10000 });
    await expect(alert).toContainText(/credenciais inválidas|erro ao autenticar/i);
  });

  test('deve validar formulário de cadastro com opções de UF e categoria', async ({ page }) => {
    await page.goto('/cadastro');

    await expect(page.getByLabel(/nome completo/i)).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha de acesso/i)).toBeVisible();

    const ufSelect = page.getByLabel(/estado \(uf\)/i);
    await expect(ufSelect).toBeVisible();
    // Confirma que não possui 'BR' conforme D014
    const options = await ufSelect.locator('option').allTextContents();
    expect(options).not.toContain('BR');
    expect(options).toContain('MG');
    expect(options).toContain('SP');

    const catSelect = page.getByLabel(/categoria cnh/i);
    await expect(catSelect).toBeVisible();
    await expect(catSelect.locator('option')).toContainText(['B — Carro', 'A — Moto']);
  });
});
