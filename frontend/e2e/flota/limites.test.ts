import { expect, test, type Page } from '@playwright/test';
import {
  iniciarSesion,
  registrarEstacion,
  registrarParqueoConCupo,
  sufijoUnico,
  valorDeParqueo,
} from './apoyo';

async function agregarParada(page: Page, codigo: string): Promise<void> {
  const buscador = page.getByRole('combobox', { name: 'Agregar estación al final' });
  await buscador.fill(codigo);
  await expect(page.getByRole('option', { name: new RegExp(codigo) })).toBeVisible();
  await buscador.press('Enter');
}

async function crearLineaDeDosEstaciones(page: Page, sufijo: string): Promise<string> {
  const [a, b] = [`F${sufijo}A`, `F${sufijo}B`];
  for (const codigo of [a, b]) {
    await registrarEstacion(page, codigo, `Parada ${codigo}`);
  }
  await page.goto('/lineas/nueva');
  await page.getByLabel('Código').fill(`F${sufijo}`);
  await page.getByLabel('Nombre').fill(`Línea de flota ${sufijo}`);
  await page.getByLabel('Municipalidad').selectOption({ label: 'Guatemala' });
  await page.getByLabel('Estado inicial').selectOption({ label: 'En construcción' });
  await page.getByRole('button', { name: 'Registrar línea' }).click();
  await expect(page).toHaveURL(/\/lineas\/\d+$/);
  await page.getByRole('link', { name: 'Editar recorrido' }).click();
  for (const codigo of [a, b]) {
    await agregarParada(page, codigo);
  }
  await page.getByLabel(`Distancia de ${a} a la siguiente`).fill('1');
  await page.getByRole('button', { name: 'Guardar recorrido' }).click();
  await expect(page).toHaveURL(/\/lineas\/\d+$/);
  return `F${sufijo}`;
}

test('una línea de dos estaciones admite cuatro buses y rechaza el quinto', async ({ page }) => {
  const sufijo = sufijoUnico();
  await iniciarSesion(page, 'supervisor');
  const codigoLinea = await crearLineaDeDosEstaciones(page, sufijo);
  const parqueo = await registrarParqueoConCupo(page, `L${sufijo}`);

  for (const numero of [1, 2, 3, 4, 5]) {
    await page.goto('/flota/nuevo');
    await page.getByLabel('Placa').fill(`F${sufijo}-${numero}`);
    await page.getByLabel('Capacidad máxima').fill('100');
    const selectorDeParqueo = page.getByRole('combobox', { name: 'Parqueo' });
    await selectorDeParqueo.selectOption(await valorDeParqueo(selectorDeParqueo, parqueo));
    const opcion = page
      .getByRole('combobox', { name: 'Línea' })
      .locator('option', { hasText: new RegExp(`^${codigoLinea} · `) });
    await page
      .getByRole('combobox', { name: 'Línea' })
      .selectOption((await opcion.getAttribute('value')) ?? '');
    await page.getByRole('button', { name: 'Registrar bus' }).click();
    if (numero < 5) {
      await expect(page).toHaveURL(/\/flota\/\d+$/);
    }
  }

  const error = page.getByRole('alert').filter({ hasText: /admite como máximo 4 buses/ });
  await expect(error).toBeVisible();
  await expect(page).toHaveURL(/\/flota\/nuevo$/);
});
