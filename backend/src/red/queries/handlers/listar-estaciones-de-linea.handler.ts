import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { EstacionResumen } from '../../../shared/contratos/red';
import { LineaEstacion } from '../../entities/linea-estacion.entity';
import { ListarEstacionesDeLinea } from '../impl/listar-estaciones-de-linea.query';
import { aEstacionResumen } from './resumen';

@QueryHandler(ListarEstacionesDeLinea)
export class ListarEstacionesDeLineaHandler implements IQueryHandler<ListarEstacionesDeLinea> {
  constructor(
    @InjectRepository(LineaEstacion) private readonly recorridos: Repository<LineaEstacion>,
  ) {}

  async execute({ lineaId }: ListarEstacionesDeLinea): Promise<EstacionResumen[]> {
    const paradas = await this.recorridos.find({
      where: { lineaId },
      relations: { estacion: true },
      order: { ordenSecuencia: 'ASC' },
    });
    return paradas.flatMap((parada) =>
      parada.estacion ? [aEstacionResumen(parada.estacion)] : [],
    );
  }
}
