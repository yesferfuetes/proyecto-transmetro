import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import {
  ListarOpcionesDeEstaciones,
  OpcionDeEstacion,
} from '../impl/listar-opciones-de-estaciones.query';

@QueryHandler(ListarOpcionesDeEstaciones)
export class ListarOpcionesDeEstacionesHandler implements IQueryHandler<ListarOpcionesDeEstaciones> {
  constructor(private readonly red: RedAdapter) {}

  async execute(): Promise<OpcionDeEstacion[]> {
    const estaciones = await this.red.listarEstaciones();
    return estaciones.map(({ id, codigo, nombre, tieneParqueo }) => ({
      id,
      codigo,
      nombre,
      tieneParqueo,
    }));
  }
}
