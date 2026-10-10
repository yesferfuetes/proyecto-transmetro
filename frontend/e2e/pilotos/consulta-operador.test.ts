import { expect, test } from '@playwright/test';
import { iniciarSesion } from './apoyo';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'operador');
});

test('el operador consulta el listado y la ficha sin DPI ni acciones de escritura', async ({
  page,
}) => {
  await page.goto('/pilotos');
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nuevo piloto' })).toHaveCount(0);
  await expect(page.getByRole('columnheader', { name: 'DPI' })).toHaveCount(0);
  await expect(
    page.getByRole('searchbox', { name: 'Buscar por nombre', exact: true }),
  ).toBeVisible();

  await page
    .getByRole('link', { name: /^Abrir piloto/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/pilotos\/\d+$/);
  await expect(page.getByText('Teléfono', { exact: true })).toBeVisible();
  for (const dato of ['DPI', 'Correo', 'Dirección de residencia', 'Historial educativo']) {
    await expect(page.getByText(dato, { exact: true })).toHaveCount(0);
  }
  await expect(page.getByRole('link', { name: 'Editar expediente' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cambiar bus' })).toHaveCount(0);
});

test('el operador que abre una ruta de escritura llega a acceso denegado', async ({ page }) => {
  for (const ruta of ['/pilotos/nuevo', '/pilotos/1/editar']) {
    await page.goto(ruta);
    await expect(page).toHaveURL(/\/acceso-denegado/);
  }
});
