import { Query } from '@nestjs/cqrs';
import type { AccesoEnListado, ReferenciaDeEstacion } from './listar-accesos.query';

export interface EstacionDeLineaConAccesos extends ReferenciaDeEstacion {
  /** Lugar de la estación en el recorrido, desde 1. */
  posicion: number;
  accesos: AccesoEnListado[];
  sinAccesos: boolean;
}

export interface AccesosDeLinea {
  linea: { id: number; codigo: string; nombre: string };
  estaciones: EstacionDeLineaConAccesos[];
}

export class ListarAccesosDeLinea extends Query<AccesosDeLinea> {
  constructor(readonly lineaId: number) {
    super();
  }
}
