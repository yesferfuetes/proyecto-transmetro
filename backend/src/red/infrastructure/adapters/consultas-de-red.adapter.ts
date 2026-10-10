import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ConsultasDeRed,
  EstacionResumen,
  LineaResumen,
  RedCompleta,
} from '../../../shared/contratos/red';
import { ListarEstacionesDeLinea } from '../../queries/impl/listar-estaciones-de-linea.query';
import { ObtenerEstacionesResumen } from '../../queries/impl/obtener-estaciones-resumen.query';
import { ObtenerLineasResumen } from '../../queries/impl/obtener-lineas-resumen.query';
import { ObtenerRedCompleta } from '../../queries/impl/obtener-red-completa.query';

/** Lo que la red ofrece a los demás módulos. Nunca lanza por un id inexistente. */
@Injectable()
export class ConsultasDeRedAdapter extends ConsultasDeRed {
  constructor(private readonly consultas: QueryBus) {
    super();
  }

  async obtenerEstacion(id: number): Promise<EstacionResumen | null> {
    const [estacion] = await this.consultas.execute(new ObtenerEstacionesResumen([id]));
    return estacion ?? null;
  }

  obtenerEstaciones(ids: readonly number[]): Promise<EstacionResumen[]> {
    return this.consultas.execute(new ObtenerEstacionesResumen(ids));
  }

  listarEstaciones(): Promise<EstacionResumen[]> {
    return this.consultas.execute(new ObtenerEstacionesResumen());
  }

  async obtenerLinea(id: number): Promise<LineaResumen | null> {
    const [linea] = await this.consultas.execute(new ObtenerLineasResumen([id]));
    return linea ?? null;
  }

  obtenerLineas(ids: readonly number[]): Promise<LineaResumen[]> {
    return this.consultas.execute(new ObtenerLineasResumen(ids));
  }

  listarLineas(): Promise<LineaResumen[]> {
    return this.consultas.execute(new ObtenerLineasResumen());
  }

  estacionesDeLinea(lineaId: number): Promise<EstacionResumen[]> {
    return this.consultas.execute(new ListarEstacionesDeLinea(lineaId));
  }

  obtenerRed(): Promise<RedCompleta> {
    return this.consultas.execute(new ObtenerRedCompleta());
  }
}
