import { expect, test } from '@playwright/test';
import {
  ADMINISTRADOR,
  cerrarSesion,
  contrasenaSembrada,
  ESCRITORIO,
  iniciarSesion,
} from './apoyo';

test.use({ viewport: ESCRITORIO });

test.describe('cierre de sesión', () => {
  test('sin sesión, la vista de usuarios lleva a iniciar sesión', async ({ page }) => {
    await page.goto('/usuarios');
    await expect(page).toHaveURL(/\/login/);
  });

  test('tras cerrar sesión ya no se puede volver a una vista con sesión', async ({ page }) => {
    await iniciarSesion(page, ADMINISTRADOR, contrasenaSembrada());
    await page.goto('/usuarios');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Usuarios del sistema' }),
    ).toBeVisible();

    await cerrarSesion(page);

    await page.goto('/usuarios');
    await expect(page).toHaveURL(/\/login/);
    await page.goBack();
    await page.reload();
    await expect(page).toHaveURL(/\/login/);
  });
});
