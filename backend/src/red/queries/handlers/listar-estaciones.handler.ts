import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository, SelectQueryBuilder } from 'typeorm';
import { Estacion } from '../../entities/estacion.entity';
import { LineaEstacion } from '../../entities/linea-estacion.entity';
import { Linea } from '../../entities/linea.entity';
import { ordenNaturalDeCodigo, patronDeBusqueda } from '../../services/lectura';
import { desplazamiento, Pagina } from '../../services/paginacion';
import {
  EstacionEnListado,
  FiltrosDeEstaciones,
  ListarEstaciones,
} from '../impl/listar-estaciones.query';

interface FilaDeEstacion {
  id: number;
  codigo: string;
  nombre: string;
  municipalidadId: number;
  municipalidadNombre: string;
  tieneParqueo: boolean;
  lineas: { id: number; codigo: string }[];
}

const LINEAS_DE_LA_ESTACION =
  "COALESCE(json_agg(json_build_object('id', li.id, 'codigo', li.codigo) " +
  `ORDER BY ${ordenNaturalDeCodigo('li.codigo').join(', ')}), CAST('[]' AS json))`;

@QueryHandler(ListarEstaciones)
export class ListarEstacionesHandler implements IQueryHandler<ListarEstaciones> {
  constructor(@InjectRepository(Estacion) private readonly estaciones: Repository<Estacion>) {}

  async execute({ filtros, pagina }: ListarEstaciones): Promise<Pagina<EstacionEnListado>> {
    const total = await this.filtrar(filtros).getCount();
    const filas = await this.filtrar(filtros)
      .innerJoin('e.municipalidad', 'm')
      .select('e.id', 'id')
      .addSelect('e.codigo', 'codigo')
      .addSelect('e.nombre', 'nombre')
      .addSelect('m.id', 'municipalidadId')
      .addSelect('m.nombre', 'municipalidadNombre')
      .addSelect('e.tiene_parqueo', 'tieneParqueo')
      .addSelect(
        (sub) =>
          sub
            .select(LINEAS_DE_LA_ESTACION)
            .from(LineaEstacion, 'le')
            .innerJoin(Linea, 'li', 'li.id = le.linea_id')
            .where('le.estacion_id = e.id'),
        'lineas',
      )
      .orderBy('e.codigo', 'ASC')
      .offset(desplazamiento(pagina))
      .limit(pagina.tamano)
      .getRawMany<FilaDeEstacion>();
    return { elementos: filas.map(aEstacion), total, ...pagina };
  }

  private filtrar(filtros: FiltrosDeEstaciones): SelectQueryBuilder<Estacion> {
    const consulta = this.estaciones.createQueryBuilder('e');
    if (filtros.municipalidadId !== undefined) {
      consulta.andWhere('e.municipalidad_id = :municipalidadId', {
        municipalidadId: filtros.municipalidadId,
      });
    }
    if (filtros.tieneParqueo !== undefined) {
      consulta.andWhere('e.tiene_parqueo = :tieneParqueo', { tieneParqueo: filtros.tieneParqueo });
    }
    if (filtros.busqueda !== undefined && filtros.busqueda.trim() !== '') {
      consulta.andWhere('(e.codigo ILIKE :patron OR e.nombre ILIKE :patron)', {
        patron: patronDeBusqueda(filtros.busqueda),
      });
    }
    if (filtros.lineaId !== undefined) {
      consulta.andWhere(
        (externa) =>
          `EXISTS ${externa
            .subQuery()
            .select('1')
            .from(LineaEstacion, 'f')
            .where('f.estacion_id = e.id')
            .andWhere('f.linea_id = :lineaId')
            .getQuery()}`,
        { lineaId: filtros.lineaId },
      );
    }
    return consulta;
  }
}

function aEstacion(fila: FilaDeEstacion): EstacionEnListado {
  return {
    id: fila.id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    municipalidad: { id: fila.municipalidadId, nombre: fila.municipalidadNombre },
    tieneParqueo: fila.tieneParqueo,
    lineas: fila.lineas,
    sinLinea: fila.lineas.length === 0,
  };
}
