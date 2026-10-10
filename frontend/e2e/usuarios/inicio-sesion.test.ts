import { expect, test, type Page } from '@playwright/test';
import {
  ADMINISTRADOR,
  contrasenaSembrada,
  ESCRITORIO,
  iniciarSesion,
  intentarIniciarSesion,
  SUPERVISOR,
  violacionesGraves,
} from './apoyo';

test.use({ viewport: ESCRITORIO });

const OPERATIVOS = [
  'Líneas',
  'Estaciones',
  'Municipalidades',
  'Accesos',
  'Flota',
  'Pilotos',
  'Alertas',
];
const COMUNES = [...OPERATIVOS, 'Reportes'];

function navegacion(page: Page): ReturnType<Page['getByRole']> {
  return page.getByRole('navigation', { name: 'Principal' });
}

async function mosaicos(page: Page): Promise<string[]> {
  const enlaces = page.getByRole('region', { name: 'Accesos rápidos' }).getByRole('link');
  return (await enlaces.allInnerTexts()).map((texto) => texto.trim()).sort();
}

async function comprobarDestinos(page: Page, esperados: string[]): Promise<void> {
  for (const destino of ['Inicio', ...esperados]) {
    // Alertas puede llevar su contador de pendientes en el nombre accesible.
    const nombre = new RegExp(`^${destino}(, \\d+ pendientes?)?$`);
    await expect(navegacion(page).getByRole('link', { name: nombre })).toBeVisible();
  }
  expect(await mosaicos(page)).toEqual([...esperados].sort());
}

/** Un operador sembrado: el administrador lo busca en el listado filtrado por rol. */
async function correoDeUnOperador(page: Page): Promise<string> {
  await iniciarSesion(page, ADMINISTRADOR, contrasenaSembrada());
  await page.goto('/usuarios?rol=OPERADOR_ESTACION&activo=true');
  const correo = page.getByRole('table').getByRole('row').nth(1).getByRole('cell').nth(1);
  const texto = (await correo.textContent())?.trim() ?? '';
  await page.context().clearCookies();
  return texto;
}

test.describe('inicio de sesión', () => {
  test('el administrador llega a Inicio, ve su nombre y rol, y tiene Usuarios', async ({
    page,
  }) => {
    await iniciarSesion(page, ADMINISTRADOR, contrasenaSembrada());

    await expect(navegacion(page)).toContainText('Administrador');
    await comprobarDestinos(page, [...COMUNES, 'Usuarios']);
  });

  test('el supervisor llega a Inicio sin Usuarios en el menú ni en los mosaicos', async ({
    page,
  }) => {
    await iniciarSesion(page, SUPERVISOR, contrasenaSembrada());

    await expect(navegacion(page)).toContainText('Supervisor municipal');
    await comprobarDestinos(page, COMUNES);
    await expect(navegacion(page).getByRole('link', { name: 'Usuarios' })).toHaveCount(0);
  });

  test('el operador no ve Usuarios y al abrir la vista ve acceso denegado', async ({ page }) => {
    const correo = await correoDeUnOperador(page);
    await iniciarSesion(page, correo, contrasenaSembrada());

    await expect(navegacion(page)).toContainText('Operador de estación');
    await comprobarDestinos(page, OPERATIVOS);
    await expect(navegacion(page).getByRole('link', { name: 'Usuarios' })).toHaveCount(0);
    await expect(navegacion(page).getByRole('link', { name: 'Reportes' })).toHaveCount(0);

    await page.goto('/usuarios');
    await expect(page).toHaveURL(/\/acceso-denegado$/);
    await expect(
      page.getByRole('heading', { name: 'Esta función no está disponible para tu rol' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Volver al inicio' }).click();
    await expect(page).toHaveURL(/\/inicio$/);
  });

  test('las credenciales inválidas muestran el mismo error exista o no el correo', async ({
    page,
  }) => {
    const sinCuenta = await intentarIniciarSesion(page, 'nadie@transmetro.test', 'clave1234');
    const contrasenaMala = await intentarIniciarSesion(page, ADMINISTRADOR, 'incorrecta123');

    expect(sinCuenta).not.toBe('');
    expect(contrasenaMala).toBe(sinCuenta);
  });

  test('con campos vacíos indica lo que falta sin salir de la vista', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByLabel('Correo')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Escribe tu contraseña.')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('con sesión abierta, /login lleva a Inicio', async ({ page }) => {
    await iniciarSesion(page, SUPERVISOR, contrasenaSembrada());
    await page.goto('/login');
    await expect(page).toHaveURL(/\/inicio$/);
  });

  test('la vista de inicio de sesión no tiene violaciones graves ni críticas', async ({ page }) => {
    await page.goto('/login');
    expect(await violacionesGraves(page)).toEqual([]);
  });
});
