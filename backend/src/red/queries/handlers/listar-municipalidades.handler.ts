import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Estacion } from '../../entities/estacion.entity';
import { Linea } from '../../entities/linea.entity';
import { Municipalidad } from '../../entities/municipalidad.entity';
import { aNumero } from '../../services/lectura';
import { desplazamiento, Pagina } from '../../services/paginacion';
import {
  ListarMunicipalidades,
  MunicipalidadEnListado,
} from '../impl/listar-municipalidades.query';

interface FilaDeMunicipalidad {
  id: number;
  nombre: string;
  departamento: string | null;
  fechaIncorporacion: string | null;
  numeroDeLineas: string;
  numeroDeEstaciones: string;
}

@QueryHandler(ListarMunicipalidades)
export class ListarMunicipalidadesHandler implements IQueryHandler<ListarMunicipalidades> {
  constructor(
    @InjectRepository(Municipalidad) private readonly municipalidades: Repository<Municipalidad>,
  ) {}

  async execute({ pagina }: ListarMunicipalidades): Promise<Pagina<MunicipalidadEnListado>> {
    const total = await this.municipalidades.createQueryBuilder('m').getCount();
    const filas = await this.municipalidades
      .createQueryBuilder('m')
      .select('m.id', 'id')
      .addSelect('m.nombre', 'nombre')
      .addSelect('m.departamento', 'departamento')
      .addSelect(`TO_CHAR(m.fecha_incorporacion, 'YYYY-MM-DD')`, 'fechaIncorporacion')
      .addSelect(
        (sub) => sub.select('COUNT(*)').from(Linea, 'l').where('l.municipalidad_id = m.id'),
        'numeroDeLineas',
      )
      .addSelect(
        (sub) => sub.select('COUNT(*)').from(Estacion, 'e').where('e.municipalidad_id = m.id'),
        'numeroDeEstaciones',
      )
      .orderBy('m.nombre', 'ASC')
      .offset(desplazamiento(pagina))
      .limit(pagina.tamano)
      .getRawMany<FilaDeMunicipalidad>();
    return { elementos: filas.map(aMunicipalidad), total, ...pagina };
  }
}

function aMunicipalidad(fila: FilaDeMunicipalidad): MunicipalidadEnListado {
  const numeroDeLineas = aNumero(fila.numeroDeLineas);
  const numeroDeEstaciones = aNumero(fila.numeroDeEstaciones);
  return {
    id: fila.id,
    nombre: fila.nombre,
    departamento: fila.departamento,
    fechaIncorporacion: fila.fechaIncorporacion,
    numeroDeLineas,
    numeroDeEstaciones,
    sinRed: numeroDeLineas === 0 && numeroDeEstaciones === 0,
  };
}
