import { expect, test } from '@playwright/test';
import {
  abrirRegistro,
  atenderPendientesDe,
  elegirBus,
  ESPERA_DE_SESION_AJENA_MS,
  iniciarSesion,
  registrar,
} from './apoyo';

test('el supervisor ve aparecer la alerta del operador sin recargar y luego la ve atendida', async ({
  browser,
}) => {
  const operador = await (await browser.newContext()).newPage();
  const supervisor = await (await browser.newContext()).newPage();
  await iniciarSesion(operador, 'operador');
  await iniciarSesion(supervisor, 'supervisor');

  await abrirRegistro(operador);
  const bus = await elegirBus(operador, 'Demanda', 1);
  await atenderPendientesDe(operador, bus.placa);

  // El supervisor deja abierta la lista y no la recarga.
  await supervisor.goto('/alertas');
  await expect(supervisor.getByRole('heading', { name: /Alertas/ })).toBeVisible();

  // El operador registra una demanda del doble de la capacidad: sobrecupo.
  await abrirRegistro(operador);
  const elegido = await elegirBus(operador, 'Demanda', 1);
  await registrar(operador, 'Demanda', elegido.capacidad * 2);
  await expect(operador).toHaveURL(/\/alertas\?resaltada=\d+/);
  const filaDelOperador = operador.getByRole('row').filter({ hasText: elegido.placa });
  await expect(filaDelOperador.getByText('Sobrecupo')).toBeVisible();

  // La alerta aparece en la sesión del supervisor dentro del límite, sin recargar.
  const filaDelSupervisor = supervisor.getByRole('row').filter({ hasText: elegido.placa });
  await expect(filaDelSupervisor.getByText('Pendiente')).toBeVisible({
    timeout: ESPERA_DE_SESION_AJENA_MS,
  });
  await expect(supervisor.getByRole('button', { name: /Atender/ })).toHaveCount(0);

  // El operador la atiende y el supervisor la ve atendida.
  await filaDelOperador.getByRole('button', { name: /Atender/ }).click();
  await expect(filaDelOperador.getByText('Atendida')).toBeVisible();
  await expect(filaDelSupervisor.getByText('Atendida')).toBeVisible({
    timeout: ESPERA_DE_SESION_AJENA_MS,
  });

  await atenderPendientesDe(operador, elegido.placa);
});
