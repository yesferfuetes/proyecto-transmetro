import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Bus } from '../../entities/bus.entity';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import {
  armarBusesEnVista,
  consultaDeBuses,
  FilaDeBus,
  seleccionarFilasDeBus,
} from '../../services/vista-de-buses';
import { BusEnVista } from '../impl/listar-buses.query';
import { ObtenerBus } from '../impl/obtener-bus.query';

@QueryHandler(ObtenerBus)
export class ObtenerBusHandler implements IQueryHandler<ObtenerBus> {
  constructor(
    @InjectRepository(Bus) private readonly buses: Repository<Bus>,
    private readonly red: RedAdapter,
  ) {}

  async execute({ id }: ObtenerBus): Promise<BusEnVista | null> {
    const filas = await seleccionarFilasDeBus(consultaDeBuses(this.buses))
      .where('b.id = :id', { id })
      .getRawMany<FilaDeBus>();
    const [bus] = await armarBusesEnVista(filas, this.red);
    return bus ?? null;
  }
}
