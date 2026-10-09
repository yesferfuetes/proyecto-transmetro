import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Bus } from '../../entities/bus.entity';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { estadoDeFlota, rangoDeFlota } from '../../services/rango-de-flota';
import { FlotaDeLinea, ListarFlotaPorLinea } from '../impl/listar-flota-por-linea.query';
import { contarBusesPorLinea } from './conteo-de-buses';

@QueryHandler(ListarFlotaPorLinea)
export class ListarFlotaPorLineaHandler implements IQueryHandler<ListarFlotaPorLinea> {
  constructor(
    @InjectRepository(Bus) private readonly buses: Repository<Bus>,
    private readonly red: RedAdapter,
  ) {}

  async execute(): Promise<FlotaDeLinea[]> {
    const [lineas, conteo] = await Promise.all([
      this.red.listarLineas(),
      contarBusesPorLinea(this.buses),
    ]);
    return lineas.map((linea) => {
      const buses = conteo.get(linea.id) ?? 0;
      const estaciones = linea.numeroDeEstaciones;
      return {
        linea: { id: linea.id, codigo: linea.codigo, nombre: linea.nombre, estado: linea.estado },
        estaciones,
        ...rangoDeFlota(estaciones),
        buses,
        estadoDeFlota: estadoDeFlota(estaciones, buses),
      };
    });
  }
}
