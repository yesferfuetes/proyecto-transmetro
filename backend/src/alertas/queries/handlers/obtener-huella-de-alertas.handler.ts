import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsWhere, Repository } from 'typeorm';
import { AlertaCapacidad } from '../../entities/alerta-capacidad.entity';
import { HuellaDeAlertas, ObtenerHuellaDeAlertas } from '../impl/obtener-huella-de-alertas.query';

@QueryHandler(ObtenerHuellaDeAlertas)
export class ObtenerHuellaDeAlertasHandler implements IQueryHandler<ObtenerHuellaDeAlertas> {
  constructor(
    @InjectRepository(AlertaCapacidad) private readonly alertas: Repository<AlertaCapacidad>,
  ) {}

  async execute({ estacionId }: ObtenerHuellaDeAlertas): Promise<HuellaDeAlertas> {
    const alcance: FindOptionsWhere<AlertaCapacidad> =
      estacionId === undefined ? {} : { estacionId };
    const [pendientes, atendidas, ultima] = await Promise.all([
      this.alertas.countBy({ ...alcance, atendida: false }),
      this.alertas.countBy({ ...alcance, atendida: true }),
      this.alertas.findOne({ where: alcance, order: { id: 'DESC' }, select: { id: true } }),
    ]);
    return { pendientes, atendidas, ultimaId: ultima?.id ?? 0 };
  }
}
