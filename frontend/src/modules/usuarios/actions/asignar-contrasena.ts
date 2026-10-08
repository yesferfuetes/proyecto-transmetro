'use server';

import { revalidatePath } from 'next/cache';
import { errorDeEntrada, type EstadoDeAccion } from '@/shared/lib/acciones';
import { autorizarAccion } from '@/shared/lib/sesion/sesion';
import { asignarContrasenaEnBackend } from '../data/usuarios';
import { esquemaAsignacionContrasena } from '../schemas/formularios';
import { esquemaIdUsuario } from '../schemas/usuario';
import { rechazar, SOLO_ADMINISTRADOR } from './rechazo';

export async function asignarContrasena(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const autorizacion = await autorizarAccion(SOLO_ADMINISTRADOR);
  if (!autorizacion.ok) {
    return autorizacion;
  }
  const idValido = esquemaIdUsuario.safeParse(id);
  if (!idValido.success) {
    return errorDeEntrada(idValido.error);
  }
  const datos = esquemaAsignacionContrasena.safeParse(entrada);
  if (!datos.success) {
    return errorDeEntrada(datos.error);
  }
  const resultado = await asignarContrasenaEnBackend(idValido.data, datos.data.contrasena);
  if (!resultado.ok) {
    return rechazar(resultado.error);
  }
  revalidatePath(`/usuarios/${idValido.data}`);
  return { ok: true };
}
