import { expect, type Page } from '@playwright/test';

import { esperarHidratacion } from '../red/apoyo';

export { esperarHidratacion, iniciarSesion, violacionesGraves } from '../red/apoyo';

export type BusElegido = Readonly<{ placa: string; capacidad: number }>;

/** Tiempo con que una alerta de otra sesión debe aparecer: el límite es de 10 s. */
export const ESPERA_DE_SESION_AJENA_MS = 12000;

/** Abre el registro de lecturas y espera a que React tome los formularios. */
export async function abrirRegistro(page: Page): Promise<void> {
  await page.goto('/alertas/registrar');
  await esperarHidratacion(page);
}

/**
 * Elige el bus de la posición dada (con vuelta si hay menos) en el formulario indicado. Cada
 * prueba usa una posición distinta para no pisar las alertas de otra que corre en paralelo.
 */
export async function elegirBus(
  page: Page,
  formulario: 'Demanda' | 'Ocupación',
  posicion: number,
): Promise<BusElegido> {
  const region = page.getByRole('region', { name: new RegExp(formulario) });
  const selector = region.getByRole('combobox', { name: 'Bus' });
  const opciones = (await selector.locator('option').all()).slice(1);
  const opcion = opciones[posicion % opciones.length];
  if (opcion === undefined) {
    throw new Error('El operador no tiene buses para registrar lecturas.');
  }
  const texto = (await opcion.textContent()) ?? '';
  await selector.selectOption((await opcion.getAttribute('value')) ?? '');
  const capacidad = /capacidad (\d+)/.exec(texto)?.[1];
  return { placa: texto.split(' · ')[0] ?? '', capacidad: Number(capacidad) };
}

/** Escribe la cifra y envía el formulario indicado. */
export async function registrar(
  page: Page,
  formulario: 'Demanda' | 'Ocupación',
  pasajeros: number,
): Promise<void> {
  const region = page.getByRole('region', { name: new RegExp(formulario) });
  await region.getByRole('spinbutton').fill(String(pasajeros));
  await region.getByRole('button', { name: /^Registrar/ }).click();
}

/** Atiende todas las alertas pendientes del bus, para que la prueba pueda repetirse. */
export async function atenderPendientesDe(page: Page, placa: string): Promise<void> {
  await page.goto('/alertas?estado=pendiente');
  await page.getByRole('table').or(page.getByText('Aún no hay alertas')).first().waitFor();
  await esperarHidratacion(page);
  const boton = page.getByRole('button', { name: `Atender alerta del bus ${placa}` });
  while ((await boton.count()) > 0) {
    await boton.first().click();
    await expect(boton)
      .toHaveCount(0, { timeout: 5000 })
      .catch(() => undefined);
    await page.reload();
  }
}
