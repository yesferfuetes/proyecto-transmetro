import { expect, test } from '@playwright/test';
import {
  dpiUnico,
  elegirGuardia,
  esperarHidratacion,
  iniciarSesion,
  registrarGuardia,
  sufijoUnico,
} from './apoyo';

test('el supervisor registra guardias y un acceso, asigna, quita y no puede quitar el último', async ({
  page,
}) => {
  const sufijo = sufijoUnico();
  const primero = `Guardia E2E ${sufijo} Uno`;
  const segundo = `Guardia E2E ${sufijo} Dos`;
  await iniciarSesion(page, 'supervisor');

  await registrarGuardia(page, primero, dpiUnico());
  await registrarGuardia(page, segundo, dpiUnico(1));

  await page.goto('/accesos/nuevo');
  await esperarHidratacion(page);
  await page.getByLabel('Estación').selectOption({ index: 1 });
  await page.getByLabel('Código').fill(`T${sufijo}`);
  await elegirGuardia(page, primero);
  await page.getByRole('textbox', { name: 'Turno' }).fill('06:00-14:00');
  await page.getByRole('button', { name: 'Registrar acceso' }).click();

  await expect(page).toHaveURL(/\/accesos\/\d+$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(`T${sufijo}`);
  const asignaciones = page.getByRole('table', { name: 'Guardias asignados al acceso' });
  await expect(asignaciones.getByRole('row').filter({ hasText: primero })).toBeVisible();

  await esperarHidratacion(page);
  await elegirGuardia(page, segundo);
  await page.getByRole('textbox', { name: 'Turno' }).fill('14:00-22:00');
  await page.getByRole('button', { name: 'Asignar guardia' }).click();
  await expect(asignaciones.getByRole('row').filter({ hasText: segundo })).toBeVisible();

  await page.getByRole('button', { name: `Quitar a ${segundo} del turno 14:00-22:00` }).click();
  await page.getByRole('button', { name: 'Quitar del turno' }).click();
  await expect(asignaciones.getByRole('row').filter({ hasText: segundo })).toHaveCount(0);

  await page.getByRole('button', { name: `Quitar a ${primero} del turno 06:00-14:00` }).click();
  await page.getByRole('button', { name: 'Quitar del turno' }).click();
  await expect(page.getByRole('alert').filter({ hasText: /al menos un guardia/i })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(asignaciones.getByRole('row').filter({ hasText: primero })).toBeVisible();
});
