import type { Repository, SelectQueryBuilder } from 'typeorm';
import type { Bus } from '../entities/bus.entity';
import type { RedAdapter } from '../infrastructure/adapters/red.adapter';
import type { BusEnVista } from '../queries/impl/listar-buses.query';
import { leerEstadoDeBus } from './estados-de-bus';

export interface FilaDeBus {
  id: number;
  placa: string;
  capacidadMax: number;
  estado: string;
  lineaId: number | null;
  parqueoId: number;
  parqueoCodigo: string;
  estacionId: number;
}

/** Buses con su parqueo, listos para leer las columnas de la vista. */
export function consultaDeBuses(buses: Repository<Bus>): SelectQueryBuilder<Bus> {
  return buses.createQueryBuilder('b').innerJoin('b.parqueo', 'p');
}

export function seleccionarFilasDeBus(consulta: SelectQueryBuilder<Bus>): SelectQueryBuilder<Bus> {
  return consulta
    .select('b.id', 'id')
    .addSelect('b.placa', 'placa')
    .addSelect('b.capacidad_max', 'capacidadMax')
    .addSelect('b.estado', 'estado')
    .addSelect('b.linea_id', 'lineaId')
    .addSelect('p.id', 'parqueoId')
    .addSelect('p.codigo', 'parqueoCodigo')
    .addSelect('p.estacion_id', 'estacionId');
}

/** Completa nombres de línea y estación con una sola llamada a la red por cada una. */
export async function armarBusesEnVista(
  filas: readonly FilaDeBus[],
  red: RedAdapter,
): Promise<BusEnVista[]> {
  const lineaIds = [
    ...new Set(filas.flatMap((fila) => (fila.lineaId === null ? [] : [fila.lineaId]))),
  ];
  const estacionIds = [...new Set(filas.map((fila) => fila.estacionId))];
  const [lineas, estaciones] = await Promise.all([
    lineaIds.length > 0 ? red.obtenerLineas(lineaIds) : Promise.resolve([]),
    estacionIds.length > 0 ? red.obtenerEstaciones(estacionIds) : Promise.resolve([]),
  ]);
  const lineaPorId = new Map(lineas.map((linea) => [linea.id, linea]));
  const estacionPorId = new Map(estaciones.map((estacion) => [estacion.id, estacion]));
  return filas.map((fila) => {
    const linea = fila.lineaId === null ? undefined : lineaPorId.get(fila.lineaId);
    return {
      id: fila.id,
      placa: fila.placa,
      capacidadMax: fila.capacidadMax,
      estado: leerEstadoDeBus(fila.estado),
      linea: linea ? { id: linea.id, codigo: linea.codigo, nombre: linea.nombre } : null,
      parqueo: {
        id: fila.parqueoId,
        codigo: fila.parqueoCodigo,
        estacion: {
          id: fila.estacionId,
          nombre: estacionPorId.get(fila.estacionId)?.nombre ?? '',
        },
      },
    };
  });
}
