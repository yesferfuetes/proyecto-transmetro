import { Query } from '@nestjs/cqrs';
import type { EstadoDeLinea } from '../../../shared/contratos/red';
import type { EstadoDeFlota } from '../../services/rango-de-flota';

export interface FlotaDeLinea {
  linea: { id: number; codigo: string; nombre: string; estado: EstadoDeLinea };
  estaciones: number;
  minimo: number;
  maximo: number;
  buses: number;
  estadoDeFlota: EstadoDeFlota;
}

export class ListarFlotaPorLinea extends Query<FlotaDeLinea[]> {}
