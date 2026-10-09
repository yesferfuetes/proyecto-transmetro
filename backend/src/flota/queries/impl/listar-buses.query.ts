import { Query } from '@nestjs/cqrs';
import type { EstadoDeBus } from '../../../shared/contratos/flota';
import type { Pagina, SolicitudDePagina } from '../../services/paginacion';

export interface BusEnVista {
  id: number;
  placa: string;
  capacidadMax: number;
  estado: EstadoDeBus;
  linea: { id: number; codigo: string; nombre: string } | null;
  parqueo: { id: number; codigo: string; estacion: { id: number; nombre: string } };
}

export interface FiltrosDeBuses {
  lineaId?: number;
  sinLinea?: boolean;
  estado?: string;
  parqueoId?: number;
  busqueda?: string;
}

export class ListarBuses extends Query<Pagina<BusEnVista>> {
  constructor(
    readonly filtros: FiltrosDeBuses,
    readonly pagina: SolicitudDePagina,
  ) {
    super();
  }
}
