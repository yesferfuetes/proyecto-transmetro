import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Piloto } from '../../entities/piloto.entity';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { porCodigo } from '../../services/lectura';
import {
  ListarOpcionesDePilotos,
  OpcionesDePilotos,
} from '../impl/listar-opciones-de-pilotos.query';

interface FilaDeConteo {
  busId: number | string;
  pilotos: number | string;
}

@QueryHandler(ListarOpcionesDePilotos)
export class ListarOpcionesDePilotosHandler implements IQueryHandler<ListarOpcionesDePilotos> {
  constructor(
    @InjectRepository(Piloto) private readonly pilotos: Repository<Piloto>,
    private readonly flota: FlotaAdapter,
    private readonly red: RedAdapter,
  ) {}

  async execute(): Promise<OpcionesDePilotos> {
    const [todos, conteo] = await Promise.all([this.flota.listarBuses(), this.contarPilotos()]);
    const buses = todos.filter(({ estado }) => estado !== 'BAJA');
    const lineaIds = [
      ...new Set(buses.flatMap(({ lineaId }) => (lineaId === null ? [] : [lineaId]))),
    ];
    const lineas = lineaIds.length > 0 ? await this.red.obtenerLineas(lineaIds) : [];
    const lineaPorId = new Map(
      lineas.map(({ id, codigo, nombre }) => [id, { id, codigo, nombre }]),
    );
    return {
      buses: buses.map(({ id, placa, lineaId }) => ({
        id,
        placa,
        linea: (lineaId === null ? undefined : lineaPorId.get(lineaId)) ?? null,
        pilotos: conteo.get(id) ?? 0,
      })),
      lineas: [...lineaPorId.values()].sort(porCodigo),
    };
  }

  private async contarPilotos(): Promise<Map<number, number>> {
    const filas = await this.pilotos
      .createQueryBuilder('p')
      .select('p.busId', 'busId')
      .addSelect('COUNT(*)', 'pilotos')
      .where('p.busId IS NOT NULL')
      .groupBy('p.busId')
      .getRawMany<FilaDeConteo>();
    return new Map(filas.map((fila) => [Number(fila.busId), Number(fila.pilotos)]));
  }
}
