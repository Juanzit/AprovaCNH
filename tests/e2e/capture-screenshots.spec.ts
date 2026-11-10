import { test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('public/screenshots/after');
fs.mkdirSync(outDir, { recursive: true });

test.describe('Captura do Estado Visual Redesenhado (After)', () => {
  test('Captura Home Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, 'home-desktop.png'), fullPage: true });
  });

  test('Captura Home Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, 'home-mobile.png'), fullPage: true });
  });

  test('Captura Lição Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/licao/sinalizacao');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, 'lesson-desktop.png'), fullPage: true });
  });

  test('Captura Centro de Revisão Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/revisao');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, 'review-desktop.png'), fullPage: true });
  });

  test('Captura Simulado Lobby Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulado');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, 'simulado-lobby-desktop.png'), fullPage: true });
  });

  test('Captura Simulado Contingência Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulado/prova');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, 'simulado-contingency-desktop.png'), fullPage: true });
  });
});
