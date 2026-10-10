import { BusDePilotoDeBaja, BusDePilotoNoExiste } from '../errors/errores-de-pilotos';
import type { FlotaAdapter } from '../infrastructure/adapters/flota.adapter';

/** El bus existe y no está de baja; en mantenimiento sí se admite. */
export async function exigirBusAsignable(flota: FlotaAdapter, busId: number): Promise<void> {
  const bus = await flota.obtenerBus(busId);
  if (!bus) {
    throw new BusDePilotoNoExiste();
  }
  if (bus.estado === 'BAJA') {
    throw new BusDePilotoDeBaja();
  }
}
