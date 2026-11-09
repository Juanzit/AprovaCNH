import { test, expect } from '@playwright/test';

test.describe('Simulado Temático de Sinalização — Fase 6 (T006 / Regra D007 & Segurança Editorial P0)', () => {
  test('deve exibir as regras do simulado temático e alertar sobre indisponibilidade por acervo insuficiente (20 de 30 questões aprovadas)', async ({
    page,
  }) => {
    await page.goto('/simulado');

    await expect(
      page.getByRole('heading', {
        name: /Simulado Temático — Sinalização de Trânsito/i,
      })
    ).toBeVisible();

    await expect(page.getByTestId('rule-total-questions')).toContainText('30 questões');
    await expect(page.getByTestId('rule-duration')).toContainText('60 minutos');
    await expect(page.getByTestId('rule-passing-score')).toContainText('20 acertos');

    // Valida o alerta acessível de indisponibilidade por segurança editorial P0
    const alert = page.getByTestId('simulado-insufficient-alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/o acervo possui 20 questões aprovadas, sendo necessárias 30/i);

    // Valida que o CTA está desabilitado e explicativo, impedindo início indevido
    const cta = page.getByTestId('start-simulado-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toBeDisabled();
    await expect(cta).toHaveAttribute('aria-disabled', 'true');
    await expect(cta).toContainText('Simulado Indisponível (20/30 questões aprovadas)');
  });

  test('deve bloquear acesso direto a /simulado/prova exibindo tela informativa de contingência com acervo em homologação', async ({
    page,
  }) => {
    await page.goto('/simulado/prova');

    // Valida que a página não quebra nem renderiza tela branca
    const alert = page.getByTestId('simulado-insufficient-alert');
    await expect(alert).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Simulado Completo Temporariamente Indisponível/i })
    ).toBeVisible();
    await expect(alert).toContainText(/o acervo conta com 20 questões aprovadas/i);

    // Valida que o link de retorno ao lobby está acessível
    const returnLink = page.getByTestId('return-simulado-lobby-btn');
    await expect(returnLink).toBeVisible();
    await returnLink.click();
    await expect(page).toHaveURL(/\/simulado$/);
  });

  test('deve permitir alternar para tempo estendido de 120 minutos para adaptação PCD, TDAH ou TEA (Art. 33, § 2º)', async ({
    page,
  }) => {
    await page.goto('/simulado');

    // Verifica menção expressa a TEA e Art. 33, § 2º
    const pcdLabel = page.locator('label[for="duration-opt-120"]');
    await expect(pcdLabel).toContainText('TEA');
    await expect(pcdLabel).toContainText('Art. 33, § 2º');

    // Seleciona a opção de 120 minutos PCD/TEA
    const pcdRadio = page.locator('input#duration-opt-120');
    await pcdRadio.check();
    await expect(pcdRadio).toBeChecked();

    // O botão de CTA continua desabilitado e protegido contra início indevido
    const cta = page.getByTestId('start-simulado-cta');
    await expect(cta).toBeDisabled();
  });
});
