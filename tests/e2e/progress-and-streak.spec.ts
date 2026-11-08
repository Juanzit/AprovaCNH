import { test, expect } from '@playwright/test';

test.describe('Progresso, XP e Gamificação — T004 e T005.1 (Refinamento UX e Perfil MG)', () => {
  test('deve exibir o cabeçalho compacto com UF padrão MG, streak semanal, trilha vertical e card SRS em telas de 360px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');

    // 1. Cabeçalho Compacto do Estudante com UF padrão MG, Streak Semanal (S T Q Q S S D) e Meta Diária
    const ufBadge = page.getByTestId('student-uf-badge');
    await expect(ufBadge).toBeVisible();
    await expect(ufBadge).toContainText('MG • DETRAN-MG / Nacional');

    await expect(page.getByTestId('student-category-badge')).toBeVisible();
    await expect(page.getByTestId('student-streak-badge')).toBeVisible();
    await expect(page.getByTestId('student-xp-badge')).toBeVisible();
    await expect(page.getByTestId('weekly-streak-tracker')).toBeVisible();
    await expect(page.getByTestId('daily-goal-indicator')).toBeVisible();

    // 2. Cartão "Sua próxima atividade" com CTA único e Trilha Vertical
    await expect(page.getByRole('heading', { name: /sinalização de trânsito/i })).toBeVisible();
    await expect(page.getByTestId('next-activity-card')).toBeVisible();
    const primaryCta = page.getByTestId('primary-unit-cta');
    await expect(primaryCta).toBeVisible();
    await expect(primaryCta).toHaveText(
      /Começar primeira sessão|Continuar estudando|Próxima sessão|Revisar unidade/i
    );

    await expect(page.getByTestId('session-card-1')).toBeVisible();
    await expect(page.getByTestId('session-card-2')).toBeVisible();
    await expect(page.getByTestId('session-card-3')).toBeVisible();
    await expect(page.getByTestId('session-card-4')).toBeVisible();

    // 3. Card Contextual do Algoritmo SRS ("Sua revisão de hoje")
    await expect(page.getByTestId('daily-review-card')).toBeVisible();
    await expect(page.getByRole('heading', { name: /sua revisão de hoje/i })).toBeVisible();
  });

  test('deve abrir o modal de perfil no modo visitante e salvar alterações sem erro de autenticação', async ({
    page,
  }) => {
    await page.goto('/');

    const editBtn = page.getByRole('button', { name: /editar dados do perfil/i });
    await editBtn.click();

    // Modal acessível
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(page.getByRole('heading', { name: /ajustar perfil de estudo/i })).toBeVisible();

    // Modifica nome e categoria e salva no Modo Visitante
    const nameInput = page.getByLabel(/nome de estudante/i);
    await nameInput.fill('Aluno Teste DETRAN-MG');

    const catSelect = page.getByLabel(/categoria cnh/i);
    await catSelect.selectOption('AB');

    const saveBtn = page.getByRole('button', { name: /salvar alterações/i });
    await saveBtn.click();
    await expect(modal).not.toBeVisible();

    await expect(page.getByRole('heading', { name: /Aluno Teste DETRAN-MG/i })).toBeVisible();
    await expect(page.getByTestId('student-category-badge')).toContainText('Cat. AB');
  });

  test('deve responder à Sessão 1 e exibir resumo gamificado com avanço percentual e persistência', async ({
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

      // Aguarda feedback estruturado em 3 blocos de micro-aula e clica em continuar
      await expect(page.getByRole('status')).toBeVisible();
      await expect(page.getByTestId('explanation-block')).toBeVisible();
      await expect(page.getByTestId('rule-summary-block')).toBeVisible();
      await expect(page.getByTestId('legal-source-block')).toBeVisible();

      const nextBtn =
        i === 5
          ? page.getByRole('button', { name: /finalizar lição/i })
          : page.getByRole('button', { name: /continuar/i });
      await nextBtn.click();
    }

    // Tela de Resumo Gamificada e confirmação da Server Action (streak badge)
    await expect(page.getByRole('heading', { name: /lição concluída/i })).toBeVisible();
    await expect(page.getByTestId('score-text')).toBeVisible();
    await expect(page.getByTestId('total-xp')).toBeVisible();
    await expect(page.getByTestId('unit-progress-summary')).toContainText('25%');
    await expect(page.getByTestId('next-session-cta')).toContainText('Avançar para Sessão 2');
    await expect(page.getByTestId('summary-streak-badge')).toBeVisible({ timeout: 10000 });

    // Ação de retorno à trilha
    const backBtn = page.getByRole('link', { name: /voltar à trilha/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page).toHaveURL('/', { timeout: 10000 });
  });
});
