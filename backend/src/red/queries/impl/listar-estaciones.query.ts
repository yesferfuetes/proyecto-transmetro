import { Query } from '@nestjs/cqrs';
import type { Pagina, SolicitudDePagina } from '../../services/paginacion';
import type { ReferenciaDeMunicipalidad } from './listar-lineas.query';

export interface EstacionEnListado {
  id: number;
  codigo: string;
  nombre: string;
  municipalidad: ReferenciaDeMunicipalidad;
  tieneParqueo: boolean;
  lineas: { id: number; codigo: string }[];
  /** No está en el recorrido de ninguna línea. */
  sinLinea: boolean;
}

export interface FiltrosDeEstaciones {
  municipalidadId?: number;
  lineaId?: number;
  tieneParqueo?: boolean;
  /** Parte del código o del nombre. */
  busqueda?: string;
}

export class ListarEstaciones extends Query<Pagina<EstacionEnListado>> {
  constructor(
    readonly filtros: FiltrosDeEstaciones,
    readonly pagina: SolicitudDePagina,
  ) {
    super();
  }
}
