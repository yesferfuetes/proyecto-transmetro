import { expect, test, type Page } from '@playwright/test';
import { iniciarSesion, KM, registrarEstacion, sufijoUnico } from './apoyo';

async function agregarParada(page: Page, codigo: string): Promise<void> {
  const buscador = page.getByRole('combobox', { name: 'Agregar estación al final' });
  await buscador.fill(codigo);
  await expect(page.getByRole('option', { name: new RegExp(codigo) })).toBeVisible();
  await buscador.press('Enter');
}

const longitudAlGuardar = (page: Page): ReturnType<Page['getByText']> =>
  page.getByText(/Longitud al guardar/);

const longitudTotal = (page: Page): ReturnType<Page['getByText']> =>
  page.getByText('Longitud total').locator('xpath=following-sibling::dd');

test('el supervisor arma, activa y corrige el recorrido de una línea', async ({ page }) => {
  const sufijo = sufijoUnico();
  const codigoLinea = `E2E${sufijo}`;
  const [a, b, c] = ['A', 'B', 'C'].map((letra) => `R${sufijo}${letra}`) as [
    string,
    string,
    string,
  ];
  await iniciarSesion(page, 'supervisor');
  for (const codigo of [a, b, c]) {
    await registrarEstacion(page, codigo, `Parada ${codigo}`);
  }

  // Registrar la línea en construcción.
  await page.goto('/lineas/nueva');
  await page.getByLabel('Código').fill(codigoLinea);
  await page.getByLabel('Nombre').fill(`Línea de prueba ${sufijo}`);
  await page.getByLabel('Municipalidad').selectOption({ label: 'Guatemala' });
  await page.getByLabel('Estado inicial').selectOption({ label: 'En construcción' });
  await page.getByRole('button', { name: 'Registrar línea' }).click();
  await expect(page).toHaveURL(/\/lineas\/\d+$/);
  const detalle = new URL(page.url()).pathname;
  await expect(page.getByText('En construcción').first()).toBeVisible();

  // Recorrido de tres estaciones: 1.200 + 0.800 = 2.000.
  await page.getByRole('link', { name: 'Editar recorrido' }).click();
  for (const codigo of [a, b, c]) {
    await agregarParada(page, codigo);
  }
  await page.getByLabel(`Distancia de ${a} a la siguiente`).fill('1.2');
  await page.getByLabel(`Distancia de ${b} a la siguiente`).fill('0.8');
  await expect(page.getByLabel(`Distancia de ${c} a la siguiente`)).toBeDisabled();
  await expect(longitudAlGuardar(page)).toContainText(KM('2.000'));
  await page.getByRole('button', { name: 'Guardar recorrido' }).click();
  await expect(page).toHaveURL(new RegExp(`${detalle}$`));
  await expect(longitudTotal(page)).toHaveText(KM('2.000'));

  // Activarla.
  await page.getByLabel('Estado de la línea').selectOption({ label: 'Activa' });
  await page.getByRole('button', { name: 'Cambiar estado' }).click();
  await expect(page.getByText('Estado actualizado.')).toBeVisible();

  // Reordenar: la última sube un lugar y recibe su distancia; 1.200 + 0.200 = 1.400.
  await page.getByRole('link', { name: 'Editar recorrido' }).click();
  await page.getByRole('button', { name: `Subir ${c} Parada ${c}` }).focus();
  await page.keyboard.press('Enter');
  await page.getByLabel(`Distancia de ${c} a la siguiente`).fill('0.2');
  await expect(page.getByLabel(`Distancia de ${b} a la siguiente`)).toBeDisabled();
  await expect(longitudAlGuardar(page)).toContainText(KM('1.400'));
  await page.getByRole('button', { name: 'Guardar recorrido' }).click();
  await expect(page).toHaveURL(new RegExp(`${detalle}$`));
  await expect(longitudTotal(page)).toHaveText(KM('1.400'));

  // Quitar una estación que no está en otra línea: el backend lo rechaza y nada cambia.
  await page.getByRole('link', { name: 'Editar recorrido' }).click();
  await page.getByRole('button', { name: `Quitar ${b} Parada ${b}` }).click();
  await page.getByRole('button', { name: 'Guardar recorrido' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/recorrido$/);

  await page.goto(detalle);
  const paradas = page.getByRole('list', { name: /^Recorrido de / }).getByRole('listitem');
  await expect(paradas).toHaveCount(3);
  await expect(longitudTotal(page)).toHaveText(KM('1.400'));
});
