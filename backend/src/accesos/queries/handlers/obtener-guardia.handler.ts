import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import { GuardiaSeguridad } from '../../entities/guardia-seguridad.entity';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { inicioEnMinutos } from '../../services/turnos';
import {
  AsignacionDeGuardia,
  DetalleDeGuardia,
  ObtenerGuardia,
} from '../impl/obtener-guardia.query';

@QueryHandler(ObtenerGuardia)
export class ObtenerGuardiaHandler implements IQueryHandler<ObtenerGuardia> {
  constructor(
    private readonly red: RedAdapter,
    @InjectRepository(GuardiaSeguridad) private readonly guardias: Repository<GuardiaSeguridad>,
    @InjectRepository(AccesoGuardia) private readonly asignaciones: Repository<AccesoGuardia>,
  ) {}

  async execute({ id }: ObtenerGuardia): Promise<DetalleDeGuardia | null> {
    const guardia = await this.guardias.findOneBy({ id });
    if (!guardia) {
      return null;
    }
    const filas = await this.asignaciones.find({
      where: { guardiaId: id },
      relations: { acceso: true },
    });
    const estaciones = await this.red.obtenerEstaciones([
      ...new Set(filas.flatMap(({ acceso }) => (acceso ? [acceso.estacionId] : []))),
    ]);
    const asignaciones = filas.flatMap(({ acceso, turno }): AsignacionDeGuardia[] => {
      const estacion = estaciones.find((candidata) => candidata.id === acceso?.estacionId);
      return acceso && estacion
        ? [
            {
              acceso: { id: acceso.id, codigo: acceso.codigo },
              estacion: { id: estacion.id, codigo: estacion.codigo, nombre: estacion.nombre },
              turno,
            },
          ]
        : [];
    });
    return {
      id: guardia.id,
      nombre: guardia.nombre,
      dpi: guardia.dpi,
      telefono: guardia.telefono,
      asignaciones: asignaciones.sort(
        (a, b) =>
          a.estacion.codigo.localeCompare(b.estacion.codigo, 'es', { numeric: true }) ||
          a.acceso.codigo.localeCompare(b.acceso.codigo, 'es') ||
          inicioEnMinutos(a.turno) - inicioEnMinutos(b.turno),
      ),
    };
  }
}
