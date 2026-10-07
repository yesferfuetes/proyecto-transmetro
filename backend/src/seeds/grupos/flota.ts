import type { EntityManager } from 'typeorm';
import { Bus } from '../../flota/entities/bus.entity';
import { Parqueo } from '../../flota/entities/parqueo.entity';
import { Estacion } from '../../red/entities/estacion.entity';
import { Linea } from '../../red/entities/linea.entity';
import { CAPACIDADES_DE_BUS } from '../datos/personas';
import { LINEAS, PARQUEO_PREFERIDO_POR_LINEA, PARQUEOS } from '../datos/red';
import { elegir, rellenar } from '../numeros';
import { Resumen, sincronizar, sumarResumenes } from '../sincronizar';
import { codigosDeEstacion, idsPorCodigo } from './red';

interface Cupo {
  estacion: string;
  disponible: number;
}

/**
 * Cada línea recibe tantos buses como estaciones más uno: queda dentro del rango permitido
 * (entre el número de estaciones y el doble) y deja margen para agregar o quitar en la demo.
 */
export function busesPorLinea(estaciones: number): number {
  return estaciones + 1;
}

export async function sembrarFlota(gestor: EntityManager): Promise<Resumen> {
  const idsDeEstacion = await idsPorCodigo(gestor, Estacion);
  const codigos = codigosDeEstacion();
  const idDeEstacion = (nombre: string): number | undefined =>
    idsDeEstacion.get(codigos.get(nombre) ?? '');

  const parqueos = PARQUEOS.map((parqueo) => ({
    estacionId: idDeEstacion(parqueo.estacion),
    codigo: 'P1',
    capacidadVehiculos: parqueo.capacidad,
  }));
  const resumen = await sincronizar(gestor, Parqueo, parqueos, ['estacionId', 'codigo']);

  const idsDeParqueo = new Map(
    (await gestor.getRepository(Parqueo).find()).map((p) => [p.estacionId, p.id]),
  );
  const idsDeLinea = await idsPorCodigo(gestor, Linea);
  const cupos: Cupo[] = PARQUEOS.map((p) => ({ estacion: p.estacion, disponible: p.capacidad }));
  const buses: Partial<Bus>[] = [];

  for (const linea of LINEAS) {
    for (let i = 0; i < busesPorLinea(linea.recorrido.length); i += 1) {
      const estacionDelParqueo = asignarParqueo(cupos, PARQUEO_PREFERIDO_POR_LINEA[linea.codigo]);
      buses.push({
        placa: `TM-${rellenar(buses.length + 1, 4)}`,
        capacidadMax: elegir(CAPACIDADES_DE_BUS, buses.length * 5),
        lineaId: idsDeLinea.get(linea.codigo),
        parqueoId: idsDeParqueo.get(idDeEstacion(estacionDelParqueo) ?? -1),
        estado: 'ACTIVO',
      });
    }
  }
  return sumarResumenes(resumen, await sincronizar(gestor, Bus, buses, ['placa']));
}

/** Usa el parqueo preferido de la línea mientras tenga cupo; si no, el primero con cupo. */
function asignarParqueo(cupos: Cupo[], preferido: string | undefined): string {
  const cupo =
    cupos.find((c) => c.estacion === preferido && c.disponible > 0) ??
    cupos.find((c) => c.disponible > 0);
  if (!cupo) {
    throw new Error('Los parqueos no tienen capacidad para toda la flota.');
  }
  cupo.disponible -= 1;
  return cupo.estacion;
}
