import { expect, test } from '@playwright/test';
import { iniciarSesion } from './apoyo';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'operador');
});

test('el operador no ve Reportes en el menú', async ({ page }) => {
  await page.goto('/inicio');
  await expect(page.getByRole('link', { name: 'Reportes', exact: true })).toHaveCount(0);
});

test('el operador que abre una ruta de reportes llega a acceso denegado', async ({ page }) => {
  for (const ruta of [
    '/reportes',
    '/reportes/bitacora',
    '/reportes/estaciones',
    '/reportes/lineas?consulta=1',
    '/reportes/buses?consulta=1',
  ]) {
    await page.goto(ruta);
    await expect(page).toHaveURL(/\/acceso-denegado/);
  }
});
