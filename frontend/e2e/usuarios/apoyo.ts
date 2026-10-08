import AxeBuilder from '@axe-core/playwright';
import { expect, type Browser, type Page } from '@playwright/test';

export const ESCRITORIO = { width: 1280, height: 800 };

export const ADMINISTRADOR = 'admin@transmetro.test';
export const SUPERVISOR = 'supervisor@transmetro.test';

/** Contraseña de los usuarios sembrados; la misma que recibió la semilla. */
export function contrasenaSembrada(): string {
  const valor = process.env.E2E_CONTRASENA;
  if (!valor) {
    throw new Error('Falta E2E_CONTRASENA: la contraseña con la que se sembraron los usuarios.');
  }
  return valor;
}

/** Sufijo para que los datos que crea cada prueba no choquen al repetir la suite. */
export function sufijoUnico(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export async function iniciarSesion(page: Page, correo: string, contrasena: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Correo').fill(correo);
  await page.getByLabel('Contraseña', { exact: true }).fill(contrasena);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/inicio$/);
}

export async function intentarIniciarSesion(
  page: Page,
  correo: string,
  contrasena: string,
): Promise<string> {
  await page.goto('/login');
  await page.getByLabel('Correo').fill(correo);
  await page.getByLabel('Contraseña', { exact: true }).fill(contrasena);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  const alerta = page.getByRole('alert').filter({ hasText: /\S/ });
  await expect(alerta).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
  return (await alerta.textContent()) ?? '';
}

export async function cerrarSesion(page: Page): Promise<void> {
  await page
    .getByRole('navigation', { name: 'Principal' })
    .getByRole('button', { name: 'Cerrar sesión' })
    .click();
  await expect(page).toHaveURL(/\/login$/);
}

/** Página nueva con su propia sesión, como otra computadora. */
export async function otraComputadora(browser: Browser): Promise<Page> {
  const contexto = await browser.newContext({ viewport: ESCRITORIO });
  return contexto.newPage();
}

export type UsuarioDePrueba = Readonly<{ nombre: string; correo: string; contrasena: string }>;

/** Registra un usuario desde la vista de usuarios con la sesión del administrador abierta. */
export async function registrarDesdeLaVista(
  page: Page,
  rol: 'Operador de estación' | 'Supervisor municipal',
): Promise<UsuarioDePrueba> {
  const sufijo = sufijoUnico();
  const usuario = {
    nombre: `Prueba ${sufijo}`,
    correo: `prueba.${sufijo}@transmetro.test`,
    contrasena: `Clave${sufijo}`,
  };
  await page.goto('/usuarios');
  await page.getByRole('link', { name: 'Nuevo usuario' }).click();
  await page.getByLabel('Nombre completo').fill(usuario.nombre);
  await page.getByLabel('Correo').fill(usuario.correo);
  await page.getByLabel('Rol').selectOption({ label: rol });
  if (rol === 'Operador de estación') {
    await page.getByLabel('Estación').selectOption({ index: 1 });
  }
  await page.getByLabel('Contraseña inicial').fill(usuario.contrasena);
  await page.getByRole('button', { name: 'Registrar usuario' }).click();
  await expect(page).toHaveURL(/\/usuarios$/);
  return usuario;
}

/** Abre el detalle de un usuario buscándolo por su correo en el listado. */
export async function abrirUsuario(page: Page, usuario: UsuarioDePrueba): Promise<void> {
  await page.goto(`/usuarios?busqueda=${encodeURIComponent(usuario.correo)}`);
  await page.getByRole('link', { name: `Abrir ${usuario.nombre}` }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Editar usuario' })).toBeVisible();
}

export async function violacionesGraves(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter((violacion) => violacion.impact === 'serious' || violacion.impact === 'critical')
    .map((violacion) => `${violacion.id}: ${violacion.nodes.map((n) => n.target).join(', ')}`);
}
