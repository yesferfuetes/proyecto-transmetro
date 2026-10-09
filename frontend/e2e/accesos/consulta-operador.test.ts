import { expect, test } from '@playwright/test';
import { iniciarSesion } from './apoyo';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'operador');
});

test('el operador ve la red con su estación resaltada y sin acciones de escritura', async ({
  page,
}) => {
  await page.goto('/accesos');
  await expect(page.getByText('Tu estación')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Nuevo acceso' })).toHaveCount(0);

  await page.getByRole('row').filter({ hasText: 'Tu estación' }).getByRole('link').first().click();
  await expect(page).toHaveURL(/\/accesos\/\d+$/);
  await expect(page.getByRole('button', { name: /^Quitar a / })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Asignar guardia' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Guardar nombre' })).toHaveCount(0);

  await page.goto('/guardias');
  await expect(page.getByRole('link', { name: 'Nuevo guardia' })).toHaveCount(0);
});

test('el operador que abre /accesos/nuevo llega a acceso denegado', async ({ page }) => {
  await page.goto('/accesos/nuevo');
  await expect(page).toHaveURL(/\/acceso-denegado/);
});

test('el operador que abre /guardias/nuevo llega a acceso denegado', async ({ page }) => {
  await page.goto('/guardias/nuevo');
  await expect(page).toHaveURL(/\/acceso-denegado/);
});
