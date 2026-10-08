import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Estacion } from '../../entities/estacion.entity';
import { LineaEstacion } from '../../entities/linea-estacion.entity';
import { leerEstadoDeLinea } from '../../services/estados-de-linea';
import {
  DetalleDeEstacion,
  LineaDeEstacion,
  ObtenerEstacion,
} from '../impl/obtener-estacion.query';

@QueryHandler(ObtenerEstacion)
export class ObtenerEstacionHandler implements IQueryHandler<ObtenerEstacion> {
  constructor(
    @InjectRepository(Estacion) private readonly estaciones: Repository<Estacion>,
    @InjectRepository(LineaEstacion) private readonly recorridos: Repository<LineaEstacion>,
  ) {}

  async execute({ id }: ObtenerEstacion): Promise<DetalleDeEstacion | null> {
    const estacion = await this.estaciones.findOne({
      where: { id },
      relations: { municipalidad: true },
    });
    if (!estacion) {
      return null;
    }
    const paradas = await this.recorridos.find({
      where: { estacionId: id },
      relations: { linea: true },
    });
    return {
      id: estacion.id,
      codigo: estacion.codigo,
      nombre: estacion.nombre,
      municipalidad: { id: estacion.municipalidadId, nombre: estacion.municipalidad?.nombre ?? '' },
      tieneParqueo: estacion.tieneParqueo,
      latitud: estacion.latitud,
      longitud: estacion.longitud,
      lineas: paradas.flatMap(aLineaDeEstacion).sort(porCodigo),
    };
  }
}

function aLineaDeEstacion(parada: LineaEstacion): LineaDeEstacion[] {
  const { linea } = parada;
  if (!linea) {
    return [];
  }
  return [
    {
      id: linea.id,
      codigo: linea.codigo,
      nombre: linea.nombre,
      estado: leerEstadoDeLinea(linea.estado),
      posicion: parada.ordenSecuencia,
    },
  ];
}

/** Orden natural del código: L2 antes que L10. */
function porCodigo(a: LineaDeEstacion, b: LineaDeEstacion): number {
  return a.codigo.localeCompare(b.codigo, 'es', { numeric: true });
}
