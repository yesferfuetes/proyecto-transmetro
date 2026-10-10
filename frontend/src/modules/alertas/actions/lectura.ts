import 'server-only';
import { redirect } from 'next/navigation';
import type { ErrorDeBackend, Resultado } from '@/shared/lib/http/resultado';
import { esquemaFormularioDeLectura, type FormularioDeLectura } from '../schemas/lectura';
import type { EstadoDeLectura } from '../types/estado-de-lectura';
import { prepararAccion, responderError } from './comun';
import { invalidarAlertas } from './invalidacion';

type Envio = (
  lectura: FormularioDeLectura & Readonly<{ estacionId: number }>,
) => Promise<Resultado<{ alertaId: number | null }>>;

const SIN_ESTACION: ErrorDeBackend = {
  codigo: 'ESTACION_AJENA',
  mensaje: 'Tu cuenta no tiene una estación asignada.',
  detalles: [],
  estado: 403,
};

/**
 * Pasos comunes de las dos lecturas: autorizar al operador, validar, enviar con la estación de su
 * sesión (nunca la que mande el navegador) y llevar a la lista cuando nació una alerta.
 */
export async function registrarLectura(entrada: unknown, enviar: Envio): Promise<EstadoDeLectura> {
  const preparada = await prepararAccion(
    ['OPERADOR_ESTACION'],
    esquemaFormularioDeLectura,
    entrada,
  );
  if (!preparada.ok) {
    return preparada;
  }
  const estacionId = preparada.datos.sesion.estacion?.id;
  if (estacionId === undefined) {
    return { ok: false, error: SIN_ESTACION };
  }
  const resultado = await enviar({ ...preparada.datos.datos, estacionId });
  if (!resultado.ok) {
    await responderError(resultado.error);
    return { ok: false, error: resultado.error };
  }
  if (resultado.datos.alertaId === null) {
    return { ok: true, alertaId: null };
  }
  invalidarAlertas();
  redirect(`/alertas?resaltada=${resultado.datos.alertaId}`);
}
