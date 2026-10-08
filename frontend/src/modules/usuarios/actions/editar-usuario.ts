'use server';

import { revalidatePath } from 'next/cache';
import { errorDeEntrada, type EstadoDeAccion } from '@/shared/lib/acciones';
import { autorizarAccion } from '@/shared/lib/sesion/sesion';
import { editarUsuarioEnBackend } from '../data/usuarios';
import { esquemaEdicionUsuario } from '../schemas/formularios';
import { esquemaIdUsuario } from '../schemas/usuario';
import { rechazar, SOLO_ADMINISTRADOR } from './rechazo';

export async function editarUsuario(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const autorizacion = await autorizarAccion(SOLO_ADMINISTRADOR);
  if (!autorizacion.ok) {
    return autorizacion;
  }
  const idValido = esquemaIdUsuario.safeParse(id);
  if (!idValido.success) {
    return errorDeEntrada(idValido.error);
  }
  const datos = esquemaEdicionUsuario.safeParse(entrada);
  if (!datos.success) {
    return errorDeEntrada(datos.error);
  }
  const resultado = await editarUsuarioEnBackend(idValido.data, {
    ...datos.data,
    estacionId: datos.data.estacionId ?? null,
  });
  if (!resultado.ok) {
    return rechazar(resultado.error);
  }
  revalidatePath('/usuarios');
  revalidatePath(`/usuarios/${idValido.data}`);
  return { ok: true };
}
