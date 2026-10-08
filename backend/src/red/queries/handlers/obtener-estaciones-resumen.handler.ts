import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { EstacionResumen } from '../../../shared/contratos/red';
import { Estacion } from '../../entities/estacion.entity';
import { ObtenerEstacionesResumen } from '../impl/obtener-estaciones-resumen.query';
import { aEstacionResumen } from './resumen';

@QueryHandler(ObtenerEstacionesResumen)
export class ObtenerEstacionesResumenHandler implements IQueryHandler<ObtenerEstacionesResumen> {
  constructor(@InjectRepository(Estacion) private readonly estaciones: Repository<Estacion>) {}

  async execute({ ids }: ObtenerEstacionesResumen): Promise<EstacionResumen[]> {
    if (ids?.length === 0) {
      return [];
    }
    const estaciones = await this.estaciones.find({
      where: ids === undefined ? {} : { id: In([...ids]) },
      order: { codigo: 'ASC' },
    });
    return estaciones.map(aEstacionResumen);
  }
}
