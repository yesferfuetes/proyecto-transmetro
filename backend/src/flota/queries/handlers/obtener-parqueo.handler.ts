import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Parqueo } from '../../entities/parqueo.entity';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ParqueoEnVista } from '../impl/listar-parqueos.query';
import { ObtenerParqueo } from '../impl/obtener-parqueo.query';
import { leerParqueos } from './parqueos-en-vista';

@QueryHandler(ObtenerParqueo)
export class ObtenerParqueoHandler implements IQueryHandler<ObtenerParqueo> {
  constructor(
    @InjectRepository(Parqueo) private readonly parqueos: Repository<Parqueo>,
    private readonly red: RedAdapter,
  ) {}

  async execute({ id }: ObtenerParqueo): Promise<ParqueoEnVista | null> {
    const [parqueo] = await leerParqueos(this.parqueos, this.red, id);
    return parqueo ?? null;
  }
}
