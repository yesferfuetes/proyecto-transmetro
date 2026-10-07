import type { EntityManager } from 'typeorm';
import { Estacion } from '../../red/entities/estacion.entity';
import { LineaEstacion } from '../../red/entities/linea-estacion.entity';
import { Linea } from '../../red/entities/linea.entity';
import { Municipalidad } from '../../red/entities/municipalidad.entity';
import { LINEAS, MUNICIPALIDAD_DE_LA_RED, MUNICIPALIDADES, PARQUEOS } from '../datos/red';
import { crearGenerador, distanciaFicticia, rellenar } from '../numeros';
import { Resumen, sincronizar, sumarResumenes } from '../sincronizar';

/** Nombre de estación → código E001, E002…, en orden de primera aparición en los recorridos. */
export function codigosDeEstacion(): Map<string, string> {
  const codigos = new Map<string, string>();
  for (const linea of LINEAS) {
    for (const nombre of linea.recorrido) {
      if (!codigos.has(nombre)) {
        codigos.set(nombre, `E${rellenar(codigos.size + 1, 3)}`);
      }
    }
  }
  return codigos;
}

export async function sembrarRed(gestor: EntityManager): Promise<Resumen> {
  let resumen = await sincronizar(
    gestor,
    Municipalidad,
    MUNICIPALIDADES.map((m) => ({ nombre: m.nombre, departamento: m.departamento })),
    ['nombre'],
  );
  const municipalidad = await gestor
    .getRepository(Municipalidad)
    .findOneByOrFail({ nombre: MUNICIPALIDAD_DE_LA_RED });

  resumen = sumarResumenes(resumen, await sembrarEstaciones(gestor, municipalidad.id));
  resumen = sumarResumenes(resumen, await sembrarLineas(gestor, municipalidad.id));
  return sumarResumenes(resumen, await sembrarRecorridos(gestor));
}

async function sembrarEstaciones(gestor: EntityManager, municipalidadId: number): Promise<Resumen> {
  const conParqueo = new Set(PARQUEOS.map((parqueo) => parqueo.estacion));
  const filas = [...codigosDeEstacion()].map(([nombre, codigo]) => ({
    codigo,
    nombre,
    municipalidadId,
    tieneParqueo: conParqueo.has(nombre),
  }));
  return sincronizar(gestor, Estacion, filas, ['codigo']);
}

async function sembrarLineas(gestor: EntityManager, municipalidadId: number): Promise<Resumen> {
  const filas = LINEAS.map((linea) => ({
    codigo: linea.codigo,
    nombre: linea.nombre,
    municipalidadId,
    estado: 'ACTIVA',
  }));
  return sincronizar(gestor, Linea, filas, ['codigo']);
}

async function sembrarRecorridos(gestor: EntityManager): Promise<Resumen> {
  const idsDeLinea = await idsPorCodigo(gestor, Linea);
  const idsDeEstacion = await idsPorCodigo(gestor, Estacion);
  const codigos = codigosDeEstacion();
  const generador = crearGenerador(2024);
  const filas: Partial<LineaEstacion>[] = [];
  const longitudes: Partial<Linea>[] = [];

  for (const linea of LINEAS) {
    let longitud = 0;
    linea.recorrido.forEach((nombre, posicion) => {
      const esUltima = posicion === linea.recorrido.length - 1;
      const distancia = esUltima ? null : distanciaFicticia(generador);
      longitud += distancia ?? 0;
      filas.push({
        lineaId: idsDeLinea.get(linea.codigo),
        estacionId: idsDeEstacion.get(codigos.get(nombre) ?? ''),
        ordenSecuencia: posicion + 1,
        distanciaSiguienteKm: distancia,
      });
    });
    longitudes.push({ codigo: linea.codigo, longitudKm: Math.round(longitud * 1000) / 1000 });
  }

  const recorridos = await sincronizar(gestor, LineaEstacion, filas, ['lineaId', 'estacionId']);
  // La longitud es la suma de las distancias del recorrido: se deja coherente con él.
  const longitud = await sincronizar(gestor, Linea, longitudes, ['codigo']);
  return sumarResumenes(recorridos, { ...longitud, sinCambios: 0 });
}

export async function idsPorCodigo(
  gestor: EntityManager,
  entidad: typeof Linea | typeof Estacion,
): Promise<Map<string, number>> {
  const filas: { id: number; codigo: string }[] = await gestor.getRepository(entidad).find();
  return new Map(filas.map((fila) => [fila.codigo, fila.id]));
}
