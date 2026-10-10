import type { EventBus } from '@nestjs/cqrs';
import type { UnidadDeTrabajo } from '../../shared/database/unidad-de-trabajo';
import { AlertaCapacidad } from '../entities/alerta-capacidad.entity';
import { AlertaPendienteExistente } from '../errors/errores-de-alertas';
import { AlertaGenerada } from '../events/eventos-de-alertas';
import type { TipoDeAlerta } from './tipos-de-alerta';

export interface NuevaAlerta {
  tipo: TipoDeAlerta;
  estacionId: number;
  busId: number;
  porcentaje: number;
  actorId: number;
}

/**
 * Crea la alerta en una transacción: con el candado de (tipo, estación, bus) la búsqueda de la
 * pendiente y el insert no se intercalan con los de otra sesión. Publica el aviso al confirmar.
 */
export async function crearAlertaPendiente(
  unidadDeTrabajo: UnidadDeTrabajo,
  eventos: EventBus,
  nueva: NuevaAlerta,
): Promise<number> {
  const { tipo, estacionId, busId, porcentaje, actorId } = nueva;
  const id = await unidadDeTrabajo.ejecutar(async (contexto) => {
    await contexto.bloquear(`alerta-${tipo}-${estacionId}`, busId);
    const alertas = contexto.repositorio(AlertaCapacidad);
    const pendiente = await alertas.existsBy({ estacionId, busId, tipo, atendida: false });
    if (pendiente) {
      throw new AlertaPendienteExistente();
    }
    const guardada = await alertas.save({
      estacionId,
      busId,
      tipo,
      porcentajeOcupacion: porcentaje,
      atendida: false,
      atendidaPor: null,
    });
    return guardada.id;
  });
  eventos.publish(new AlertaGenerada(actorId, id, tipo, estacionId, busId, porcentaje));
  return id;
}
