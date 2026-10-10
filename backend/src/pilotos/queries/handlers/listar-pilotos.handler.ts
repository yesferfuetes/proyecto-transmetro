import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository, SelectQueryBuilder } from 'typeorm';
import { Piloto } from '../../entities/piloto.entity';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { patronDeBusqueda, sinTildes } from '../../services/lectura';
import { desplazamiento, Pagina } from '../../services/paginacion';
import { armarListado } from '../../services/vista-de-pilotos';
import { FiltrosDePilotos, ListarPilotos, PilotoEnListado } from '../impl/listar-pilotos.query';

@QueryHandler(ListarPilotos)
export class ListarPilotosHandler implements IQueryHandler<ListarPilotos> {
  constructor(
    @InjectRepository(Piloto) private readonly pilotos: Repository<Piloto>,
    private readonly flota: FlotaAdapter,
    private readonly red: RedAdapter,
  ) {}

  async execute({ filtros, completo, pagina }: ListarPilotos): Promise<Pagina<PilotoEnListado>> {
    const busesDeLinea = await this.busesDeLaLinea(filtros);
    const total = await this.filtrar(filtros, completo, busesDeLinea).getCount();
    const filas = await this.filtrar(filtros, completo, busesDeLinea)
      .orderBy('p.nombre', 'ASC')
      .addOrderBy('p.id', 'ASC')
      .skip(desplazamiento(pagina))
      .take(pagina.tamano)
      .getMany();
    const elementos = await armarListado(filas, completo, this.flota, this.red);
    return { elementos, total, ...pagina };
  }

  /** Ids de los buses de la línea filtrada; `null` si no se filtra por línea. */
  private async busesDeLaLinea(filtros: FiltrosDePilotos): Promise<number[] | null> {
    if (filtros.sinBus === true || filtros.lineaId === undefined) {
      return null;
    }
    const buses = await this.flota.busesDeLinea(filtros.lineaId);
    return buses.map(({ id }) => id);
  }

  private filtrar(
    filtros: FiltrosDePilotos,
    completo: boolean,
    busesDeLinea: number[] | null,
  ): SelectQueryBuilder<Piloto> {
    const consulta = this.pilotos.createQueryBuilder('p');
    if (filtros.sinBus === true) {
      consulta.andWhere('p.busId IS NULL');
    } else {
      this.filtrarPorBus(consulta, filtros.busId, busesDeLinea);
    }
    const busqueda = filtros.busqueda?.trim() ?? '';
    if (busqueda !== '') {
      this.buscar(consulta, busqueda, completo);
    }
    return consulta;
  }

  private filtrarPorBus(
    consulta: SelectQueryBuilder<Piloto>,
    busId: number | undefined,
    busesDeLinea: number[] | null,
  ): void {
    if (busId !== undefined) {
      consulta.andWhere('p.busId = :busId', { busId });
    }
    if (busesDeLinea?.length === 0) {
      consulta.andWhere('1 = 0');
    } else if (busesDeLinea) {
      consulta.andWhere('p.busId IN (:...busesDeLinea)', { busesDeLinea });
    }
  }

  /** El nombre se busca sin mayúsculas ni tildes; el DPI, solo en la vista completa y sin espacios. */
  private buscar(consulta: SelectQueryBuilder<Piloto>, busqueda: string, completo: boolean): void {
    const porNombre = `${sinTildes('p.nombre')} LIKE ${sinTildes(':patron')} ESCAPE '\\'`;
    if (!completo) {
      consulta.andWhere(`(${porNombre})`, { patron: patronDeBusqueda(busqueda) });
      return;
    }
    consulta.andWhere(`(${porNombre} OR REPLACE(p.dpi, ' ', '') LIKE :patronDpi ESCAPE '\\')`, {
      patron: patronDeBusqueda(busqueda),
      patronDpi: patronDeBusqueda(busqueda.replace(/\s/g, '')),
    });
  }
}
