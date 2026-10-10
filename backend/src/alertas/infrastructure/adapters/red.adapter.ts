import { Injectable } from '@nestjs/common';
import {
  ConsultasDeRed,
  EstacionResumen,
  LineaResumen,
  RedCompleta,
} from '../../../shared/contratos/red';

/** Lo que las alertas necesitan de la red. Es la única puerta de este módulo hacia ella. */
@Injectable()
export class RedAdapter {
  constructor(private readonly red: ConsultasDeRed) {}

  estacionesDeLinea(lineaId: number): Promise<EstacionResumen[]> {
    return this.red.estacionesDeLinea(lineaId);
  }

  obtenerEstaciones(ids: readonly number[]): Promise<EstacionResumen[]> {
    return this.red.obtenerEstaciones(ids);
  }

  obtenerLineas(ids: readonly number[]): Promise<LineaResumen[]> {
    return this.red.obtenerLineas(ids);
  }

  listarEstaciones(): Promise<EstacionResumen[]> {
    return this.red.listarEstaciones();
  }

  listarLineas(): Promise<LineaResumen[]> {
    return this.red.listarLineas();
  }

  obtenerRed(): Promise<RedCompleta> {
    return this.red.obtenerRed();
  }
}
