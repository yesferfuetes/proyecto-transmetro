import { expect, test } from '@playwright/test';
import {
  filasDeLaTabla,
  generarReporte,
  gruposDeBuses,
  iniciarSesion,
  totalDeResultados,
} from './apoyo';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'supervisor');
});

test('el reporte de líneas trae las líneas con su flota y su fecha de generación', async ({
  page,
}) => {
  await generarReporte(page, 'Líneas');
  expect(await totalDeResultados(page)).toBeGreaterThanOrEqual(8);
  await expect(page.getByText('Generado el')).toBeVisible();
  await expect(filasDeLaTabla(page)).toHaveCount(await totalDeResultados(page));
  const estados = page.getByRole('table').getByText(/^(Completa|Insuficiente|Excedida)$/);
  await expect(estados.first()).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Longitud' })).toBeVisible();
});

test('el reporte de estaciones trae todas las estaciones con sus líneas', async ({ page }) => {
  await generarReporte(page, 'Estaciones');
  expect(await totalDeResultados(page)).toBeGreaterThanOrEqual(99);
  await expect(filasDeLaTabla(page)).toHaveCount(25);
  await expect(page.getByRole('navigation', { name: 'Paginación' })).toBeVisible();
  await page.getByRole('link', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/pagina=2/);
  await expect(filasDeLaTabla(page)).toHaveCount(25);
});

test('el reporte de buses coloca cada bus una vez y los grupos suman la flota', async ({
  page,
}) => {
  await generarReporte(page, 'Buses por línea');
  const total = await totalDeResultados(page);
  expect(total).toBeGreaterThanOrEqual(113);
  await expect(gruposDeBuses(page).first()).toBeVisible();
  const grupos = await gruposDeBuses(page).allTextContents();
  const suma = grupos.reduce((acumulado, texto) => {
    const cantidad = /(\d+) buses?$/.exec(texto.trim());
    return acumulado + Number(cantidad?.[1] ?? 0);
  }, 0);
  expect(suma).toBe(total);
});

test('llegar a un reporte sin constancia lleva a generarlo primero', async ({ page }) => {
  await page.goto('/reportes/lineas');
  await expect(page).toHaveURL(/\/reportes\?aviso=generar/);
  await expect(page.getByText('Genera el reporte primero')).toBeVisible();
});

test('el formulario muestra el rango de fechas desactivado con su aviso', async ({ page }) => {
  await page.goto('/reportes');
  await expect(page.getByLabel('Rango de fechas: desde')).toBeDisabled();
  await expect(page.getByLabel('Rango de fechas: hasta')).toBeDisabled();
  await expect(page.getByText('El reporte refleja el estado actual.')).toBeVisible();
});
