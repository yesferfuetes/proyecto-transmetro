import { expect, test } from '@playwright/test';
import {
  datosDePiloto,
  enviarRegistro,
  filasConNombre,
  iniciarSesion,
  registrarPiloto,
  sufijoUnico,
} from './apoyo';

test('los datos inválidos o repetidos muestran su error y no crean al piloto', async ({ page }) => {
  const sufijo = sufijoUnico();
  await iniciarSesion(page, 'supervisor');
  const existente = datosDePiloto(sufijo, 1);
  await registrarPiloto(page, existente);

  const casos = [
    {
      datos: datosDePiloto(sufijo, 2, { dpi: existente.dpi }),
      error: page.getByRole('alert'),
    },
    {
      datos: datosDePiloto(sufijo, 3, { dpi: existente.dpi.slice(0, 12) }),
      error: page.getByText('El DPI tiene 13 dígitos.', { exact: true }),
    },
    {
      datos: datosDePiloto(sufijo, 4, { telefono: '5555-123' }),
      error: page.getByText('El teléfono tiene 8 dígitos.', { exact: true }),
    },
    {
      datos: datosDePiloto(sufijo, 5, { direccion: '' }),
      error: page.getByText('Escribe la dirección de residencia.', { exact: true }),
    },
  ];
  for (const { datos, error } of casos) {
    await enviarRegistro(page, datos);
    await expect(error.first()).toBeVisible();
    await expect(page).toHaveURL(/\/pilotos\/nuevo$/);
    expect(await filasConNombre(page, datos.nombre), datos.nombre).toBe(0);
  }
});
