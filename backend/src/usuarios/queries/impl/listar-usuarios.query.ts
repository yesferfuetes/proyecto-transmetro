import { Query } from '@nestjs/cqrs';
import type { Rol } from '../../../shared/auth/rol';
import type { PaginaDeUsuarios } from './vistas';

export interface FiltrosDeUsuarios {
  rol?: Rol;
  estacionId?: number;
  activo?: boolean;
  /** Parte del nombre o del correo, sin distinguir mayúsculas. */
  busqueda?: string;
}

export class ListarUsuarios extends Query<PaginaDeUsuarios> {
  constructor(
    readonly filtros: FiltrosDeUsuarios,
    readonly pagina: number,
    readonly tamano: number,
  ) {
    super();
  }
}
