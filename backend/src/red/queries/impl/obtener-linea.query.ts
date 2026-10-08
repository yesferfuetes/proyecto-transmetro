import { Query } from '@nestjs/cqrs';
import type { EstadoDeLinea } from '../../../shared/contratos/red';
import type { ReferenciaDeMunicipalidad } from './listar-lineas.query';

export interface ParadaDelRecorrido {
  posicion: number;
  estacion: { id: number; codigo: string; nombre: string; municipalidadNombre: string };
  distanciaSiguienteKm: number | null;
  /** Distancia desde la primera estación hasta esta. */
  distanciaAcumuladaKm: number;
}

export interface DetalleDeLinea {
  id: number;
  codigo: string;
  nombre: string;
  municipalidad: ReferenciaDeMunicipalidad;
  estado: EstadoDeLinea;
  longitudKm: number | null;
  creadoEn: string;
  recorrido: ParadaDelRecorrido[];
}

export class ObtenerLinea extends Query<DetalleDeLinea | null> {
  constructor(readonly id: number) {
    super();
  }
}
