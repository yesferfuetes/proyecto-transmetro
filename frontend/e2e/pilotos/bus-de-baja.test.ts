import { expect, test } from '@playwright/test';
import {
  datosDePiloto,
  iniciarSesion,
  registrarBus,
  registrarParqueoConCupo,
  registrarPiloto,
  sufijoUnico,
} from './apoyo';

test('al dar de baja el bus, la ficha del piloto muestra el aviso', async ({ page }) => {
  const sufijo = sufijoUnico();
  await iniciarSesion(page, 'supervisor');
  const parqueo = await registrarParqueoConCupo(page, `P${sufijo}`);
  const placa = `E2E-${sufijo}`;
  const detalleDelBus = await registrarBus(page, placa, parqueo);
  const piloto = datosDePiloto(sufijo, 1, { placaDelBus: placa });
  const ficha = await registrarPiloto(page, piloto);
  await expect(page.getByText('El bus de este piloto está de baja.')).toHaveCount(0);

  await page.goto(detalleDelBus);
  await page.getByRole('combobox', { name: 'Estado del bus' }).selectOption({ label: 'De baja' });
  await page.getByRole('button', { name: 'Cambiar estado' }).click();
  await expect(page.getByText('Este bus está de baja.')).toBeVisible();

  // El piloto sigue asignado y la ficha lo avisa.
  await page.goto(ficha);
  await expect(page.getByText('El bus de este piloto está de baja.')).toBeVisible();
  await expect(page.getByText(placa).first()).toBeVisible();
  await page.goto(`/pilotos?busqueda=${encodeURIComponent(piloto.nombre)}`);
  await expect(page.getByRole('row').filter({ hasText: piloto.nombre })).toContainText(
    'Bus de baja',
  );
});
