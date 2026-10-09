import { expect, test } from '@playwright/test';
import { busesDeLaLinea, iniciarSesion, lineaConCupo, registrarBus, sufijoUnico } from './apoyo';

test('el supervisor registra un bus, lo asigna, lo cambia de parqueo y lo da de baja', async ({
  page,
}) => {
  const placa = `E2E-${sufijoUnico()}`;
  await iniciarSesion(page, 'supervisor');

  // Registrar sin línea, en un parqueo con cupo.
  const detalle = await registrarBus(page, placa);
  await expect(page.getByRole('heading', { name: placa })).toBeVisible();
  await expect(page.getByText('Este bus no sirve a ninguna línea.')).toBeVisible();

  // Asignarlo a una línea con cupo y ver un bus más en la flota por línea.
  const linea = await lineaConCupo(page);
  const nombre = linea.etiqueta.split(' · ')[1]?.replace(/ \(.*$/, '') ?? '';
  await page.getByRole('combobox', { name: 'Línea del bus' }).selectOption(linea.valor);
  await page.getByRole('button', { name: 'Cambiar línea' }).click();
  await expect(page.getByText('Línea actualizada.')).toBeVisible();
  expect(await busesDeLaLinea(page, nombre)).toBe(linea.buses + 1);

  // Cambiarlo a otro parqueo con cupo.
  await page.goto(detalle);
  const parqueo = page.getByRole('combobox', { name: 'Parqueo del bus' });
  const actual = await parqueo.inputValue();
  const otro = await parqueo
    .locator(`option:not([value="${actual}"])`)
    .first()
    .getAttribute('value');
  expect(otro).not.toBeNull();
  await parqueo.selectOption(otro ?? '');
  await page.getByRole('button', { name: 'Cambiar parqueo' }).click();
  await expect(page.getByText('Parqueo actualizado.')).toBeVisible();

  // Darlo de baja: queda de baja y sin línea.
  await page.getByRole('combobox', { name: 'Estado del bus' }).selectOption({ label: 'De baja' });
  await page.getByRole('button', { name: 'Cambiar estado' }).click();
  await expect(page.getByText('Este bus está de baja.')).toBeVisible();
  await expect(page.getByText('Este bus no sirve a ninguna línea.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cambiar línea' })).toHaveCount(0);
  expect(await busesDeLaLinea(page, nombre)).toBe(linea.buses);
});
