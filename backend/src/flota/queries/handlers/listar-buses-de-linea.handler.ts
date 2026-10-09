import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { BusResumen } from '../../../shared/contratos/flota';
import { Bus } from '../../entities/bus.entity';
import { ListarBusesDeLinea } from '../impl/listar-buses-de-linea.query';
import { aBusResumen } from './resumen-de-bus';

@QueryHandler(ListarBusesDeLinea)
export class ListarBusesDeLineaHandler implements IQueryHandler<ListarBusesDeLinea> {
  constructor(@InjectRepository(Bus) private readonly buses: Repository<Bus>) {}

  async execute({ lineaId }: ListarBusesDeLinea): Promise<BusResumen[]> {
    const buses = await this.buses.find({ where: { lineaId }, order: { placa: 'ASC' } });
    return buses.map(aBusResumen);
  }
}
