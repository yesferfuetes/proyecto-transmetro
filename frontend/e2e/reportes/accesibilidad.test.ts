import { expect, test } from '@playwright/test';
import { generarReporte, iniciarSesion, violacionesGraves } from './apoyo';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'supervisor');
});

test('el formulario, un reporte y la bitácora no tienen violaciones graves ni críticas', async ({
  page,
}) => {
  await page.goto('/reportes');
  await expect(page.getByRole('button', { name: 'Generar reporte' })).toBeVisible();
  expect(await violacionesGraves(page), 'formulario').toEqual([]);

  await generarReporte(page, 'Buses por línea');
  await expect(page.getByRole('table')).toBeVisible();
  expect(await violacionesGraves(page), 'reporte').toEqual([]);

  await page.goto('/reportes/bitacora');
  await expect(page.getByRole('table')).toBeVisible();
  expect(await violacionesGraves(page), 'bitácora').toEqual([]);
});
