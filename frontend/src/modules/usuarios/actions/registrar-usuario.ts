'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { errorDeEntrada, type EstadoDeAccion } from '@/shared/lib/acciones';
import { autorizarAccion } from '@/shared/lib/sesion/sesion';
import { registrarUsuarioEnBackend } from '../data/usuarios';
import { esquemaRegistroUsuario } from '../schemas/formularios';
import { rechazar, SOLO_ADMINISTRADOR } from './rechazo';

export async function registrarUsuario(entrada: unknown): Promise<EstadoDeAccion> {
  const autorizacion = await autorizarAccion(SOLO_ADMINISTRADOR);
  if (!autorizacion.ok) {
    return autorizacion;
  }
  const datos = esquemaRegistroUsuario.safeParse(entrada);
  if (!datos.success) {
    return errorDeEntrada(datos.error);
  }
  const { estacionId, ...resto } = datos.data;
  const resultado = await registrarUsuarioEnBackend({
    ...resto,
    estacionId: estacionId ?? undefined,
  });
  if (!resultado.ok) {
    return rechazar(resultado.error);
  }
  revalidatePath('/usuarios');
  redirect('/usuarios');
}
