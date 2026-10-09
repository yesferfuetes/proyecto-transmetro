import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Bus } from '../../entities/bus.entity';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { rangoDeFlota } from '../../services/rango-de-flota';
import { ListarOpcionesDeLineas, OpcionDeLinea } from '../impl/listar-opciones-de-lineas.query';
import { contarBusesPorLinea } from './conteo-de-buses';

@QueryHandler(ListarOpcionesDeLineas)
export class ListarOpcionesDeLineasHandler implements IQueryHandler<ListarOpcionesDeLineas> {
  constructor(
    @InjectRepository(Bus) private readonly buses: Repository<Bus>,
    private readonly red: RedAdapter,
  ) {}

  async execute(): Promise<OpcionDeLinea[]> {
    const [lineas, conteo] = await Promise.all([
      this.red.listarLineas(),
      contarBusesPorLinea(this.buses),
    ]);
    return lineas
      .filter((linea) => linea.estado !== 'INACTIVA')
      .map((linea) => ({
        id: linea.id,
        codigo: linea.codigo,
        nombre: linea.nombre,
        estaciones: linea.numeroDeEstaciones,
        buses: conteo.get(linea.id) ?? 0,
        maximo: rangoDeFlota(linea.numeroDeEstaciones).maximo,
      }));
  }
}
