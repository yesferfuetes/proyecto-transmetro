import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { LineaResumen } from '../../../shared/contratos/red';
import { LineaEstacion } from '../../entities/linea-estacion.entity';
import { Linea } from '../../entities/linea.entity';
import { leerEstadoDeLinea } from '../../services/estados-de-linea';
import { aNumero } from '../../services/lectura';
import { ObtenerLineasResumen } from '../impl/obtener-lineas-resumen.query';

interface FilaDeLineaResumen {
  id: number;
  codigo: string;
  nombre: string;
  estado: string;
  numeroDeEstaciones: string;
}

@QueryHandler(ObtenerLineasResumen)
export class ObtenerLineasResumenHandler implements IQueryHandler<ObtenerLineasResumen> {
  constructor(@InjectRepository(Linea) private readonly lineas: Repository<Linea>) {}

  async execute({ ids }: ObtenerLineasResumen): Promise<LineaResumen[]> {
    if (ids.length === 0) {
      return [];
    }
    const filas = await this.lineas
      .createQueryBuilder('l')
      .select('l.id', 'id')
      .addSelect('l.codigo', 'codigo')
      .addSelect('l.nombre', 'nombre')
      .addSelect('l.estado', 'estado')
      .addSelect(
        (sub) => sub.select('COUNT(*)').from(LineaEstacion, 'c').where('c.linea_id = l.id'),
        'numeroDeEstaciones',
      )
      .where('l.id IN (:...ids)', { ids: [...ids] })
      .orderBy('l.id', 'ASC')
      .getRawMany<FilaDeLineaResumen>();
    return filas.map((fila) => ({
      id: fila.id,
      codigo: fila.codigo,
      nombre: fila.nombre,
      estado: leerEstadoDeLinea(fila.estado),
      numeroDeEstaciones: aNumero(fila.numeroDeEstaciones),
    }));
  }
}
