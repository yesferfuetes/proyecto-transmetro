import { Injectable } from '@nestjs/common';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

/** Acceso a los repositorios dentro de una transacción en curso. */
export interface ContextoTransaccional {
  repositorio<E extends ObjectLiteral>(entidad: EntityTarget<E>): Repository<E>;
}

/**
 * Ejecuta un trabajo dentro de una transacción. Los command handlers dependen de esta clase
 * abstracta, no de TypeORM, y en las pruebas se reemplaza por una simulación.
 */
export abstract class UnidadDeTrabajo {
  abstract ejecutar<T>(trabajo: (contexto: ContextoTransaccional) => Promise<T>): Promise<T>;
}

@Injectable()
export class UnidadDeTrabajoTypeorm extends UnidadDeTrabajo {
  constructor(private readonly fuenteDeDatos: DataSource) {
    super();
  }

  ejecutar<T>(trabajo: (contexto: ContextoTransaccional) => Promise<T>): Promise<T> {
    return this.fuenteDeDatos.transaction((gestor) =>
      trabajo({ repositorio: (entidad) => gestor.getRepository(entidad) }),
    );
  }
}
