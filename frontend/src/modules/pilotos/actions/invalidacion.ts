import 'server-only';
import { revalidatePath } from 'next/cache';

/** Cualquier cambio de un piloto altera el listado y su ficha. */
export function invalidarPilotos(pilotoId: number): void {
  revalidatePath('/pilotos');
  revalidatePath(`/pilotos/${pilotoId}`);
}
