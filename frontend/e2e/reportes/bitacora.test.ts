import { expect, test } from '@playwright/test';
import {
  columna,
  filasDeLaTabla,
  generarReporte,
  hoyEnGuatemala,
  iniciarSesion,
  totalDeResultados,
} from './apoyo';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'supervisor');
});

async function consultasEnLaBitacora(page: import('@playwright/test').Page): Promise<number> {
  await page.goto('/reportes/bitacora');
  await expect(page.getByText(/^[\d.,\s]+ resultados?$/)).toBeVisible();
  return totalDeResultados(page);
}

test('generar y exportar un reporte deja dos constancias nuevas en la bitácora', async ({
  page,
}) => {
  const antes = await consultasEnLaBitacora(page);

  await generarReporte(page, 'Líneas');
  const descarga = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar' }).click();
  const archivo = await descarga;
  expect(archivo.suggestedFilename()).toMatch(/^reporte-.*\.csv$/);
  const contenido = (await archivo.createReadStream()).setEncoding('utf8');
  let texto = '';
  for await (const trozo of contenido) {
    texto += String(trozo);
  }
  expect(texto.startsWith('﻿')).toBe(true);
  expect(texto.split(/\r?\n/).filter((linea) => linea !== '').length).toBeGreaterThan(8);

  // Otras pruebas también escriben constancias: se cuentan los cambios propios, no el total.
  expect(await consultasEnLaBitacora(page)).toBeGreaterThanOrEqual(antes + 2);
});

test('la bitácora se filtra por tipo y por el rango de hoy, y consultarla no agrega nada', async ({
  page,
}) => {
  await generarReporte(page, 'Líneas', { municipalidad: /^Guatemala$/ });
  await page.goto('/reportes/bitacora');

  await page.getByLabel('Reporte', { exact: true }).selectOption('LINEAS');
  await expect(page).toHaveURL(/tipo=LINEAS/);
  const tipos = new Set(await columna(page, 2));
  expect([...tipos]).toEqual(['Líneas']);
  await expect(page.getByText('Municipalidad: ').first()).toBeVisible();

  const hoy = hoyEnGuatemala();
  await page.getByLabel('Fechas: desde').fill(hoy);
  await page.getByLabel('Fechas: hasta').fill(hoy);
  await page.getByRole('button', { name: 'Aplicar fechas' }).click();
  await expect(page).toHaveURL(new RegExp(`desde=${hoy}`));
  await expect(filasDeLaTabla(page).first()).toBeVisible();

  const alFiltrar = await totalDeResultados(page);
  await page.reload();
  expect(await totalDeResultados(page)).toBe(alFiltrar);
});

test('la bitácora se filtra por usuario y lista de la más reciente a la más antigua', async ({
  page,
}) => {
  await generarReporte(page, 'Estaciones');
  await page.goto('/reportes/bitacora');
  const usuario = page.getByLabel('Usuario', { exact: true });
  const valor = await usuario.locator('option').nth(1).getAttribute('value');
  await usuario.selectOption(valor ?? '');
  await expect(page).toHaveURL(/usuarioId=\d+/);
  const autores = new Set(await columna(page, 1));
  expect(autores.size).toBe(1);

  const fechas = await columna(page, 0);
  expect(fechas.length).toBeGreaterThan(0);
  expect(fechas).toEqual([...fechas].sort().reverse());
});

test('un rango con el inicio posterior al fin muestra el error del backend', async ({ page }) => {
  await page.goto('/reportes/bitacora');
  await page.getByLabel('Fechas: desde').fill('2026-10-09');
  await page.getByLabel('Fechas: hasta').fill('2026-10-01');
  await page.getByRole('button', { name: 'Aplicar fechas' }).click();
  await expect(page.locator('main').getByRole('alert')).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('la bitácora no ofrece editar ni eliminar constancias', async ({ page }) => {
  await page.goto('/reportes/bitacora');
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('button', { name: /editar|eliminar|borrar/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /editar|eliminar|borrar/i })).toHaveCount(0);
});
