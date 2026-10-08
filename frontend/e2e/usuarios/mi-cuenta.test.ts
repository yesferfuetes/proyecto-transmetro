import { expect, test } from '@playwright/test';
import {
  ADMINISTRADOR,
  cerrarSesion,
  contrasenaSembrada,
  ESCRITORIO,
  iniciarSesion,
  intentarIniciarSesion,
  registrarDesdeLaVista,
  violacionesGraves,
} from './apoyo';

test.use({ viewport: ESCRITORIO });

test.describe('mi cuenta', () => {
  test('cambia la propia contraseña y después solo entra con la nueva', async ({ page }) => {
    await iniciarSesion(page, ADMINISTRADOR, contrasenaSembrada());
    const usuario = await registrarDesdeLaVista(page, 'Supervisor municipal');
    await cerrarSesion(page);

    await iniciarSesion(page, usuario.correo, usuario.contrasena);
    await page.goto('/mi-cuenta');
    await expect(page.getByRole('heading', { level: 1, name: 'Mi cuenta' })).toBeVisible();
    await expect(page.getByText(usuario.correo)).toBeVisible();

    const nueva = `${usuario.contrasena}Otra7`;
    await page.getByLabel('Contraseña actual').fill(usuario.contrasena);
    await page.getByLabel('Contraseña nueva', { exact: true }).fill(nueva);
    await page.getByLabel('Repite la contraseña nueva').fill(nueva);
    await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
    await expect(page.getByText('Contraseña cambiada.')).toBeVisible();

    await cerrarSesion(page);
    expect(await intentarIniciarSesion(page, usuario.correo, usuario.contrasena)).not.toBe('');
    await iniciarSesion(page, usuario.correo, nueva);
  });

  test('con la contraseña actual incorrecta no cambia nada', async ({ page }) => {
    await iniciarSesion(page, ADMINISTRADOR, contrasenaSembrada());
    const usuario = await registrarDesdeLaVista(page, 'Supervisor municipal');
    await cerrarSesion(page);
    await iniciarSesion(page, usuario.correo, usuario.contrasena);

    await page.goto('/mi-cuenta');
    await page.getByLabel('Contraseña actual').fill('noEsLaMia1');
    await page.getByLabel('Contraseña nueva', { exact: true }).fill('Distinta123');
    await page.getByLabel('Repite la contraseña nueva').fill('Distinta123');
    await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
    await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toBeVisible();

    await cerrarSesion(page);
    await iniciarSesion(page, usuario.correo, usuario.contrasena);
  });

  test('la vista de mi cuenta no tiene violaciones graves ni críticas', async ({ page }) => {
    await iniciarSesion(page, ADMINISTRADOR, contrasenaSembrada());
    await page.goto('/mi-cuenta');
    expect(await violacionesGraves(page)).toEqual([]);
  });
});
