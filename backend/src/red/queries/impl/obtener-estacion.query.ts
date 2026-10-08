import { Query } from '@nestjs/cqrs';
import type { EstadoDeLinea } from '../../../shared/contratos/red';
import type { ReferenciaDeMunicipalidad } from './listar-lineas.query';

export interface LineaDeEstacion {
  id: number;
  codigo: string;
  nombre: string;
  estado: EstadoDeLinea;
  /** Posición de la estación en el recorrido de esa línea. */
  posicion: number;
}

export interface DetalleDeEstacion {
  id: number;
  codigo: string;
  nombre: string;
  municipalidad: ReferenciaDeMunicipalidad;
  tieneParqueo: boolean;
  latitud: number | null;
  longitud: number | null;
  lineas: LineaDeEstacion[];
}

export class ObtenerEstacion extends Query<DetalleDeEstacion | null> {
  constructor(readonly id: number) {
    super();
  }
}
