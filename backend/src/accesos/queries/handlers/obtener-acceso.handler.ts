import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import { Acceso } from '../../entities/acceso.entity';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { inicioEnMinutos } from '../../services/turnos';
import { DetalleDeAcceso, ObtenerAcceso } from '../impl/obtener-acceso.query';

@QueryHandler(ObtenerAcceso)
export class ObtenerAccesoHandler implements IQueryHandler<ObtenerAcceso> {
  constructor(
    private readonly red: RedAdapter,
    @InjectRepository(Acceso) private readonly accesos: Repository<Acceso>,
    @InjectRepository(AccesoGuardia) private readonly asignaciones: Repository<AccesoGuardia>,
  ) {}

  async execute({ id }: ObtenerAcceso): Promise<DetalleDeAcceso | null> {
    const acceso = await this.accesos.findOneBy({ id });
    const estacion = acceso ? await this.red.obtenerEstacion(acceso.estacionId) : null;
    if (!acceso || !estacion) {
      return null;
    }
    const asignaciones = await this.asignaciones.find({
      where: { accesoId: id },
      relations: { guardia: true },
    });
    return {
      id: acceso.id,
      codigo: acceso.codigo,
      nombre: acceso.nombre,
      estacion: { id: estacion.id, codigo: estacion.codigo, nombre: estacion.nombre },
      asignaciones: asignaciones
        .flatMap(({ guardia, turno }) =>
          guardia
            ? [{ guardia: { id: guardia.id, nombre: guardia.nombre, dpi: guardia.dpi }, turno }]
            : [],
        )
        .sort(
          (a, b) =>
            inicioEnMinutos(a.turno) - inicioEnMinutos(b.turno) ||
            a.guardia.nombre.localeCompare(b.guardia.nombre, 'es'),
        ),
    };
  }
}
