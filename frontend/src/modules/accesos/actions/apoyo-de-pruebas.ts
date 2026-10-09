import { revalidatePath } from 'next/cache';
import { vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { sesionDe } from './sesiones-de-prueba';

/**
 * Las pruebas de acciones simulan `cookie` y `cliente-backend` con `vi.mock`; esto deja la sesión
 * del rol indicado.
 */
export function comoRol(rol: Rol): void {
  vi.mocked(leerToken).mockResolvedValue('tok');
  vi.mocked(solicitar).mockResolvedValue(sesionDe(rol));
}

export function rutasInvalidadas(): unknown[] {
  return vi.mocked(revalidatePath).mock.calls.map(([ruta]) => ruta);
}
