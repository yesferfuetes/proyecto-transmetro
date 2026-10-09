import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

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

/** DPI de 13 dígitos distinto en cada ejecución; `desplazamiento` separa los de un mismo caso. */
export function dpiUnico(desplazamiento = 0): string {
  return String(Date.now() + desplazamiento).padStart(13, '0');
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

export async function violacionesGraves(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter((violacion) => violacion.impact === 'serious' || violacion.impact === 'critical')
    .map((violacion) => `${violacion.id}: ${violacion.nodes.map((n) => n.target).join(', ')}`);
}

/** Espera a que React tome el formulario: una pulsación antes de hidratar se pierde. */
export async function esperarHidratacion(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const formulario = document.querySelector('main form');
    return (
      formulario !== null && Object.keys(formulario).some((clave) => clave.startsWith('__react'))
    );
  });
}

/** Registra un guardia con el formulario; termina en el listado de guardias. */
export async function registrarGuardia(page: Page, nombre: string, dpi: string): Promise<void> {
  await page.goto('/guardias/nuevo');
  await esperarHidratacion(page);
  await page.getByLabel('Nombre').fill(nombre);
  await page.getByLabel('DPI').fill(dpi);
  await page.getByRole('button', { name: 'Registrar guardia' }).click();
  await expect(page).toHaveURL(/\/guardias$/);
}

/** Elige en una lista el guardia cuyo texto contiene el nombre (la opción también trae el DPI). */
export async function elegirGuardia(page: Page, nombre: string): Promise<void> {
  const valor = await page
    .getByLabel('Guardia', { exact: true })
    .locator('option', { hasText: nombre })
    .getAttribute('value');
  if (valor === null) {
    throw new Error(`No hay un guardia llamado ${nombre} en la lista.`);
  }
  await page.getByLabel('Guardia', { exact: true }).selectOption(valor);
}
