import type { Repository } from 'typeorm';
import type { Parqueo } from '../../entities/parqueo.entity';
import { Bus } from '../../entities/bus.entity';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { aNumero, compararCodigos } from '../../services/lectura';
import type { ParqueoEnVista } from '../impl/listar-parqueos.query';

interface FilaDeParqueo {
  id: number;
  codigo: string;
  capacidadVehiculos: number;
  estacionId: number;
  buses: string;
}

/** Parqueos con sus buses y su estación, ordenados por estación y código. */
export async function leerParqueos(
  parqueos: Repository<Parqueo>,
  red: RedAdapter,
  id?: number,
): Promise<ParqueoEnVista[]> {
  const consulta = parqueos
    .createQueryBuilder('p')
    .select('p.id', 'id')
    .addSelect('p.codigo', 'codigo')
    .addSelect('p.capacidad_vehiculos', 'capacidadVehiculos')
    .addSelect('p.estacion_id', 'estacionId')
    .addSelect(
      (sub) => sub.select('COUNT(*)').from(Bus, 'b').where('b.parqueo_id = p.id'),
      'buses',
    );
  const filas = await (
    id === undefined ? consulta : consulta.where('p.id = :id', { id })
  ).getRawMany<FilaDeParqueo>();
  const estacionIds = [...new Set(filas.map((fila) => fila.estacionId))];
  const estaciones = estacionIds.length > 0 ? await red.obtenerEstaciones(estacionIds) : [];
  const estacionPorId = new Map(estaciones.map((estacion) => [estacion.id, estacion]));
  return filas
    .map((fila) => {
      const estacion = estacionPorId.get(fila.estacionId);
      return {
        id: fila.id,
        codigo: fila.codigo,
        capacidadVehiculos: fila.capacidadVehiculos,
        buses: aNumero(fila.buses),
        estacion: {
          id: fila.estacionId,
          codigo: estacion?.codigo ?? '',
          nombre: estacion?.nombre ?? '',
        },
      };
    })
    .sort(
      (a, b) =>
        compararCodigos(a.estacion.codigo, b.estacion.codigo) ||
        compararCodigos(a.codigo, b.codigo),
    );
}
