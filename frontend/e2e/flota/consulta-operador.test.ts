import { expect, test } from '@playwright/test';
import { iniciarSesion } from './apoyo';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'operador');
});

test('el operador consulta buses, flota y parqueos sin acciones de escritura', async ({ page }) => {
  await page.goto('/flota');
  await expect(page.getByRole('link', { name: 'Nuevo bus' })).toHaveCount(0);
  await expect(page.getByText('Pasa por tu estación').first()).toBeVisible();

  await page
    .getByRole('link', { name: /^Abrir bus/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/flota\/\d+$/);
  await expect(page.getByRole('link', { name: 'Editar capacidad' })).toHaveCount(0);
  for (const nombre of ['Cambiar línea', 'Cambiar parqueo', 'Cambiar estado']) {
    await expect(page.getByRole('button', { name: nombre })).toHaveCount(0);
  }

  await page.goto('/flota/lineas');
  await expect(page.getByRole('table')).toBeVisible();

  await page.goto('/flota/parqueos');
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nuevo parqueo' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /^Editar/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Eliminar/ })).toHaveCount(0);
});

test('el operador que abre una ruta de escritura llega a acceso denegado', async ({ page }) => {
  for (const ruta of ['/flota/nuevo', '/flota/parqueos/nuevo']) {
    await page.goto(ruta);
    await expect(page).toHaveURL(/\/acceso-denegado/);
  }
});
