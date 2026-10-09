import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { EstacionResumen } from '../../../shared/contratos/red';
import { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import { Acceso } from '../../entities/acceso.entity';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { porCodigo } from '../../services/lectura';
import { Pagina, paginar } from '../../services/paginacion';
import { EstacionConAccesos, FiltrosDeAccesos, ListarAccesos } from '../impl/listar-accesos.query';
import { accesosPorEstacion } from './resumen-de-accesos';

@QueryHandler(ListarAccesos)
export class ListarAccesosHandler implements IQueryHandler<ListarAccesos> {
  constructor(
    private readonly red: RedAdapter,
    @InjectRepository(Acceso) private readonly accesos: Repository<Acceso>,
    @InjectRepository(AccesoGuardia) private readonly asignaciones: Repository<AccesoGuardia>,
  ) {}

  /** Las estaciones (unas cien) se filtran y paginan en memoria; solo las de la página piden accesos. */
  async execute({ filtros, pagina }: ListarAccesos): Promise<Pagina<EstacionConAccesos>> {
    const estaciones = await this.estacionesDe(filtros);
    const delaPagina = paginar(estaciones.filter(coincideCon(filtros)).sort(porCodigo), pagina);
    const accesos = await accesosPorEstacion(
      this.accesos,
      this.asignaciones,
      delaPagina.elementos.map((estacion) => estacion.id),
    );
    return {
      ...delaPagina,
      elementos: delaPagina.elementos.map(({ id, codigo, nombre }) => ({
        estacion: { id, codigo, nombre },
        accesos: accesos.get(id) ?? [],
      })),
    };
  }

  private estacionesDe(filtros: FiltrosDeAccesos): Promise<EstacionResumen[]> {
    return filtros.lineaId === undefined
      ? this.red.listarEstaciones()
      : this.red.estacionesDeLinea(filtros.lineaId);
  }
}

function coincideCon(filtros: FiltrosDeAccesos): (estacion: EstacionResumen) => boolean {
  const texto = filtros.busqueda?.trim().toLocaleLowerCase('es') ?? '';
  return (estacion) =>
    (filtros.estacionId === undefined || estacion.id === filtros.estacionId) &&
    (texto === '' ||
      estacion.codigo.toLocaleLowerCase('es').includes(texto) ||
      estacion.nombre.toLocaleLowerCase('es').includes(texto));
}
