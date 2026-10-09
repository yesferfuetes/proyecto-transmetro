import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import { Acceso } from '../../entities/acceso.entity';
import { LineaNoExiste } from '../../errors/errores-de-accesos';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { AccesosDeLinea, ListarAccesosDeLinea } from '../impl/listar-accesos-de-linea.query';
import { accesosPorEstacion } from './resumen-de-accesos';

@QueryHandler(ListarAccesosDeLinea)
export class ListarAccesosDeLineaHandler implements IQueryHandler<ListarAccesosDeLinea> {
  constructor(
    private readonly red: RedAdapter,
    @InjectRepository(Acceso) private readonly accesos: Repository<Acceso>,
    @InjectRepository(AccesoGuardia) private readonly asignaciones: Repository<AccesoGuardia>,
  ) {}

  async execute({ lineaId }: ListarAccesosDeLinea): Promise<AccesosDeLinea> {
    const linea = await this.red.obtenerLinea(lineaId);
    if (!linea) {
      throw new LineaNoExiste();
    }
    const estaciones = await this.red.estacionesDeLinea(lineaId);
    const accesos = await accesosPorEstacion(
      this.accesos,
      this.asignaciones,
      estaciones.map((estacion) => estacion.id),
    );
    return {
      linea: { id: linea.id, codigo: linea.codigo, nombre: linea.nombre },
      estaciones: estaciones.map(({ id, codigo, nombre }, indice) => {
        const delaEstacion = accesos.get(id) ?? [];
        return {
          posicion: indice + 1,
          id,
          codigo,
          nombre,
          accesos: delaEstacion,
          sinAccesos: delaEstacion.length === 0,
        };
      }),
    };
  }
}
