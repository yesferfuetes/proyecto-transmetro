import { expect, test } from '@playwright/test';
import { iniciarSesion, violacionesGraves } from './apoyo';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'supervisor');
});

test('/lineas y /estaciones no tienen violaciones graves ni críticas', async ({ page }) => {
  for (const ruta of ['/lineas', '/estaciones']) {
    await page.goto(ruta);
    expect(await violacionesGraves(page), ruta).toEqual([]);
  }
});

test('el detalle y el editor de recorrido no tienen violaciones graves ni críticas', async ({
  page,
}) => {
  await page.goto('/lineas');
  await page
    .getByRole('link', { name: /^Abrir línea/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/lineas\/\d+$/);
  expect(await violacionesGraves(page), 'detalle').toEqual([]);

  await page.getByRole('link', { name: 'Editar recorrido' }).click();
  await expect(page).toHaveURL(/\/recorrido$/);
  expect(await violacionesGraves(page), 'recorrido').toEqual([]);
});
