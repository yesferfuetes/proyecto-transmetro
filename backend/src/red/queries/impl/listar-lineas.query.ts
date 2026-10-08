import { Query } from '@nestjs/cqrs';
import type { EstadoDeLinea } from '../../../shared/contratos/red';
import type { Pagina, SolicitudDePagina } from '../../services/paginacion';

export interface ReferenciaDeMunicipalidad {
  id: number;
  nombre: string;
}

export interface LineaEnListado {
  id: number;
  codigo: string;
  nombre: string;
  municipalidad: ReferenciaDeMunicipalidad;
  estado: EstadoDeLinea;
  numeroDeEstaciones: number;
  longitudKm: number | null;
}

export interface FiltrosDeLineas {
  municipalidadId?: number;
  estado?: string;
  /** Solo las líneas que pasan por esta estación. */
  estacionId?: number;
}

export class ListarLineas extends Query<Pagina<LineaEnListado>> {
  constructor(
    readonly filtros: FiltrosDeLineas,
    readonly pagina: SolicitudDePagina,
  ) {
    super();
  }
}
