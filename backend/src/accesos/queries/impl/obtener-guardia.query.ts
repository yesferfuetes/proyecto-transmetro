import { Query } from '@nestjs/cqrs';
import type { ReferenciaDeEstacion } from './listar-accesos.query';

export interface AsignacionDeGuardia {
  acceso: { id: number; codigo: string };
  estacion: ReferenciaDeEstacion;
  turno: string;
}

export interface DetalleDeGuardia {
  id: number;
  nombre: string;
  dpi: string;
  telefono: string | null;
  asignaciones: AsignacionDeGuardia[];
}

export class ObtenerGuardia extends Query<DetalleDeGuardia | null> {
  constructor(readonly id: number) {
    super();
  }
}
