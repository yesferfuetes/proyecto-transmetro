import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ListarEstacionesAsignables } from '../impl/listar-estaciones-asignables.query';
import type { EstacionAsignable } from '../impl/vistas';
import { aEstacionAsignable } from './lectura';

@QueryHandler(ListarEstacionesAsignables)
export class ListarEstacionesAsignablesHandler implements IQueryHandler<ListarEstacionesAsignables> {
  constructor(private readonly red: RedAdapter) {}

  async execute(): Promise<EstacionAsignable[]> {
    const estaciones = await this.red.listarEstaciones();
    return estaciones
      .map(aEstacionAsignable)
      .sort((a, b) => a.codigo.localeCompare(b.codigo, 'es'));
  }
}
