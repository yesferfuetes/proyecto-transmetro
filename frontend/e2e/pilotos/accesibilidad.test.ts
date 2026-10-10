import { expect, test } from '@playwright/test';
import { iniciarSesion, violacionesGraves } from './apoyo';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'supervisor');
});

test('el listado, la ficha y los formularios de pilotos no tienen violaciones graves ni críticas', async ({
  page,
}) => {
  await page.goto('/pilotos');
  await expect(page.getByRole('table')).toBeVisible();
  expect(await violacionesGraves(page), '/pilotos').toEqual([]);

  await page
    .getByRole('link', { name: /^Abrir piloto/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/pilotos\/\d+$/);
  expect(await violacionesGraves(page), 'ficha').toEqual([]);

  await page.getByRole('link', { name: 'Editar expediente' }).click();
  await expect(page).toHaveURL(/\/editar$/);
  expect(await violacionesGraves(page), 'editar').toEqual([]);

  await page.goto('/pilotos/nuevo');
  expect(await violacionesGraves(page), 'nuevo').toEqual([]);
});
