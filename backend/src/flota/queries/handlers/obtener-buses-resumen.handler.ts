import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { BusResumen } from '../../../shared/contratos/flota';
import { Bus } from '../../entities/bus.entity';
import { ObtenerBusesResumen } from '../impl/obtener-buses-resumen.query';
import { aBusResumen } from './resumen-de-bus';

@QueryHandler(ObtenerBusesResumen)
export class ObtenerBusesResumenHandler implements IQueryHandler<ObtenerBusesResumen> {
  constructor(@InjectRepository(Bus) private readonly buses: Repository<Bus>) {}

  async execute({ ids }: ObtenerBusesResumen): Promise<BusResumen[]> {
    if (ids.length === 0) {
      return [];
    }
    const encontrados = await this.buses.find({
      where: { id: In([...ids]) },
      order: { id: 'ASC' },
    });
    return encontrados.map(aBusResumen);
  }
}
