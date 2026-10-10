import { expect, test } from '@playwright/test';
import {
  datosDePiloto,
  iniciarSesion,
  lineaConCupo,
  registrarBus,
  registrarParqueoConCupo,
  registrarPiloto,
  sufijoUnico,
  valorDeBus,
} from './apoyo';

test('el supervisor registra, edita y cambia de bus a un piloto', async ({ page }) => {
  const sufijo = sufijoUnico();
  await iniciarSesion(page, 'supervisor');

  // Dos buses propios, en un parqueo propio con cupo.
  const parqueo = await registrarParqueoConCupo(page, `P${sufijo}`);
  const placaA = `E2E-${sufijo}A`;
  const placaB = `E2E-${sufijo}B`;
  const detalleA = await registrarBus(page, placaA, parqueo);
  await registrarBus(page, placaB, parqueo);

  // El primer bus sirve a una línea; el piloto la hereda.
  await page.goto(detalleA);
  const linea = await lineaConCupo(page);
  const nombreDeLinea = linea.etiqueta.split(' · ')[1]?.replace(/ \(.*$/, '') ?? '';
  await page.getByRole('combobox', { name: 'Línea del bus' }).selectOption(linea.valor);
  await page.getByRole('button', { name: 'Cambiar línea' }).click();
  await expect(page.getByText('Línea actualizada.')).toBeVisible();

  // Registrar con bus: queda en la ficha y en el listado, con la línea del bus.
  const primero = datosDePiloto(sufijo, 1, { placaDelBus: placaA });
  const ficha = await registrarPiloto(page, primero);
  await expect(page.getByRole('heading', { name: primero.nombre })).toBeVisible();
  await expect(page.getByText(placaA, { exact: true })).toBeVisible();
  await expect(page.getByText(nombreDeLinea)).toBeVisible();
  await page.goto(`/pilotos?busqueda=${encodeURIComponent(primero.nombre)}`);
  const fila = page.getByRole('row').filter({ hasText: primero.nombre });
  await expect(fila).toContainText(placaA);
  await expect(fila).toContainText(nombreDeLinea);

  // Editar el teléfono y el historial.
  await page.goto(`${ficha}/editar`);
  await page.getByLabel('Teléfono').fill('4444-5678');
  await page.getByLabel('Historial educativo').fill('Perito contador y estudios de ingeniería');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page).toHaveURL(/\/pilotos\/\d+$/);
  await expect(page.getByText('4444-5678')).toBeVisible();
  await expect(page.getByText('Perito contador y estudios de ingeniería')).toBeVisible();

  // Pasarlo al segundo bus.
  const cambio = page.getByRole('combobox', { name: 'Bus del piloto' });
  await cambio.selectOption(await valorDeBus(cambio, placaB));
  await page.getByRole('button', { name: 'Cambiar bus' }).click();
  await expect(page.getByText('Bus actualizado.')).toBeVisible();
  await expect(page.getByText(placaB).first()).toBeVisible();

  // Un segundo piloto en el mismo bus: ambos conviven.
  const segundo = datosDePiloto(sufijo, 2, { placaDelBus: placaB });
  await registrarPiloto(page, segundo);
  await page.goto(`/pilotos?busqueda=${encodeURIComponent(`Piloto E2E ${sufijo}`)}`);
  await expect(page.getByRole('row').filter({ hasText: placaB })).toHaveCount(2);

  // Dejar al primero sin bus: queda sin bus y sin línea.
  await page.goto(ficha);
  await page.getByRole('combobox', { name: 'Bus del piloto' }).selectOption('');
  await page.getByRole('button', { name: 'Cambiar bus' }).click();
  await expect(page.getByText('Este piloto no tiene bus asignado.')).toBeVisible();
  await expect(page.getByText('Sin línea', { exact: true })).toBeVisible();
});
