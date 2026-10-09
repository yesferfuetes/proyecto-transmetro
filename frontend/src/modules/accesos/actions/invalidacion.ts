import 'server-only';
import { revalidatePath } from 'next/cache';

/** Un acceso cambia lo que muestran su detalle, el listado de accesos y los conteos de guardias. */
export function invalidarAcceso(id: number): void {
  revalidatePath('/accesos');
  revalidatePath(`/accesos/${id}`);
  revalidatePath('/guardias');
}

export function invalidarGuardias(): void {
  revalidatePath('/guardias');
}
