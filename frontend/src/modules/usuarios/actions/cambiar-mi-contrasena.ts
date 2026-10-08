'use server';

import { errorDeEntrada, type EstadoDeAccion } from '@/shared/lib/acciones';
import { autorizarAccion } from '@/shared/lib/sesion/sesion';
import { cambiarMiContrasenaEnBackend } from '../data/usuarios';
import { esquemaCambioDeContrasena } from '../schemas/formularios';
import { rechazar } from './rechazo';

/** Cualquier usuario con sesión cambia su propia contraseña. */
export async function cambiarMiContrasena(entrada: unknown): Promise<EstadoDeAccion> {
  const autorizacion = await autorizarAccion();
  if (!autorizacion.ok) {
    return autorizacion;
  }
  const datos = esquemaCambioDeContrasena.safeParse(entrada);
  if (!datos.success) {
    return errorDeEntrada(datos.error);
  }
  const { contrasenaActual, contrasenaNueva } = datos.data;
  const resultado = await cambiarMiContrasenaEnBackend({ contrasenaActual, contrasenaNueva });
  if (!resultado.ok) {
    return rechazar(resultado.error);
  }
  return { ok: true };
}
