'use server';

import { redirect } from 'next/navigation';
import { errorDeEntrada, type EstadoDeAccion } from '@/shared/lib/acciones';
import { guardarToken } from '@/shared/lib/sesion/cookie';
import { crearSesion } from '../data/sesiones';
import { esquemaCredenciales } from '../schemas/sesion';

/** Pública: abre la sesión y lleva a Inicio. */
export async function iniciarSesion(entrada: unknown): Promise<EstadoDeAccion> {
  const credenciales = esquemaCredenciales.safeParse(entrada);
  if (!credenciales.success) {
    return errorDeEntrada(credenciales.error);
  }
  const resultado = await crearSesion(credenciales.data);
  if (!resultado.ok) {
    return { ok: false, error: resultado.error };
  }
  await guardarToken(resultado.datos.token, resultado.datos.expiraEn);
  redirect('/inicio');
}
