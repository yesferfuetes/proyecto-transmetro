import { Query } from '@nestjs/cqrs';
import type { EstadoDeBus } from '../../../shared/contratos/flota';
import type { Pagina, SolicitudDePagina } from '../../services/paginacion';

/** Lo que ve el operador: sin DPI, dirección, correo ni historial. */
export interface PilotoReducido {
  id: number;
  nombre: string;
  telefono: string | null;
  bus: { id: number; placa: string; estado: EstadoDeBus } | null;
  linea: { id: number; codigo: string; nombre: string } | null;
  busDeBaja: boolean;
}

export interface PilotoEnListadoCompleto extends PilotoReducido {
  dpi: string;
}

export type PilotoEnListado = PilotoReducido | PilotoEnListadoCompleto;

export interface FiltrosDePilotos {
  lineaId?: number;
  busId?: number;
  sinBus?: boolean;
  busqueda?: string;
}

/** `completo` lo decide el servidor según el rol; solo con él se busca por DPI y se muestra. */
export class ListarPilotos extends Query<Pagina<PilotoEnListado>> {
  constructor(
    readonly filtros: FiltrosDePilotos,
    readonly completo: boolean,
    readonly pagina: SolicitudDePagina,
  ) {
    super();
  }
}
