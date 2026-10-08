import { Query } from '@nestjs/cqrs';
import type { Pagina, SolicitudDePagina } from '../../services/paginacion';

export interface MunicipalidadEnListado {
  id: number;
  nombre: string;
  departamento: string | null;
  fechaIncorporacion: string | null;
  numeroDeLineas: number;
  numeroDeEstaciones: number;
  /** Sin líneas ni estaciones: la red aún no llega a ella. */
  sinRed: boolean;
}

export class ListarMunicipalidades extends Query<Pagina<MunicipalidadEnListado>> {
  constructor(readonly pagina: SolicitudDePagina) {
    super();
  }
}
