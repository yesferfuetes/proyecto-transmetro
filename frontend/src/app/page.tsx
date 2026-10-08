import { redirect } from 'next/navigation';
import { obtenerSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: decide según la sesión.
export const dynamic = 'force-dynamic';

/** La raíz no tiene contenido propio: lleva a Inicio con sesión y a iniciarla sin ella. */
export default async function Raiz(): Promise<never> {
  redirect((await obtenerSesion()) === null ? '/login' : '/inicio');
}
