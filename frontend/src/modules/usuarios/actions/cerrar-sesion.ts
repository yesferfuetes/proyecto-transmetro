'use server';

import { redirect } from 'next/navigation';
import { borrarToken } from '@/shared/lib/sesion/cookie';

/** Termina la sesión en este navegador y lleva a iniciarla. */
export async function cerrarSesion(): Promise<void> {
  await borrarToken();
  redirect('/login');
}
