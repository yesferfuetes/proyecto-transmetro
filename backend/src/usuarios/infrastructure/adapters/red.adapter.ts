import { Injectable } from '@nestjs/common';
import { ConsultasDeRed, EstacionResumen } from '../../../shared/contratos/red';

/** Lo que el módulo usuarios necesita saber de las estaciones, a través del contrato de la red. */
@Injectable()
export class RedAdapter {
  constructor(private readonly consultas: ConsultasDeRed) {}

  obtenerEstacion(id: number): Promise<EstacionResumen | null> {
    return this.consultas.obtenerEstacion(id);
  }

  obtenerEstaciones(ids: readonly number[]): Promise<EstacionResumen[]> {
    return this.consultas.obtenerEstaciones(ids);
  }

  listarEstaciones(): Promise<EstacionResumen[]> {
    return this.consultas.listarEstaciones();
  }
}
