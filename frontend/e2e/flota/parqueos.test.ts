import { expect, test } from '@playwright/test';
import { esperarHidratacion, iniciarSesion, sufijoUnico } from './apoyo';

test('el supervisor registra un parqueo en una estación con parqueo y lo elimina vacío', async ({
  page,
}) => {
  const codigo = `Q${sufijoUnico()}`;
  await iniciarSesion(page, 'supervisor');

  await page.goto('/flota/parqueos/nuevo');
  await esperarHidratacion(page);
  await page.getByLabel('Estación').selectOption({ index: 1 });
  await page.getByLabel('Código').fill(codigo);
  await page.getByLabel('Capacidad de vehículos').fill('5');
  await page.getByRole('button', { name: 'Registrar parqueo' }).click();
  await expect(page).toHaveURL(/\/flota\/parqueos$/);

  const fila = page.getByRole('row').filter({ hasText: codigo });
  await expect(fila).toHaveCount(1);
  await expect(fila).toContainText('0 de 5');

  // Eliminarlo: el diálogo pide confirmación y la fila desaparece.
  const confirmar = page.getByRole('button', { name: 'Eliminar parqueo', exact: true });
  await expect(async () => {
    await fila.getByRole('button', { name: /^Eliminar/ }).click();
    await expect(confirmar).toBeVisible({ timeout: 1000 });
  }).toPass();
  await confirmar.click();
  await expect(page.getByRole('row').filter({ hasText: codigo })).toHaveCount(0);
});
