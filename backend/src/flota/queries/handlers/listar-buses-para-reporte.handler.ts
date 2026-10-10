import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { BusConParqueo } from '../../../shared/contratos/flota';
import { Bus } from '../../entities/bus.entity';
import { ListarBusesParaReporte } from '../impl/listar-buses-para-reporte.query';
import { aBusResumen } from './resumen-de-bus';

@QueryHandler(ListarBusesParaReporte)
export class ListarBusesParaReporteHandler implements IQueryHandler<ListarBusesParaReporte> {
  constructor(@InjectRepository(Bus) private readonly buses: Repository<Bus>) {}

  async execute(): Promise<BusConParqueo[]> {
    const buses = await this.buses.find({
      relations: { parqueo: true },
      order: { placa: 'ASC' },
    });
    return buses.flatMap((bus) =>
      bus.parqueo
        ? [
            {
              ...aBusResumen(bus),
              parqueo: {
                id: bus.parqueo.id,
                codigo: bus.parqueo.codigo,
                estacionId: bus.parqueo.estacionId,
              },
            },
          ]
        : [],
    );
  }
}
