import { expect, test } from '@playwright/test';
import { iniciarSesion, violacionesGraves } from './apoyo';

for (const usuario of ['supervisor', 'administrador'] as const) {
  test(`el ${usuario} consulta las alertas sin acciones de escritura`, async ({ page }) => {
    await iniciarSesion(page, usuario);
    await page.goto('/alertas');
    await expect(page.getByRole('heading', { name: /Alertas/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Registrar lectura' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Atender/ })).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Estación' })).toBeVisible();
  });

  test(`el ${usuario} que abre el registro de lecturas llega a acceso denegado`, async ({
    page,
  }) => {
    await iniciarSesion(page, usuario);
    await page.goto('/alertas/registrar');
    await expect(page).toHaveURL(/\/acceso-denegado/);
  });
}

test('el operador no ve el filtro de estación y sus pantallas no tienen violaciones graves', async ({
  page,
}) => {
  await iniciarSesion(page, 'operador');
  await page.goto('/alertas');
  await expect(page.getByRole('link', { name: 'Registrar lectura' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Estación' })).toHaveCount(0);
  expect(await violacionesGraves(page)).toEqual([]);

  await page.goto('/alertas/registrar');
  await expect(page.getByRole('button', { name: 'Registrar demanda' })).toBeVisible();
  expect(await violacionesGraves(page)).toEqual([]);
});
