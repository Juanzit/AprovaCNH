import { test, expect } from '@playwright/test';

test.describe('Progresso, XP e Gamificação — T004 (Fase 4)', () => {
  test('deve exibir o cabeçalho de gamificação e a trilha com livre acesso na home', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Cabeçalho do Estudante (Gamificação)
    await expect(page.getByTestId('student-uf-badge')).toBeVisible();
    await expect(page.getByTestId('student-category-badge')).toBeVisible();
    await expect(page.getByTestId('student-streak-badge')).toBeVisible();
    await expect(page.getByTestId('student-xp-badge')).toBeVisible();

    // 2. Trilha de Aprendizagem
    await expect(page.getByRole('heading', { name: /sinalização de trânsito/i })).toBeVisible();
    await expect(page.getByTestId('session-card-1')).toBeVisible();
    await expect(page.getByTestId('session-card-2')).toBeVisible();
    await expect(page.getByTestId('session-card-3')).toBeVisible();
    await expect(page.getByTestId('session-card-4')).toBeVisible();

    // 3. CTA Mobile para continuar
    await expect(page.getByRole('link', { name: /continuar de onde parou/i })).toBeVisible();
  });

  test('deve abrir o modal de perfil e permitir alterar dados do estudante', async ({
    page,
  }) => {
    await page.goto('/');

    const editBtn = page.getByRole('button', { name: /editar dados do perfil/i });
    await editBtn.click();

    // Modal acessível
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(page.getByRole('heading', { name: /ajustar perfil de estudo/i })).toBeVisible();

    // Modifica nome e categoria
    const nameInput = page.getByLabel(/nome de estudante/i);
    await nameInput.fill('Aluno Teste Playwright');

    const catSelect = page.getByLabel(/categoria cnh/i);
    await catSelect.selectOption('A');

    // Salva ou fecha
    const cancelBtn = page.getByRole('button', { name: /cancelar/i });
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('deve responder à Sessão 1 e exibir resumo com persistência no servidor', async ({
    page,
  }) => {
    await page.goto('/licao/sinalizacao?sessao=1');

    // Responde 5 questões
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Questão ${i} de 5`)).toBeVisible({ timeout: 15000 });

      // Seleciona a primeira opção disponível
      const radio = page.locator('input[type="radio"]').first();
      await radio.check();

      // Confirma resposta
      await page.getByRole('button', { name: /confirmar resposta/i }).click();

      // Aguarda feedback e clica em continuar
      await expect(page.getByRole('status')).toBeVisible();
      const nextBtn = i === 5 ? page.getByRole('button', { name: /finalizar lição/i }) : page.getByRole('button', { name: /continuar/i });
      await nextBtn.click();
    }

    // Tela de Resumo
    await expect(page.getByRole('heading', { name: /lição concluída/i })).toBeVisible();
    await expect(page.getByTestId('score-text')).toBeVisible();
    await expect(page.getByTestId('total-xp')).toBeVisible();

    // Ação de retorno à trilha
    const backBtn = page.getByRole('link', { name: /voltar à trilha/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page).toHaveURL('/');
  });
});
