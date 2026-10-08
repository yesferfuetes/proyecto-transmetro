import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository, SelectQueryBuilder } from 'typeorm';
import { LineaEstacion } from '../../entities/linea-estacion.entity';
import { Linea } from '../../entities/linea.entity';
import { leerEstadoDeLinea } from '../../services/estados-de-linea';
import { aNumero, aNumeroONulo, ordenNaturalDeCodigo } from '../../services/lectura';
import { desplazamiento, Pagina } from '../../services/paginacion';
import { FiltrosDeLineas, LineaEnListado, ListarLineas } from '../impl/listar-lineas.query';

interface FilaDeLinea {
  id: number;
  codigo: string;
  nombre: string;
  municipalidadId: number;
  municipalidadNombre: string;
  estado: string;
  numeroDeEstaciones: string;
  longitudKm: string | null;
}

@QueryHandler(ListarLineas)
export class ListarLineasHandler implements IQueryHandler<ListarLineas> {
  constructor(@InjectRepository(Linea) private readonly lineas: Repository<Linea>) {}

  async execute({ filtros, pagina }: ListarLineas): Promise<Pagina<LineaEnListado>> {
    const total = await this.filtrar(filtros).getCount();
    const filas = await this.filtrar(filtros)
      .innerJoin('l.municipalidad', 'm')
      .select('l.id', 'id')
      .addSelect('l.codigo', 'codigo')
      .addSelect('l.nombre', 'nombre')
      .addSelect('m.id', 'municipalidadId')
      .addSelect('m.nombre', 'municipalidadNombre')
      .addSelect('l.estado', 'estado')
      .addSelect('l.longitud_km', 'longitudKm')
      .addSelect(
        (sub) => sub.select('COUNT(*)').from(LineaEstacion, 'c').where('c.linea_id = l.id'),
        'numeroDeEstaciones',
      )
      .orderBy(ordenarPorCodigo('l.codigo'))
      .offset(desplazamiento(pagina))
      .limit(pagina.tamano)
      .getRawMany<FilaDeLinea>();
    return { elementos: filas.map(aLinea), total, ...pagina };
  }

  private filtrar(filtros: FiltrosDeLineas): SelectQueryBuilder<Linea> {
    const consulta = this.lineas.createQueryBuilder('l');
    if (filtros.municipalidadId !== undefined) {
      consulta.andWhere('l.municipalidad_id = :municipalidadId', {
        municipalidadId: filtros.municipalidadId,
      });
    }
    if (filtros.estado !== undefined) {
      consulta.andWhere('l.estado = :estado', { estado: filtros.estado });
    }
    if (filtros.estacionId !== undefined) {
      consulta.andWhere(
        (externa) =>
          `EXISTS ${externa
            .subQuery()
            .select('1')
            .from(LineaEstacion, 'f')
            .where('f.linea_id = l.id')
            .andWhere('f.estacion_id = :estacionId')
            .getQuery()}`,
        { estacionId: filtros.estacionId },
      );
    }
    return consulta;
  }
}

function aLinea(fila: FilaDeLinea): LineaEnListado {
  return {
    id: fila.id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    municipalidad: { id: fila.municipalidadId, nombre: fila.municipalidadNombre },
    estado: leerEstadoDeLinea(fila.estado),
    numeroDeEstaciones: aNumero(fila.numeroDeEstaciones),
    longitudKm: aNumeroONulo(fila.longitudKm),
  };
}

function ordenarPorCodigo(columna: string): Record<string, 'ASC'> {
  return Object.fromEntries(ordenNaturalDeCodigo(columna).map((expresion) => [expresion, 'ASC']));
}
