import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Parqueo } from '../../entities/parqueo.entity';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ListarParqueos, ParqueoEnVista } from '../impl/listar-parqueos.query';
import { leerParqueos } from './parqueos-en-vista';

@QueryHandler(ListarParqueos)
export class ListarParqueosHandler implements IQueryHandler<ListarParqueos> {
  constructor(
    @InjectRepository(Parqueo) private readonly parqueos: Repository<Parqueo>,
    private readonly red: RedAdapter,
  ) {}

  execute(): Promise<ParqueoEnVista[]> {
    return leerParqueos(this.parqueos, this.red);
  }
}
