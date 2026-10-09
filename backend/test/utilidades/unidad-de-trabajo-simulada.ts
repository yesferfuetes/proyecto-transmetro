import type { EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import {
  ContextoTransaccional,
  UnidadDeTrabajo,
} from '../../src/shared/database/unidad-de-trabajo';

export type RepositorioSimulado<E extends ObjectLiteral> = jest.Mocked<Repository<E>>;

/** Repositorio cuyos métodos son funciones simuladas de Jest, para configurar en cada prueba. */
export function crearRepositorioSimulado<E extends ObjectLiteral>(): RepositorioSimulado<E> {
  const metodos = [
    'find',
    'findOne',
    'findOneBy',
    'findBy',
    'exists',
    'existsBy',
    'count',
    'countBy',
    'save',
    'insert',
    'update',
    'upsert',
    'delete',
    'remove',
    'create',
  ] as const;
  const repositorio = Object.fromEntries(metodos.map((metodo) => [metodo, jest.fn()]));
  return repositorio as unknown as RepositorioSimulado<E>;
}

/**
 * Unidad de trabajo para probar command handlers sin base de datos. Ejecuta el trabajo de
 * inmediato y entrega el repositorio simulado registrado para cada entidad.
 */
export class UnidadDeTrabajoSimulada extends UnidadDeTrabajo {
  private readonly repositorios = new Map<EntityTarget<ObjectLiteral>, unknown>();
  ejecuciones = 0;
  /** Candados pedidos, en el orden en que se pidieron. */
  readonly candados: { espacio: string; id: number }[] = [];

  registrar<E extends ObjectLiteral>(
    entidad: EntityTarget<E>,
    repositorio: RepositorioSimulado<E> = crearRepositorioSimulado<E>(),
  ): RepositorioSimulado<E> {
    this.repositorios.set(entidad, repositorio);
    return repositorio;
  }

  async ejecutar<T>(trabajo: (contexto: ContextoTransaccional) => Promise<T>): Promise<T> {
    this.ejecuciones += 1;
    return await trabajo({
      bloquear: (espacio: string, id: number): Promise<void> => {
        this.candados.push({ espacio, id });
        return Promise.resolve();
      },
      repositorio: <E extends ObjectLiteral>(entidad: EntityTarget<E>): Repository<E> => {
        const repositorio = this.repositorios.get(entidad);
        if (!repositorio) {
          throw new Error('Repositorio no registrado en la unidad de trabajo simulada.');
        }
        return repositorio as Repository<E>;
      },
    });
  }
}
