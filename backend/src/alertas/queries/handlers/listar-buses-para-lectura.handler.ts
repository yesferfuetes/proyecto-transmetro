import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { BusParaLectura, ListarBusesParaLectura } from '../impl/listar-buses-para-lectura.query';

@QueryHandler(ListarBusesParaLectura)
export class ListarBusesParaLecturaHandler implements IQueryHandler<ListarBusesParaLectura> {
  constructor(
    private readonly red: RedAdapter,
    private readonly flota: FlotaAdapter,
  ) {}

  async execute({ estacionId }: ListarBusesParaLectura): Promise<BusParaLectura[]> {
    const { lineas } = await this.red.obtenerRed();
    const lineasDeLaEstacion = lineas
      .filter((linea) => linea.estacionIds.includes(estacionId))
      .sort((a, b) => a.codigo.localeCompare(b.codigo));
    const porLinea = await Promise.all(
      lineasDeLaEstacion.map(async (linea) => {
        const buses = await this.flota.busesDeLinea(linea.id);
        return buses
          .filter((bus) => bus.estado === 'ACTIVO')
          .sort((a, b) => a.placa.localeCompare(b.placa))
          .map((bus) => ({
            id: bus.id,
            placa: bus.placa,
            capacidadMax: bus.capacidadMax,
            linea: { id: linea.id, codigo: linea.codigo, nombre: linea.nombre },
          }));
      }),
    );
    return porLinea.flat();
  }
}
