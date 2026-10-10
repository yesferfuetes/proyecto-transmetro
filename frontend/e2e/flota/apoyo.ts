import { expect, type Locator, type Page } from '@playwright/test';

import { esperarHidratacion } from '../red/apoyo';

export {
  esperarHidratacion,
  iniciarSesion,
  registrarEstacion,
  sufijoUnico,
  violacionesGraves,
} from '../red/apoyo';

export type LineaConCupo = Readonly<{ valor: string; etiqueta: string; buses: number }>;

/** Del selector de líneas: la primera que admite un bus más sin quedar bajo su mínimo al quitarlo. */
export async function lineaConCupo(page: Page): Promise<LineaConCupo> {
  const selector = page.getByRole('combobox', { name: 'Línea del bus' });
  await expect(selector.locator('option').nth(1)).toBeAttached();
  const opciones = await selector.locator('option').all();
  for (const opcion of opciones) {
    const etiqueta = (await opcion.textContent()) ?? '';
    const cifras = /\((\d+) de (\d+) buses\)/.exec(etiqueta);
    const valor = (await opcion.getAttribute('value')) ?? '';
    // Solo las líneas sembradas: las que crean otras pruebas en paralelo cambian de cupo.
    if (cifras && valor !== '' && /^(L\d+|R5) · /.test(etiqueta)) {
      const [buses, maximo] = [Number(cifras[1]), Number(cifras[2])];
      // El mínimo es la mitad del máximo; con uno más sobre él, la baja posterior es válida.
      if (buses >= maximo / 2 && buses < maximo) {
        return { valor, etiqueta, buses };
      }
    }
  }
  throw new Error('Ninguna línea tiene cupo para un bus más.');
}

/**
 * Registra un parqueo con cupo propio para que el caso no dependa de los lugares libres de la
 * siembra ni los agote. Devuelve el código con el que se reconoce en las listas.
 */
export async function registrarParqueoConCupo(page: Page, codigo: string): Promise<string> {
  await page.goto('/flota/parqueos/nuevo');
  await esperarHidratacion(page);
  await page.getByLabel('Estación').selectOption({ index: 1 });
  await page.getByLabel('Código').fill(codigo);
  await page.getByLabel('Capacidad de vehículos').fill('20');
  await page.getByRole('button', { name: 'Registrar parqueo' }).click();
  await expect(page).toHaveURL(/\/flota\/parqueos$/);
  return codigo;
}

/** El valor de la opción del parqueo con ese código en el selector abierto. */
export async function valorDeParqueo(select: Locator, codigo: string): Promise<string> {
  const opcion = select.locator('option', { hasText: new RegExp(` · ${codigo} \\(`) });
  return (await opcion.getAttribute('value')) ?? '';
}

/** Registra un bus con el formulario, sin línea, en el parqueo dado; devuelve su ruta de detalle. */
export async function registrarBus(
  page: Page,
  placa: string,
  codigoDeParqueo: string,
): Promise<string> {
  await page.goto('/flota/nuevo');
  await page.getByLabel('Placa').fill(placa);
  await page.getByLabel('Capacidad máxima').fill('120');
  const parqueo = page.getByRole('combobox', { name: 'Parqueo' });
  await parqueo.selectOption(await valorDeParqueo(parqueo, codigoDeParqueo));
  await page.getByRole('button', { name: 'Registrar bus' }).click();
  await expect(page).toHaveURL(/\/flota\/\d+$/);
  return new URL(page.url()).pathname;
}

/** Cifra de la columna "Buses" de la flota por línea para la línea con ese nombre. */
export async function busesDeLaLinea(page: Page, nombre: string): Promise<number> {
  await page.goto('/flota/lineas');
  const fila = page.getByRole('row').filter({ hasText: nombre });
  await expect(fila.first()).toBeVisible();
  const celdas = await fila.first().getByRole('cell').allTextContents();
  return Number(celdas[4]);
}
