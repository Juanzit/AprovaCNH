import { test, expect } from '@playwright/test';

test.describe('Revisão Espaçada e Domínio — T005 (Fase 5)', () => {
  test('deve navegar da home para o centro de revisão através do botão de atalho', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const reviewLink = page.getByRole('link', { name: /Centro de Revisão/i });
    await expect(reviewLink).toBeVisible();
    await reviewLink.click();

    await expect(page).toHaveURL(/\/revisao/);
    await expect(
      page.getByRole('heading', { name: /Diagnóstico de Domínio por Dispositivo Legal/i })
    ).toBeVisible();
  });

  test('deve exibir os 4 medidores de domínio por dispositivo legal do MBFT no painel /revisao', async ({
    page,
  }) => {
    await page.goto('/revisao');

    // Título e CTA
    await expect(
      page.getByRole('heading', { name: /Sessão de Revisão Espaçada/i })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Iniciar Treino de Revisão/i })
    ).toBeVisible();

    // 4 Dispositivos Legais da Unidade 1
    await expect(page.getByTestId('subtopic-mastery-1')).toBeVisible();
    await expect(page.getByTestId('subtopic-mastery-2')).toBeVisible();
    await expect(page.getByTestId('subtopic-mastery-3')).toBeVisible();
    await expect(page.getByTestId('subtopic-mastery-4')).toBeVisible();

    // Validação de acessibilidade das barras de progresso
    const progressBars = page.getByRole('progressbar');
    await expect(progressBars).toHaveCount(4);
  });

  test('deve iniciar treino de revisão espaçada em /revisao/pratica, responder as 5 questões e retornar ao painel', async ({
    page,
  }) => {
    await page.goto('/revisao/pratica');

    // Valida indicador de modo de revisão
    await expect(page.getByText(/Treino de Revisão Espaçada/i)).toBeVisible();

    // Responde as 5 questões da revisão
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Questão ${i} de 5`)).toBeVisible({ timeout: 15000 });

      // Seleciona a primeira opção
      const radio = page.locator('input[type="radio"]').first();
      await radio.check();

      // Confirma resposta
      await page.getByRole('button', { name: /confirmar resposta/i }).click();

      // Aguarda feedback e clica em continuar / finalizar
      await expect(page.getByRole('status')).toBeVisible();
      const nextBtn =
        i === 5
          ? page.getByRole('button', { name: /finalizar lição/i })
          : page.getByRole('button', { name: /continuar/i });
      await nextBtn.click();
    }

    // Tela de Resumo da Revisão
    await expect(page.getByRole('heading', { name: /lição concluída/i })).toBeVisible();
    await expect(page.getByTestId('score-text')).toBeVisible();

    // Botão de retorno ao centro de revisão
    const backBtn = page.getByRole('link', { name: 'Voltar ao Centro de Revisão', exact: true });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page).toHaveURL('/revisao');
  });
});
