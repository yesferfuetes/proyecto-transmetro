import { Injectable } from '@nestjs/common';
import { ConsultasDeRed, EstacionResumen, LineaResumen } from '../../../shared/contratos/red';

/** Lo que accesos necesita de la red. Es lo único que este módulo conoce de ella. */
@Injectable()
export class RedAdapter {
  constructor(private readonly red: ConsultasDeRed) {}

  obtenerEstacion(id: number): Promise<EstacionResumen | null> {
    return this.red.obtenerEstacion(id);
  }

  obtenerEstaciones(ids: readonly number[]): Promise<EstacionResumen[]> {
    return this.red.obtenerEstaciones(ids);
  }

  listarEstaciones(): Promise<EstacionResumen[]> {
    return this.red.listarEstaciones();
  }

  obtenerLinea(id: number): Promise<LineaResumen | null> {
    return this.red.obtenerLinea(id);
  }

  /** Estaciones de la línea en el orden de su recorrido. */
  estacionesDeLinea(lineaId: number): Promise<EstacionResumen[]> {
    return this.red.estacionesDeLinea(lineaId);
  }
}
