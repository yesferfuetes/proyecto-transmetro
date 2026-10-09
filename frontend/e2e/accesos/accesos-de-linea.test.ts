import { expect, test } from '@playwright/test';
import { iniciarSesion } from './apoyo';

test('los accesos de la línea 1 muestran sus estaciones en orden de recorrido', async ({
  page,
}) => {
  await iniciarSesion(page, 'supervisor');

  await page.goto('/accesos');
  await page.getByRole('link', { name: 'San Sebastián – Centro Cívico', exact: true }).click();
  await page.getByRole('link', { name: 'Ver accesos de la línea' }).click();

  await expect(page).toHaveURL(/\/accesos\/lineas\/\d+$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Accesos de');
  const estaciones = page.getByRole('list', { name: /^Estaciones de .* en orden de recorrido$/ });
  const filas = estaciones.getByRole('listitem').filter({ hasText: /^\d+\./ });
  await expect(filas.first()).toContainText('1.');
  await expect(filas.nth(1)).toContainText('2.');
});
