import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Estacion } from '../../entities/estacion.entity';
import {
  ListarOpcionesDeEstacion,
  OpcionDeEstacion,
} from '../impl/listar-opciones-de-estacion.query';

@QueryHandler(ListarOpcionesDeEstacion)
export class ListarOpcionesDeEstacionHandler implements IQueryHandler<ListarOpcionesDeEstacion> {
  constructor(@InjectRepository(Estacion) private readonly estaciones: Repository<Estacion>) {}

  async execute(): Promise<OpcionDeEstacion[]> {
    const estaciones = await this.estaciones.find({
      select: { id: true, codigo: true, nombre: true },
      order: { codigo: 'ASC' },
    });
    return estaciones.map(({ id, codigo, nombre }) => ({ id, codigo, nombre }));
  }
}
