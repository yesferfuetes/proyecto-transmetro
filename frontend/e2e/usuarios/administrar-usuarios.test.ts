import { expect, test } from '@playwright/test';
import {
  abrirUsuario,
  ADMINISTRADOR,
  contrasenaSembrada,
  ESCRITORIO,
  iniciarSesion,
  intentarIniciarSesion,
  otraComputadora,
  registrarDesdeLaVista,
  violacionesGraves,
} from './apoyo';

test.use({ viewport: ESCRITORIO });

test.describe('administración de usuarios', () => {
  test.beforeEach(async ({ page }) => {
    await iniciarSesion(page, ADMINISTRADOR, contrasenaSembrada());
  });

  test('registra un operador con estación y el operador puede entrar', async ({
    page,
    browser,
  }) => {
    const operador = await registrarDesdeLaVista(page, 'Operador de estación');

    await page.goto(`/usuarios?busqueda=${encodeURIComponent(operador.correo)}`);
    const fila = page.getByRole('row', { name: new RegExp(operador.nombre) });
    await expect(fila).toContainText('Operador de estación');
    await expect(fila).toContainText('Activo');

    const otra = await otraComputadora(browser);
    await iniciarSesion(otra, operador.correo, operador.contrasena);
    await expect(otra.getByRole('navigation', { name: 'Principal' })).toContainText(
      operador.nombre,
    );
  });

  test('cambia el rol de un operador a supervisor y se le retira la estación', async ({ page }) => {
    const operador = await registrarDesdeLaVista(page, 'Operador de estación');
    await abrirUsuario(page, operador);

    await page.getByLabel('Rol').selectOption({ label: 'Supervisor municipal' });
    await expect(page.getByLabel('Estación')).toHaveCount(0);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Cambios guardados.')).toBeVisible();

    await page.goto(`/usuarios?busqueda=${encodeURIComponent(operador.correo)}`);
    const fila = page.getByRole('row', { name: new RegExp(operador.nombre) });
    await expect(fila).toContainText('Supervisor municipal');
    await expect(fila).toContainText('—');
  });

  test('desactiva a un usuario, que ya no entra, y al reactivarlo entra de nuevo', async ({
    page,
    browser,
  }) => {
    const usuario = await registrarDesdeLaVista(page, 'Supervisor municipal');
    await abrirUsuario(page, usuario);

    await page.getByRole('button', { name: 'Desactivar' }).click();
    const dialogo = page.getByRole('dialog', { name: `¿Desactivar a ${usuario.nombre}?` });
    await dialogo.getByRole('button', { name: 'Desactivar' }).click();
    await expect(page.getByText('Usuario desactivado.')).toBeVisible();

    const otra = await otraComputadora(browser);
    expect(await intentarIniciarSesion(otra, usuario.correo, usuario.contrasena)).not.toBe('');

    await page.getByRole('button', { name: 'Reactivar' }).click();
    await expect(page.getByText('Usuario reactivado.')).toBeVisible();
    await iniciarSesion(otra, usuario.correo, usuario.contrasena);
  });

  test('asigna una contraseña nueva: la anterior deja de servir y la nueva entra', async ({
    page,
    browser,
  }) => {
    const usuario = await registrarDesdeLaVista(page, 'Supervisor municipal');
    await abrirUsuario(page, usuario);
    const nueva = `${usuario.contrasena}Nueva9`;

    await page.getByRole('textbox', { name: 'Contraseña nueva', exact: true }).fill(nueva);
    await page.getByLabel('Repite la contraseña nueva').fill(nueva);
    await page.getByRole('button', { name: 'Asignar contraseña' }).click();
    await expect(page.getByText('Contraseña asignada.')).toBeVisible();

    const otra = await otraComputadora(browser);
    expect(await intentarIniciarSesion(otra, usuario.correo, usuario.contrasena)).not.toBe('');
    await iniciarSesion(otra, usuario.correo, nueva);
  });

  test('al desactivar a un usuario con sesión abierta, su siguiente acción lo saca', async ({
    page,
    browser,
  }) => {
    const usuario = await registrarDesdeLaVista(page, 'Supervisor municipal');
    const otra = await otraComputadora(browser);
    await iniciarSesion(otra, usuario.correo, usuario.contrasena);

    await abrirUsuario(page, usuario);
    await page.getByRole('button', { name: 'Desactivar' }).click();
    await page
      .getByRole('dialog', { name: `¿Desactivar a ${usuario.nombre}?` })
      .getByRole('button', { name: 'Desactivar' })
      .click();
    await expect(page.getByText('Usuario desactivado.')).toBeVisible();

    await otra.goto('/mi-cuenta');
    await expect(otra).toHaveURL(/\/login\?motivo=expirada$/);
    await expect(otra.getByText('Tu sesión terminó.')).toBeVisible();
  });

  test('la vista de usuarios no tiene violaciones graves ni críticas', async ({ page }) => {
    await page.goto('/usuarios');
    await expect(page.getByRole('table')).toBeVisible();
    expect(await violacionesGraves(page)).toEqual([]);
  });
});
