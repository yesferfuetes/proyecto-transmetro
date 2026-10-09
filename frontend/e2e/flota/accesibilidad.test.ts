import { expect, test } from '@playwright/test';
import { iniciarSesion, violacionesGraves } from './apoyo';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'supervisor');
});

test('los listados de flota no tienen violaciones graves ni críticas', async ({ page }) => {
  for (const ruta of ['/flota', '/flota/lineas', '/flota/parqueos']) {
    await page.goto(ruta);
    await expect(page.getByRole('table')).toBeVisible();
    expect(await violacionesGraves(page), ruta).toEqual([]);
  }
});

test('el detalle y los formularios de flota no tienen violaciones graves ni críticas', async ({
  page,
}) => {
  await page.goto('/flota');
  await page
    .getByRole('link', { name: /^Abrir bus/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/flota\/\d+$/);
  expect(await violacionesGraves(page), 'detalle').toEqual([]);

  for (const ruta of ['/flota/nuevo', '/flota/parqueos/nuevo']) {
    await page.goto(ruta);
    expect(await violacionesGraves(page), ruta).toEqual([]);
  }
});
