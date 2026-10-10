import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { LineaDeRed, RedCompleta } from '../../../shared/contratos/red';
import { Estacion } from '../../entities/estacion.entity';
import { LineaEstacion } from '../../entities/linea-estacion.entity';
import { Linea } from '../../entities/linea.entity';
import { Municipalidad } from '../../entities/municipalidad.entity';
import { leerEstadoDeLinea } from '../../services/estados-de-linea';
import { ObtenerRedCompleta } from '../impl/obtener-red-completa.query';
import { aEstacionResumen } from './resumen';

@QueryHandler(ObtenerRedCompleta)
export class ObtenerRedCompletaHandler implements IQueryHandler<ObtenerRedCompleta> {
  constructor(
    @InjectRepository(Municipalidad) private readonly municipalidades: Repository<Municipalidad>,
    @InjectRepository(Linea) private readonly lineas: Repository<Linea>,
    @InjectRepository(Estacion) private readonly estaciones: Repository<Estacion>,
    @InjectRepository(LineaEstacion) private readonly recorridos: Repository<LineaEstacion>,
  ) {}

  async execute(): Promise<RedCompleta> {
    const [municipalidades, lineas, estaciones, paradas] = await Promise.all([
      this.municipalidades.find({ order: { nombre: 'ASC' } }),
      this.lineas.find({ order: { codigo: 'ASC' } }),
      this.estaciones.find({ order: { codigo: 'ASC' } }),
      this.recorridos.find({ order: { lineaId: 'ASC', ordenSecuencia: 'ASC' } }),
    ]);
    const estacionesPorLinea = agruparEstaciones(paradas);
    return {
      municipalidades: municipalidades.map(({ id, nombre }) => ({ id, nombre })),
      lineas: lineas.map((linea) => aLineaDeRed(linea, estacionesPorLinea.get(linea.id) ?? [])),
      estaciones: estaciones.map(aEstacionResumen),
    };
  }
}

function agruparEstaciones(paradas: readonly LineaEstacion[]): Map<number, number[]> {
  const porLinea = new Map<number, number[]>();
  for (const { lineaId, estacionId } of paradas) {
    porLinea.set(lineaId, [...(porLinea.get(lineaId) ?? []), estacionId]);
  }
  return porLinea;
}

function aLineaDeRed(linea: Linea, estacionIds: number[]): LineaDeRed {
  return {
    id: linea.id,
    codigo: linea.codigo,
    nombre: linea.nombre,
    estado: leerEstadoDeLinea(linea.estado),
    numeroDeEstaciones: estacionIds.length,
    municipalidadId: linea.municipalidadId,
    longitudKm: linea.longitudKm,
    estacionIds,
  };
}
