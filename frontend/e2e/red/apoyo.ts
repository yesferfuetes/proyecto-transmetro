import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page } from '@playwright/test';

/** Usuarios sembrados; el operador es el de la primera estación de la línea 1 (San Sebastián). */
export const USUARIOS = {
  administrador: 'admin@transmetro.test',
  supervisor: 'supervisor@transmetro.test',
  operador: 'operador.e001@transmetro.test',
} as const;

/** Sufijo por ejecución: 4 dígitos de la marca de tiempo, para que los códigos quepan en 10. */
export function sufijoUnico(): string {
  return String(Date.now()).slice(-4);
}

export async function iniciarSesion(page: Page, usuario: keyof typeof USUARIOS): Promise<void> {
  const contrasena = process.env.E2E_CONTRASENA;
  if (!contrasena) {
    throw new Error('Define E2E_CONTRASENA con la contraseña de los usuarios sembrados.');
  }
  await page.goto('/login');
  await page.getByLabel('Correo').fill(USUARIOS[usuario]);
  await page.getByLabel('Contraseña', { exact: true }).fill(contrasena);
  await page.getByRole('button', { name: /iniciar sesión|entrar/i }).click();
  await expect(page).toHaveURL(/\/inicio/);
}

/** Avanza por la paginación hasta que el localizador aparece en la página. */
export async function buscarEnPaginas(page: Page, objetivo: Locator): Promise<void> {
  for (;;) {
    // La página termina de cargar cuando su tabla aparece; antes solo está el esqueleto.
    await page.getByRole('table').first().waitFor();
    if ((await objetivo.count()) > 0) {
      return;
    }
    const siguiente = page.getByRole('navigation', { name: 'Paginación' }).getByRole('link', {
      name: 'Siguiente',
    });
    if ((await siguiente.count()) === 0) {
      throw new Error('No se encontró el elemento en ninguna página del listado.');
    }
    await siguiente.click();
    await page.waitForLoadState();
  }
}

export async function violacionesGraves(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter((violacion) => violacion.impact === 'serious' || violacion.impact === 'critical')
    .map((violacion) => `${violacion.id}: ${violacion.nodes.map((n) => n.target).join(', ')}`);
}

/** Registra una estación con el formulario y devuelve su id, tomado de la ruta del detalle. */
export async function registrarEstacion(
  page: Page,
  codigo: string,
  nombre: string,
): Promise<number> {
  await page.goto('/estaciones/nueva');
  await page.getByLabel('Código').fill(codigo);
  await page.getByLabel('Nombre').fill(nombre);
  await page.getByLabel('Municipalidad').selectOption({ label: 'Guatemala' });
  await page.getByRole('button', { name: 'Registrar estación' }).click();
  await expect(page).toHaveURL(/\/estaciones\/\d+$/);
  return Number(new URL(page.url()).pathname.split('/').pop());
}

export const KM = (texto: string): RegExp => new RegExp(`${texto.replace('.', '[.,]')} km`);

/** Espera a que React tome el formulario: una pulsación antes de hidratar se pierde. */
export async function esperarHidratacion(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const formulario = document.querySelector('main form');
    return (
      formulario !== null && Object.keys(formulario).some((clave) => clave.startsWith('__react'))
    );
  });
}
