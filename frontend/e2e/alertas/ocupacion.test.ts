import { expect, test } from '@playwright/test';
import { abrirRegistro, atenderPendientesDe, elegirBus, iniciarSesion, registrar } from './apoyo';

test('el operador registra una baja ocupación, una normal y una repetida', async ({ page }) => {
  await iniciarSesion(page, 'operador');
  await abrirRegistro(page);
  const bus = await elegirBus(page, 'Ocupación', 2);
  await atenderPendientesDe(page, bus.placa);

  // Cero pasajeros a bordo: baja ocupación con su aviso de espera.
  await abrirRegistro(page);
  await elegirBus(page, 'Ocupación', 2);
  await registrar(page, 'Ocupación', 0);
  await expect(page).toHaveURL(/\/alertas\?resaltada=\d+/);
  const fila = page.getByRole('row').filter({ hasText: bus.placa }).first();
  await expect(fila.getByText('Baja ocupación')).toBeVisible();
  await expect(fila.getByText(/5 minutos/)).toBeVisible();

  // Una cifra normal no genera alerta.
  await abrirRegistro(page);
  await elegirBus(page, 'Ocupación', 2);
  await registrar(page, 'Ocupación', Math.floor(bus.capacidad / 2));
  await expect(page.getByText('No corresponde alerta')).toBeVisible();

  // Repetir la baja ocupación mientras la primera sigue pendiente solo avisa.
  await registrar(page, 'Ocupación', 0);
  await expect(
    page.getByText('Ya hay una alerta pendiente para este bus en tu estación.'),
  ).toBeVisible();
  await expect(page.locator('main').getByRole('alert')).toHaveCount(0);

  await atenderPendientesDe(page, bus.placa);
});
