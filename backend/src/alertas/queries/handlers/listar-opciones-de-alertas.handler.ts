import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import {
  ListarOpcionesDeAlertas,
  OpcionesDeAlertas,
} from '../impl/listar-opciones-de-alertas.query';

@QueryHandler(ListarOpcionesDeAlertas)
export class ListarOpcionesDeAlertasHandler implements IQueryHandler<ListarOpcionesDeAlertas> {
  constructor(private readonly red: RedAdapter) {}

  async execute(): Promise<OpcionesDeAlertas> {
    const [estaciones, lineas] = await Promise.all([
      this.red.listarEstaciones(),
      this.red.listarLineas(),
    ]);
    return {
      estaciones: estaciones.map(({ id, codigo, nombre }) => ({ id, codigo, nombre })),
      lineas: lineas.map(({ id, codigo, nombre }) => ({ id, codigo, nombre })),
    };
  }
}
