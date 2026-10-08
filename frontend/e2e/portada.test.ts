import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('entrada a la aplicación', () => {
  test('sin sesión, la raíz lleva a iniciar sesión en español', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('sin sesión, una vista del panel también lleva a iniciar sesión', async ({ page }) => {
    await page.goto('/lineas');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('ofrece saltar al contenido desde el teclado', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Tab');

    const enlace = page.getByRole('link', { name: 'Saltar al contenido' });
    await expect(enlace).toBeFocused();
    await expect(enlace).toBeVisible();
  });

  test('no tiene violaciones de accesibilidad graves ni críticas', async ({ page }) => {
    await page.goto('/login');

    const { violations } = await new AxeBuilder({ page }).analyze();
    const graves = violations.filter(
      (violacion) => violacion.impact === 'serious' || violacion.impact === 'critical',
    );
    expect(graves).toEqual([]);
  });
});
