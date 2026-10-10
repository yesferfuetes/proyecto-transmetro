import { expect, test } from '@playwright/test';
import { generarReporte, iniciarSesion, USUARIOS } from './apoyo';

test('el administrador genera un reporte y su constancia queda con su usuario', async ({
  page,
}) => {
  await iniciarSesion(page, 'administrador');
  await generarReporte(page, 'Estaciones');

  await page.goto('/reportes/bitacora');
  await expect(page.getByRole('table')).toBeVisible();
  const suya = page.getByRole('row').filter({ hasText: USUARIOS.administrador });
  await expect(suya.first()).toBeVisible();
  await expect(suya.first()).toContainText('Estaciones');
});
