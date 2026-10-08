import { expect, test } from '@playwright/test';
import { iniciarSesion } from './apoyo';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'operador');
});

test('el operador abre una línea de su estación y la ve resaltada, sin escritura', async ({
  page,
}) => {
  await page.goto('/lineas');
  await expect(page.getByRole('link', { name: 'Nueva línea' })).toHaveCount(0);

  const fila = page.getByRole('row').filter({ hasText: 'Pasa por tu estación' }).first();
  await fila.getByRole('link', { name: /^Abrir línea/ }).click();
  await expect(page).toHaveURL(/\/lineas\/\d+$/);

  await expect(page.getByText('Tu estación')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Editar recorrido' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Editar línea' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cambiar estado' })).toHaveCount(0);
});

test('el operador que abre /lineas/nueva llega a acceso denegado', async ({ page }) => {
  await page.goto('/lineas/nueva');
  await expect(page).toHaveURL(/\/acceso-denegado/);
});
