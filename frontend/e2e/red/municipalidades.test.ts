import { expect, test } from '@playwright/test';
import { buscarEnPaginas, iniciarSesion, sufijoUnico } from './apoyo';

test('el administrador registra una municipalidad y la ve como "sin red"', async ({ page }) => {
  const nombre = `A E2E ${sufijoUnico()}`;
  await iniciarSesion(page, 'administrador');

  await page.goto('/municipalidades');
  await page.getByRole('link', { name: 'Nueva municipalidad' }).click();
  await page.getByLabel('Nombre').fill(nombre);
  await page.getByLabel(/Departamento/).fill('Guatemala');
  await page.getByRole('button', { name: 'Registrar municipalidad' }).click();

  await expect(page).toHaveURL(/\/municipalidades$/);
  const fila = page.getByRole('row').filter({ hasText: nombre });
  await buscarEnPaginas(page, fila);
  await expect(fila.getByText('Sin red')).toBeVisible();
});
