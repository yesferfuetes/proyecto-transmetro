import { Query } from '@nestjs/cqrs';
import type { Pagina, SolicitudDePagina } from '../../services/paginacion';

export interface GuardiaEnListado {
  id: number;
  nombre: string;
  dpi: string;
  telefono: string | null;
  asignaciones: number;
  sinAsignacion: boolean;
}

export class ListarGuardias extends Query<Pagina<GuardiaEnListado>> {
  constructor(
    /** Parte del nombre o del DPI. */
    readonly busqueda: string | undefined,
    readonly pagina: SolicitudDePagina,
  ) {
    super();
  }
}
