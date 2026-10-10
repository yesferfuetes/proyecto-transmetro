import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Piloto } from '../../entities/piloto.entity';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { armarDetalle } from '../../services/vista-de-pilotos';
import { DetalleDePiloto, ObtenerPiloto } from '../impl/obtener-piloto.query';

@QueryHandler(ObtenerPiloto)
export class ObtenerPilotoHandler implements IQueryHandler<ObtenerPiloto> {
  constructor(
    @InjectRepository(Piloto) private readonly pilotos: Repository<Piloto>,
    private readonly flota: FlotaAdapter,
    private readonly red: RedAdapter,
  ) {}

  async execute({ id, completo }: ObtenerPiloto): Promise<DetalleDePiloto | null> {
    const piloto = await this.pilotos.findOneBy({ id });
    return piloto ? armarDetalle(piloto, completo, this.flota, this.red) : null;
  }
}
