import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('portada', () => {
  test('responde y declara el idioma español', async ({ page }) => {
    const respuesta = await page.goto('/');

    expect(respuesta?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByRole('heading', { level: 1, name: 'Transmetro' })).toBeVisible();
  });

  test('ofrece saltar al contenido desde el teclado', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const enlace = page.getByRole('link', { name: 'Saltar al contenido' });
    await expect(enlace).toBeFocused();
    await expect(enlace).toBeVisible();
  });

  test('no tiene violaciones de accesibilidad graves ni críticas', async ({ page }) => {
    await page.goto('/');

    const { violations } = await new AxeBuilder({ page }).analyze();
    const graves = violations.filter(
      (violacion) => violacion.impact === 'serious' || violacion.impact === 'critical',
    );
    expect(graves).toEqual([]);
  });
});
