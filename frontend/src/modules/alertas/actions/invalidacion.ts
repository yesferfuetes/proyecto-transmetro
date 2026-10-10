import 'server-only';
import { revalidatePath } from 'next/cache';

/** Una lectura nueva o una atención cambian la lista de alertas. */
export function invalidarAlertas(): void {
  revalidatePath('/alertas');
}
