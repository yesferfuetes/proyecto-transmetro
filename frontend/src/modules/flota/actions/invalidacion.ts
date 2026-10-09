import 'server-only';
import { revalidatePath } from 'next/cache';

/** Cualquier cambio de flota puede alterar las cuatro vistas: buses, detalle, líneas y parqueos. */
export function invalidarFlota(busId?: number): void {
  revalidatePath('/flota');
  if (busId !== undefined) {
    revalidatePath(`/flota/${busId}`);
  }
  revalidatePath('/flota/lineas');
  revalidatePath('/flota/parqueos');
}
