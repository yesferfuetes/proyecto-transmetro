import { expect, test } from '@playwright/test';
import {
  columna,
  filasDeLaTabla,
  generarReporte,
  gruposDeBuses,
  iniciarSesion,
  totalDeResultados,
} from './apoyo';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'supervisor');
});

test('el reporte de buses filtrado por la línea 1 solo trae sus buses y no los sin línea', async ({
  page,
}) => {
  await generarReporte(page, 'Buses por línea', { linea: /^L1 · / });
  await expect(page.getByText(/^Línea: .*Centro Cívico/)).toBeVisible();
  const grupos = gruposDeBuses(page);
  await expect(grupos).toHaveCount(1);
  await expect(grupos.first()).toContainText('Centro Cívico');
  await expect(page.getByRole('table').getByText('Sin línea')).toHaveCount(0);
  expect(await totalDeResultados(page)).toBeGreaterThan(0);
});

test('una estación que no pasa por la línea elegida deja el reporte vacío sin error', async ({
  page,
}) => {
  // Códigos de las estaciones de la línea 1 y de la primera página de todas las estaciones.
  await generarReporte(page, 'Estaciones', { linea: /^L1 · / });
  const deLaLinea = new Set(await columna(page, 0));
  await generarReporte(page, 'Estaciones');
  const codigos = await columna(page, 0);
  const ajena = codigos.find((codigo) => !deLaLinea.has(codigo));
  expect(ajena, 'una estación fuera de la línea 1 en la primera página').toBeDefined();

  await generarReporte(page, 'Líneas', {
    linea: /^L1 · /,
    estacion: new RegExp(`^${ajena ?? ''} ·`),
  });
  await expect(page.getByText('Sin resultados')).toBeVisible();
  await expect(page.getByText('0 resultados')).toBeVisible();
  await expect(filasDeLaTabla(page)).toHaveCount(0);
  await expect(page.locator('main').getByRole('alert')).toHaveCount(0);
});

test('el reporte de estaciones filtrado por municipalidad solo trae las de esa municipalidad', async ({
  page,
}) => {
  await generarReporte(page, 'Estaciones', { municipalidad: /^Guatemala$/ });
  const municipalidades = new Set(await columna(page, 2));
  expect(municipalidades.size).toBe(1);
  await expect(page.getByText(/Municipalidad: /)).toBeVisible();
});
