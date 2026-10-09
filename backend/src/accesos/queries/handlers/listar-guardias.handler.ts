import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import { GuardiaSeguridad } from '../../entities/guardia-seguridad.entity';
import { patronDeBusqueda } from '../../services/lectura';
import { desplazamiento, Pagina } from '../../services/paginacion';
import { GuardiaEnListado, ListarGuardias } from '../impl/listar-guardias.query';

@QueryHandler(ListarGuardias)
export class ListarGuardiasHandler implements IQueryHandler<ListarGuardias> {
  constructor(
    @InjectRepository(GuardiaSeguridad) private readonly guardias: Repository<GuardiaSeguridad>,
    @InjectRepository(AccesoGuardia) private readonly asignaciones: Repository<AccesoGuardia>,
  ) {}

  async execute({ busqueda, pagina }: ListarGuardias): Promise<Pagina<GuardiaEnListado>> {
    const total = await this.filtrar(busqueda).getCount();
    const filas = await this.filtrar(busqueda)
      .orderBy('g.nombre', 'ASC')
      .addOrderBy('g.id', 'ASC')
      .skip(desplazamiento(pagina))
      .take(pagina.tamano)
      .getMany();
    const cuentas = await this.contarAsignaciones(filas.map((fila) => fila.id));
    return {
      elementos: filas.map(({ id, nombre, dpi, telefono }) => ({
        id,
        nombre,
        dpi,
        telefono,
        asignaciones: cuentas.get(id) ?? 0,
        sinAsignacion: !cuentas.has(id),
      })),
      total,
      ...pagina,
    };
  }

  /** El DPI se busca con o sin los espacios entre grupos. */
  private filtrar(busqueda: string | undefined): SelectQueryBuilder<GuardiaSeguridad> {
    const consulta = this.guardias.createQueryBuilder('g');
    if (busqueda !== undefined && busqueda.trim() !== '') {
      consulta.andWhere(
        "(g.nombre ILIKE :patron OR g.dpi ILIKE :patron OR REPLACE(g.dpi, ' ', '') ILIKE :patronDpi)",
        {
          patron: patronDeBusqueda(busqueda),
          patronDpi: patronDeBusqueda(busqueda.replace(/\s/g, '')),
        },
      );
    }
    return consulta;
  }

  private async contarAsignaciones(guardiaIds: readonly number[]): Promise<Map<number, number>> {
    const cuentas = new Map<number, number>();
    if (guardiaIds.length === 0) {
      return cuentas;
    }
    const filas = await this.asignaciones.find({
      where: { guardiaId: In([...guardiaIds]) },
      select: { guardiaId: true },
    });
    for (const { guardiaId } of filas) {
      cuentas.set(guardiaId, (cuentas.get(guardiaId) ?? 0) + 1);
    }
    return cuentas;
  }
}
