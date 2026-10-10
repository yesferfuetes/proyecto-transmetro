import { Query } from '@nestjs/cqrs';
import type { Pagina, SolicitudDePagina } from '../../services/paginacion';
import type { FiltrosConNombres, TipoDeReporte } from '../../services/tipos-de-reporte';

export interface FiltrosDeBitacora {
  usuarioId?: number;
  tipo?: string;
  /** Día `AAAA-MM-DD` de Guatemala, inclusivo. */
  desde?: string;
  /** Día `AAAA-MM-DD` de Guatemala, inclusivo. */
  hasta?: string;
}

export interface ConsultaEnBitacora {
  id: number;
  usuario: { id: number; nombre: string; correo: string };
  tipo: TipoDeReporte;
  filtros: FiltrosConNombres;
  fechaHora: Date;
}

export class ListarConsultasDeReporte extends Query<Pagina<ConsultaEnBitacora>> {
  constructor(
    readonly filtros: FiltrosDeBitacora,
    readonly pagina: SolicitudDePagina,
  ) {
    super();
  }
}
