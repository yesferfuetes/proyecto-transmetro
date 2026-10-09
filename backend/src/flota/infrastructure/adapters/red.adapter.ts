import { Injectable } from '@nestjs/common';
import { ConsultasDeRed, EstacionResumen, LineaResumen } from '../../../shared/contratos/red';

/** Lo que la flota necesita de la red. Es la única puerta de este módulo hacia ella. */
@Injectable()
export class RedAdapter {
  constructor(private readonly red: ConsultasDeRed) {}

  obtenerLinea(id: number): Promise<LineaResumen | null> {
    return this.red.obtenerLinea(id);
  }

  obtenerLineas(ids: readonly number[]): Promise<LineaResumen[]> {
    return this.red.obtenerLineas(ids);
  }

  listarLineas(): Promise<LineaResumen[]> {
    return this.red.listarLineas();
  }

  obtenerEstacion(id: number): Promise<EstacionResumen | null> {
    return this.red.obtenerEstacion(id);
  }

  obtenerEstaciones(ids: readonly number[]): Promise<EstacionResumen[]> {
    return this.red.obtenerEstaciones(ids);
  }

  listarEstaciones(): Promise<EstacionResumen[]> {
    return this.red.listarEstaciones();
  }
}
