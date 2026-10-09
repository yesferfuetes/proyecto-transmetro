import { expect, test } from '@playwright/test';
import { iniciarSesion, violacionesGraves } from './apoyo';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'supervisor');
});

test('/accesos y /guardias no tienen violaciones graves ni críticas', async ({ page }) => {
  for (const ruta of ['/accesos', '/guardias']) {
    await page.goto(ruta);
    expect(await violacionesGraves(page), ruta).toEqual([]);
  }
});

test('el detalle de un acceso no tiene violaciones graves ni críticas', async ({ page }) => {
  await page.goto('/accesos');
  await page.getByRole('table').first().waitFor();
  await page
    .getByRole('table')
    .first()
    .getByRole('link', { name: /guardias?\)$/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/accesos\/\d+$/);
  expect(await violacionesGraves(page), 'detalle').toEqual([]);
});
