import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Parqueo } from '../../entities/parqueo.entity';
import { EstacionTieneParqueos } from '../impl/estacion-tiene-parqueos.query';

@QueryHandler(EstacionTieneParqueos)
export class EstacionTieneParqueosHandler implements IQueryHandler<EstacionTieneParqueos> {
  constructor(@InjectRepository(Parqueo) private readonly parqueos: Repository<Parqueo>) {}

  execute({ estacionId }: EstacionTieneParqueos): Promise<boolean> {
    return this.parqueos.existsBy({ estacionId });
  }
}
