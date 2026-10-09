import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Parqueo } from '../../entities/parqueo.entity';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import {
  ListarOpcionesDeParqueos,
  OpcionDeParqueo,
} from '../impl/listar-opciones-de-parqueos.query';
import { leerParqueos } from './parqueos-en-vista';

@QueryHandler(ListarOpcionesDeParqueos)
export class ListarOpcionesDeParqueosHandler implements IQueryHandler<ListarOpcionesDeParqueos> {
  constructor(
    @InjectRepository(Parqueo) private readonly parqueos: Repository<Parqueo>,
    private readonly red: RedAdapter,
  ) {}

  async execute(): Promise<OpcionDeParqueo[]> {
    const todos = await leerParqueos(this.parqueos, this.red);
    return todos.filter((parqueo) => parqueo.buses < parqueo.capacidadVehiculos);
  }
}
