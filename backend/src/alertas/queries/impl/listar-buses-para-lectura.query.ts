import { Query } from '@nestjs/cqrs';

export interface BusParaLectura {
  id: number;
  placa: string;
  capacidadMax: number;
  linea: { id: number; codigo: string; nombre: string };
}

/** Buses activos de las líneas que pasan por la estación, por línea y placa. */
export class ListarBusesParaLectura extends Query<BusParaLectura[]> {
  constructor(readonly estacionId: number) {
    super();
  }
}
