import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { GuardiaSeguridad } from '../../entities/guardia-seguridad.entity';
import { ListarOpcionesDeGuardia, OpcionDeGuardia } from '../impl/listar-opciones-de-guardia.query';

@QueryHandler(ListarOpcionesDeGuardia)
export class ListarOpcionesDeGuardiaHandler implements IQueryHandler<ListarOpcionesDeGuardia> {
  constructor(
    @InjectRepository(GuardiaSeguridad) private readonly guardias: Repository<GuardiaSeguridad>,
  ) {}

  async execute(): Promise<OpcionDeGuardia[]> {
    const guardias = await this.guardias.find({
      select: { id: true, nombre: true, dpi: true },
      order: { nombre: 'ASC', id: 'ASC' },
    });
    return guardias.map(({ id, nombre, dpi }) => ({ id, nombre, dpi }));
  }
}
