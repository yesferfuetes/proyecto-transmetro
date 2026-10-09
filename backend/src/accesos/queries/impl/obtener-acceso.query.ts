import { Query } from '@nestjs/cqrs';
import type { ReferenciaDeEstacion } from './listar-accesos.query';

export interface AsignacionDeAcceso {
  guardia: { id: number; nombre: string; dpi: string };
  turno: string;
}

export interface DetalleDeAcceso {
  id: number;
  codigo: string;
  nombre: string | null;
  estacion: ReferenciaDeEstacion;
  /** Ordenadas por inicio de turno. */
  asignaciones: AsignacionDeAcceso[];
}

export class ObtenerAcceso extends Query<DetalleDeAcceso | null> {
  constructor(readonly id: number) {
    super();
  }
}
