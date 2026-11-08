import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação — T003 e T005.1 (Segurança de Senha e Tradução)', () => {
  test('deve navegar pelos links de autenticação do cabeçalho e exibir rodapé sem texto provisório', async ({
    page,
  }) => {
    await page.goto('/');

    const footer = page.locator('footer');
    await expect(footer).toContainText(
      'AprovaCNH — Plataforma independente de estudo guiado. Sem vínculo com DETRAN, CONTRAN ou SENATRAN.'
    );
    await expect(footer).not.toContainText('Nome provisório');

    // Clica em 'Entrar' no cabeçalho
    await page.getByRole('link', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /entrar na sua conta/i })).toBeVisible();
    await expect(page.getByTestId('forgot-password-button')).toBeVisible();

    // Navega para 'Cadastre-se gratuitamente'
    await page.getByRole('link', { name: /cadastre-se gratuitamente/i }).click();
    await expect(page).toHaveURL(/\/cadastro/);
    await expect(page.getByRole('heading', { name: /criar conta de estudante/i })).toBeVisible();
  });

  test('deve limpar a senha após submissão e traduzir erro de credenciais inválidas em português', async ({
    page,
  }) => {
    await page.route('**/auth/v1/token*', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Invalid login credentials',
          message: 'Invalid login credentials',
        }),
      });
    });

    await page.goto('/login');

    const emailInput = page.getByLabel(/e-mail/i);
    const passwordInput = page.getByLabel(/senha de acesso/i);
    const submitBtn = page.getByRole('button', { name: /entrar/i });

    await expect(passwordInput).toHaveAttribute('type', 'password');
    await emailInput.fill('estudante.inexistente@aprovacnh.com.br');
    await passwordInput.fill('senhaerrada123');
    await submitBtn.click();

    // Proteção estrita: campo de senha esvaziado imediatamente após envio
    await expect(passwordInput).toHaveValue('');

    // Aguarda o alerta traduzido para português
    const alert = page.locator('#login-error-alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/E-mail ou senha incorretos/i);
  });

  test('deve validar formulário de cadastro e exibir estado independente Cadastro realizado!', async ({
    page,
  }) => {
    await page.route('**/auth/v1/signup*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-mock-123',
          email: 'novo.estudante@aprovacnh.com.br',
          session: null,
        }),
      });
    });

    await page.goto('/cadastro');

    await expect(page.getByLabel(/nome completo/i)).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha de acesso/i)).toBeVisible();

    const ufSelect = page.getByLabel(/estado \(uf\)/i);
    await expect(ufSelect).toBeVisible();
    const options = await ufSelect.locator('option').allTextContents();
    expect(options).not.toContain('BR');
    expect(options).toContain('MG');
    expect(options).toContain('SP');

    const catSelect = page.getByLabel(/categoria cnh/i);
    await expect(catSelect).toBeVisible();
    await expect(catSelect.locator('option')).toContainText(['B — Carro', 'A — Moto']);

    // Submete o cadastro e valida o estado independente de confirmação
    await page.getByLabel(/nome completo/i).fill('Estudante Teste');
    await page.getByLabel(/e-mail/i).fill('novo.estudante@aprovacnh.com.br');
    await page.getByLabel(/senha de acesso/i).fill('senhaSegura123');
    await page.getByRole('button', { name: /criar minha conta/i }).click();

    await expect(page.getByTestId('signup-confirmation-state')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Cadastro realizado!/i })).toBeVisible();
    await expect(page.getByTestId('resend-signup-email-btn')).toBeVisible();
    await expect(page.getByRole('link', { name: /Voltar para entrar/i })).toBeVisible();
  });
});
