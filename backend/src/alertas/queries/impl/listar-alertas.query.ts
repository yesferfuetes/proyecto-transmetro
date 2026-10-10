import { Query } from '@nestjs/cqrs';
import type { Pagina, SolicitudDePagina } from '../../services/paginacion';
import type { EstadoDeAlerta } from '../../services/tipos-de-alerta';

export interface AlertaEnVista {
  id: number;
  tipo: string;
  aviso: string;
  porcentaje: number;
  fechaHora: string;
  atendida: boolean;
  estacion: { id: number; codigo: string; nombre: string };
  bus: { id: number; placa: string };
  linea: { id: number; codigo: string; nombre: string } | null;
  atendidaPor: { id: number; nombre: string } | null;
}

export interface FiltrosDeAlertas {
  estacionId?: number;
  lineaId?: number;
  estado?: EstadoDeAlerta;
  tipo?: string;
}

export class ListarAlertas extends Query<Pagina<AlertaEnVista>> {
  constructor(
    readonly filtros: FiltrosDeAlertas,
    readonly pagina: SolicitudDePagina,
  ) {
    super();
  }
}
