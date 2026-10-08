import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Municipalidad } from '../../entities/municipalidad.entity';
import { DetalleDeMunicipalidad, ObtenerMunicipalidad } from '../impl/obtener-municipalidad.query';

@QueryHandler(ObtenerMunicipalidad)
export class ObtenerMunicipalidadHandler implements IQueryHandler<ObtenerMunicipalidad> {
  constructor(
    @InjectRepository(Municipalidad) private readonly municipalidades: Repository<Municipalidad>,
  ) {}

  async execute({ id }: ObtenerMunicipalidad): Promise<DetalleDeMunicipalidad | null> {
    const municipalidad = await this.municipalidades.findOneBy({ id });
    if (!municipalidad) {
      return null;
    }
    return {
      id: municipalidad.id,
      nombre: municipalidad.nombre,
      departamento: municipalidad.departamento,
      fechaIncorporacion: municipalidad.fechaIncorporacion,
    };
  }
}
