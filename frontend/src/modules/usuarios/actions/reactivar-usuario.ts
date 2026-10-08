'use server';

import { revalidatePath } from 'next/cache';
import { errorDeEntrada, type EstadoDeAccion } from '@/shared/lib/acciones';
import { autorizarAccion } from '@/shared/lib/sesion/sesion';
import { reactivarUsuarioEnBackend } from '../data/usuarios';
import { esquemaIdUsuario } from '../schemas/usuario';
import { rechazar, SOLO_ADMINISTRADOR } from './rechazo';

export async function reactivarUsuario(id: unknown): Promise<EstadoDeAccion> {
  const autorizacion = await autorizarAccion(SOLO_ADMINISTRADOR);
  if (!autorizacion.ok) {
    return autorizacion;
  }
  const idValido = esquemaIdUsuario.safeParse(id);
  if (!idValido.success) {
    return errorDeEntrada(idValido.error);
  }
  const resultado = await reactivarUsuarioEnBackend(idValido.data);
  if (!resultado.ok) {
    return rechazar(resultado.error);
  }
  revalidatePath('/usuarios');
  revalidatePath(`/usuarios/${idValido.data}`);
  return { ok: true };
}
