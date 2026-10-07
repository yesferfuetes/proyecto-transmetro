import type { EntityManager } from 'typeorm';
import { AccesoGuardia } from '../../accesos/entities/acceso-guardia.entity';
import { Acceso } from '../../accesos/entities/acceso.entity';
import { GuardiaSeguridad } from '../../accesos/entities/guardia-seguridad.entity';
import { Estacion } from '../../red/entities/estacion.entity';
import { APELLIDOS, CODIGOS_DE_ACCESO, NOMBRES, TURNOS } from '../datos/personas';
import { elegir, rellenar } from '../numeros';
import { Resumen, sincronizar, sumarResumenes } from '../sincronizar';
import { idsPorCodigo } from './red';

/** Dos accesos por estación y un guardia por turno que cubre ambos accesos. */
export async function sembrarAccesos(gestor: EntityManager): Promise<Resumen> {
  const estaciones = [...(await idsPorCodigo(gestor, Estacion))].sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const accesos = estaciones.flatMap(([, estacionId]) =>
    CODIGOS_DE_ACCESO.map((codigo) => ({ estacionId, codigo, nombre: `Acceso ${codigo}` })),
  );
  let resumen = await sincronizar(gestor, Acceso, accesos, ['estacionId', 'codigo']);

  const guardias = estaciones.flatMap((_, indiceEstacion) =>
    TURNOS.map((__, indiceTurno) => guardiaFicticio(indiceEstacion * TURNOS.length + indiceTurno)),
  );
  resumen = sumarResumenes(resumen, await sincronizar(gestor, GuardiaSeguridad, guardias, ['dpi']));

  return sumarResumenes(resumen, await sembrarAsignaciones(gestor, estaciones));
}

async function sembrarAsignaciones(
  gestor: EntityManager,
  estaciones: [string, number][],
): Promise<Resumen> {
  const accesos = await gestor.getRepository(Acceso).find();
  const guardias = new Map(
    (await gestor.getRepository(GuardiaSeguridad).find()).map((g) => [g.dpi, g.id]),
  );
  const filas: Partial<AccesoGuardia>[] = [];

  estaciones.forEach(([, estacionId], indiceEstacion) => {
    TURNOS.forEach((turno, indiceTurno) => {
      const dpi = guardiaFicticio(indiceEstacion * TURNOS.length + indiceTurno).dpi;
      for (const acceso of accesos.filter((a) => a.estacionId === estacionId)) {
        filas.push({ accesoId: acceso.id, guardiaId: guardias.get(dpi), turno });
      }
    });
  });
  return sincronizar(gestor, AccesoGuardia, filas, ['accesoId', 'guardiaId', 'turno']);
}

function guardiaFicticio(indice: number): { nombre: string; dpi: string; telefono: string } {
  const numero = indice + 1;
  return {
    nombre: `${elegir(NOMBRES, indice)} ${elegir(APELLIDOS, indice * 7)} ${elegir(APELLIDOS, indice * 3 + 5)}`,
    dpi: `8${rellenar(numero, 3)} ${rellenar(numero, 5)} 0101`,
    telefono: `4${rellenar(numero, 3)}-${rellenar(numero, 4)}`,
  };
}
