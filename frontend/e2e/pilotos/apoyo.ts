import { expect, type Locator, type Page } from '@playwright/test';

export {
  iniciarSesion,
  lineaConCupo,
  registrarBus,
  registrarParqueoConCupo,
  sufijoUnico,
  violacionesGraves,
} from '../flota/apoyo';

export type DatosDePiloto = Readonly<{
  nombre: string;
  dpi: string;
  direccion: string;
  telefono: string;
  historial: string;
  /** Placa del bus; sin ella el piloto se registra sin bus. */
  placaDelBus?: string;
}>;

/** DPI de 13 dígitos distinto en cada ejecución; `indice` separa los de una misma prueba. */
export function dpiUnico(indice: number): string {
  return `${String(Date.now()).slice(-12)}${indice}`;
}

/** Datos completos de un piloto de prueba; lo que se indique reemplaza lo predeterminado. */
export function datosDePiloto(
  sufijo: string,
  indice: number,
  cambio: Partial<DatosDePiloto> = {},
): DatosDePiloto {
  return {
    nombre: `Piloto E2E ${sufijo}${indice}`,
    dpi: dpiUnico(indice),
    direccion: '5a avenida 10-20, zona 1',
    telefono: '5555-1234',
    historial: 'Bachiller en ciencias y letras',
    ...cambio,
  };
}

/** El valor de la opción del bus con esa placa en el selector dado. */
export async function valorDeBus(selector: Locator, placa: string): Promise<string> {
  return (await selector.locator('option', { hasText: placa }).getAttribute('value')) ?? '';
}

/** Llena el formulario de registro y lo envía, sin esperar el resultado. */
export async function enviarRegistro(page: Page, datos: DatosDePiloto): Promise<void> {
  await page.goto('/pilotos/nuevo');
  await expect(page.getByRole('heading', { name: /Nuevo/ })).toBeVisible();
  await page.getByLabel('Nombre', { exact: true }).fill(datos.nombre);
  await page.getByLabel('DPI').fill(datos.dpi);
  await page.getByLabel('Teléfono').fill(datos.telefono);
  await page.getByLabel('Dirección de residencia').fill(datos.direccion);
  await page.getByLabel('Historial educativo').fill(datos.historial);
  if (datos.placaDelBus !== undefined) {
    const bus = page.getByRole('combobox', { name: /^Bus/ });
    await bus.selectOption(await valorDeBus(bus, datos.placaDelBus));
  }
  await page.getByRole('button', { name: 'Registrar piloto' }).click();
}

/** Registra un piloto y devuelve la ruta de su ficha. */
export async function registrarPiloto(page: Page, datos: DatosDePiloto): Promise<string> {
  await enviarRegistro(page, datos);
  await expect(page).toHaveURL(/\/pilotos\/\d+$/);
  return new URL(page.url()).pathname;
}

/** Cuántas filas del listado tienen ese nombre, buscado por nombre. */
export async function filasConNombre(page: Page, nombre: string): Promise<number> {
  await page.goto(`/pilotos?busqueda=${encodeURIComponent(nombre)}`);
  await expect(page.getByRole('table').or(page.getByText('Sin resultados'))).toBeVisible();
  return page.getByRole('row').filter({ hasText: nombre }).count();
}
