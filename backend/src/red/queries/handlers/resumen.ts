import type { EstacionResumen } from '../../../shared/contratos/red';
import type { Estacion } from '../../entities/estacion.entity';

export function aEstacionResumen(estacion: Estacion): EstacionResumen {
  return {
    id: estacion.id,
    codigo: estacion.codigo,
    nombre: estacion.nombre,
    municipalidadId: estacion.municipalidadId,
    tieneParqueo: estacion.tieneParqueo,
  };
}
