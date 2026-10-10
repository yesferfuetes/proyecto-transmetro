import { expect, type Locator, type Page } from '@playwright/test';

import { esperarHidratacion } from '../red/apoyo';

export { esperarHidratacion, iniciarSesion, USUARIOS, violacionesGraves } from '../red/apoyo';

export type TipoDeReporte = 'Estaciones' | 'Líneas' | 'Buses por línea';

export type Filtros = Readonly<{
  /** Texto que identifica la opción, por ejemplo /· Línea 1$/. */
  linea?: RegExp;
  estacion?: RegExp;
  /** Posición de la opción en la lista; 1 es la primera municipalidad. */
  municipalidad?: number;
}>;

async function elegir(selector: Locator, texto: RegExp): Promise<void> {
  const valor = await selector.locator('option', { hasText: texto }).first().getAttribute('value');
  if (valor === null || valor === '') {
    throw new Error(`No hay una opción que coincida con ${String(texto)}.`);
  }
  await selector.selectOption(valor);
}

/** Genera un reporte con el formulario y espera a que se abra. */
export async function generarReporte(
  page: Page,
  tipo: TipoDeReporte,
  filtros: Filtros = {},
): Promise<void> {
  await page.goto('/reportes');
  await esperarHidratacion(page);
  await page.getByLabel('Tipo de reporte').selectOption({ label: tipo });
  if (filtros.linea) {
    await elegir(page.getByRole('combobox', { name: /^Línea/ }), filtros.linea);
  }
  if (filtros.estacion) {
    await elegir(page.getByRole('combobox', { name: /^Estación/ }), filtros.estacion);
  }
  if (filtros.municipalidad !== undefined) {
    await page
      .getByRole('combobox', { name: /^Municipalidad/ })
      .selectOption({ index: filtros.municipalidad });
  }
  await page.getByRole('button', { name: 'Generar reporte' }).click();
  await expect(page).toHaveURL(/\/reportes\/(estaciones|lineas|buses)\?consulta=\d+/);
  await expect(page.getByText(/^[\d.,\s]+ resultados?$/)).toBeVisible();
}

/** Cifra "N resultados" que acompaña a un reporte o a la bitácora. */
export async function totalDeResultados(page: Page): Promise<number> {
  const texto = await page.getByText(/^[\d.,\s]+ resultados?$/).textContent();
  return Number((texto ?? '').replace(/\D/g, ''));
}

/** Filas del cuerpo de la tabla visible. */
export function filasDeLaTabla(page: Page): Locator {
  return page
    .getByRole('table')
    .getByRole('row')
    .filter({ has: page.getByRole('cell') });
}

/** Texto de una columna (por posición) en todas las filas de datos de la página. */
export async function columna(page: Page, posicion: number): Promise<string[]> {
  return filasDeLaTabla(page).evaluateAll(
    (filas, indice) =>
      filas.map((fila) => fila.querySelectorAll('td')[indice]?.textContent?.trim() ?? ''),
    posicion,
  );
}

/** Día de hoy en Guatemala, como lo escribe un campo de fecha. */
export function hoyEnGuatemala(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });
}
