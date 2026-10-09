import { In, Repository } from 'typeorm';
import { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import { Acceso } from '../../entities/acceso.entity';
import type { AccesoEnListado } from '../impl/listar-accesos.query';

/**
 * Accesos de las estaciones dadas, agrupados por estación y con su número de guardias distintos.
 * Dos consultas por llamada, sin importar cuántas estaciones sean.
 */
export async function accesosPorEstacion(
  accesos: Repository<Acceso>,
  asignaciones: Repository<AccesoGuardia>,
  estacionIds: readonly number[],
): Promise<Map<number, AccesoEnListado[]>> {
  const porEstacion = new Map<number, AccesoEnListado[]>();
  if (estacionIds.length === 0) {
    return porEstacion;
  }
  const filas = await accesos.find({
    where: { estacionId: In([...estacionIds]) },
    order: { codigo: 'ASC' },
  });
  const guardias = await guardiasPorAcceso(
    asignaciones,
    filas.map((fila) => fila.id),
  );
  for (const fila of filas) {
    const lista = porEstacion.get(fila.estacionId) ?? [];
    lista.push({
      id: fila.id,
      codigo: fila.codigo,
      nombre: fila.nombre,
      guardias: guardias.get(fila.id)?.size ?? 0,
    });
    porEstacion.set(fila.estacionId, lista);
  }
  return porEstacion;
}

async function guardiasPorAcceso(
  asignaciones: Repository<AccesoGuardia>,
  accesoIds: readonly number[],
): Promise<Map<number, Set<number>>> {
  const guardias = new Map<number, Set<number>>();
  if (accesoIds.length === 0) {
    return guardias;
  }
  const filas = await asignaciones.find({
    where: { accesoId: In([...accesoIds]) },
    select: { accesoId: true, guardiaId: true },
  });
  for (const { accesoId, guardiaId } of filas) {
    guardias.set(accesoId, (guardias.get(accesoId) ?? new Set<number>()).add(guardiaId));
  }
  return guardias;
}
