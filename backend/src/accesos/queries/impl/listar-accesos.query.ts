import { Query } from '@nestjs/cqrs';
import type { Pagina, SolicitudDePagina } from '../../services/paginacion';

export interface AccesoEnListado {
  id: number;
  codigo: string;
  nombre: string | null;
  /** Guardias distintos asignados al acceso. */
  guardias: number;
}

export interface ReferenciaDeEstacion {
  id: number;
  codigo: string;
  nombre: string;
}

export interface EstacionConAccesos {
  estacion: ReferenciaDeEstacion;
  accesos: AccesoEnListado[];
}

export interface FiltrosDeAccesos {
  lineaId?: number;
  estacionId?: number;
  /** Parte del código o del nombre de la estación. */
  busqueda?: string;
}

export class ListarAccesos extends Query<Pagina<EstacionConAccesos>> {
  constructor(
    readonly filtros: FiltrosDeAccesos,
    readonly pagina: SolicitudDePagina,
  ) {
    super();
  }
}
