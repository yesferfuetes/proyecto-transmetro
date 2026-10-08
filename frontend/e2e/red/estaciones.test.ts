import { expect, test } from '@playwright/test';
import { iniciarSesion, registrarEstacion, sufijoUnico } from './apoyo';

test('el supervisor registra tres estaciones sin línea y edita una', async ({ page }) => {
  const prefijo = `E2E${sufijoUnico()}`;
  await iniciarSesion(page, 'supervisor');

  for (const letra of ['A', 'B', 'C']) {
    await registrarEstacion(page, `${prefijo}${letra}`, `Estación de prueba ${letra}`);
  }

  await page.goto(`/estaciones?busqueda=${prefijo}`);
  const filas = page.getByRole('row').filter({ hasText: prefijo });
  await expect(filas).toHaveCount(3);
  for (const fila of await filas.all()) {
    await expect(fila.getByText('Sin línea')).toBeVisible();
  }

  await page.getByRole('link', { name: `Abrir estación ${prefijo}B` }).click();
  await page.getByRole('link', { name: 'Editar estación' }).click();
  await page.getByLabel('Nombre').fill('Estación de prueba editada');
  await page.getByLabel('Tiene parqueo').check();
  await page.getByRole('button', { name: 'Guardar cambios' }).click();

  await expect(page).toHaveURL(/\/estaciones\/\d+$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Estación de prueba editada');
});
