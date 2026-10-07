import type { EntityManager, EntityTarget, FindOptionsWhere, ObjectLiteral } from 'typeorm';

export interface Resumen {
  insertados: number;
  actualizados: number;
  sinCambios: number;
}

export function resumenVacio(): Resumen {
  return { insertados: 0, actualizados: 0, sinCambios: 0 };
}

export function sumarResumenes(a: Resumen, b: Resumen): Resumen {
  return {
    insertados: a.insertados + b.insertados,
    actualizados: a.actualizados + b.actualizados,
    sinCambios: a.sinCambios + b.sinCambios,
  };
}

/**
 * Inserta o actualiza cada fila según su llave natural, sin tocar las que ya coinciden.
 * Devuelve cuántas filas cambió, para comprobar que una segunda ejecución no cambia nada.
 */
export async function sincronizar<E extends ObjectLiteral>(
  gestor: EntityManager,
  entidad: EntityTarget<E>,
  filas: readonly Partial<E>[],
  clave: readonly (keyof E & string)[],
): Promise<Resumen> {
  const repositorio = gestor.getRepository(entidad);
  const existentes = await repositorio.find();
  const porClave = new Map(existentes.map((fila) => [llave(fila, clave), fila]));
  const resumen = resumenVacio();

  for (const fila of filas) {
    const actual = porClave.get(llave(fila, clave));
    if (!actual) {
      await repositorio.insert(fila);
      resumen.insertados += 1;
    } else if (difiere(actual, fila)) {
      const condicion = Object.fromEntries(clave.map((campo) => [campo, fila[campo]]));
      await repositorio.update(condicion as FindOptionsWhere<E>, fila);
      resumen.actualizados += 1;
    } else {
      resumen.sinCambios += 1;
    }
  }
  return resumen;
}

function llave<E extends ObjectLiteral>(fila: Partial<E>, clave: readonly (keyof E)[]): string {
  return clave.map((campo) => String(fila[campo])).join('|');
}

function difiere<E extends ObjectLiteral>(actual: E, deseada: Partial<E>): boolean {
  return Object.entries(deseada).some(([campo, valor]) => actual[campo] !== valor);
}
