import { expect, type Page } from '@playwright/test';

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
  const opciones = await page
    .getByRole('combobox', { name: 'Línea del bus' })
    .locator('option')
    .all();
  for (const opcion of opciones) {
    const etiqueta = (await opcion.textContent()) ?? '';
    const cifras = /\((\d+) de (\d+) buses\)/.exec(etiqueta);
    const valor = (await opcion.getAttribute('value')) ?? '';
    if (cifras && valor !== '') {
      const [buses, maximo] = [Number(cifras[1]), Number(cifras[2])];
      // El mínimo es la mitad del máximo; con uno más sobre él, la baja posterior es válida.
      if (buses >= maximo / 2 && buses < maximo) {
        return { valor, etiqueta, buses };
      }
    }
  }
  throw new Error('Ninguna línea tiene cupo para un bus más.');
}

/** Registra un bus con el formulario, sin línea, y devuelve su ruta de detalle. */
export async function registrarBus(page: Page, placa: string): Promise<string> {
  await page.goto('/flota/nuevo');
  await page.getByLabel('Placa').fill(placa);
  await page.getByLabel('Capacidad máxima').fill('120');
  await page.getByRole('combobox', { name: 'Parqueo' }).selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Registrar bus' }).click();
  await expect(page).toHaveURL(/\/flota\/\d+$/);
  return new URL(page.url()).pathname;
}

/** Cifra de la columna "Buses" de la flota por línea para la línea con ese nombre. */
export async function busesDeLaLinea(page: Page, nombre: string): Promise<number> {
  await page.goto('/flota/lineas');
  const fila = page.getByRole('row').filter({ hasText: nombre });
  const celdas = await fila.first().getByRole('cell').allTextContents();
  return Number(celdas[4]);
}
