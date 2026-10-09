import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { porCodigo } from '../../services/lectura';
import { ListarOpcionesDeEstacion } from '../impl/listar-opciones-de-estacion.query';
import type { ReferenciaDeEstacion } from '../impl/listar-accesos.query';

@QueryHandler(ListarOpcionesDeEstacion)
export class ListarOpcionesDeEstacionHandler implements IQueryHandler<ListarOpcionesDeEstacion> {
  constructor(private readonly red: RedAdapter) {}

  async execute(): Promise<ReferenciaDeEstacion[]> {
    const estaciones = await this.red.listarEstaciones();
    return estaciones.sort(porCodigo).map(({ id, codigo, nombre }) => ({ id, codigo, nombre }));
  }
}
