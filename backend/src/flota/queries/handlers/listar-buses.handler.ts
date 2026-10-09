import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository, SelectQueryBuilder } from 'typeorm';
import { Bus } from '../../entities/bus.entity';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { patronDeBusqueda } from '../../services/lectura';
import { desplazamiento, Pagina } from '../../services/paginacion';
import {
  armarBusesEnVista,
  consultaDeBuses,
  FilaDeBus,
  seleccionarFilasDeBus,
} from '../../services/vista-de-buses';
import { BusEnVista, FiltrosDeBuses, ListarBuses } from '../impl/listar-buses.query';

@QueryHandler(ListarBuses)
export class ListarBusesHandler implements IQueryHandler<ListarBuses> {
  constructor(
    @InjectRepository(Bus) private readonly buses: Repository<Bus>,
    private readonly red: RedAdapter,
  ) {}

  async execute({ filtros, pagina }: ListarBuses): Promise<Pagina<BusEnVista>> {
    const total = await this.filtrar(filtros).getCount();
    const filas = await seleccionarFilasDeBus(this.filtrar(filtros))
      .orderBy('b.placa', 'ASC')
      .offset(desplazamiento(pagina))
      .limit(pagina.tamano)
      .getRawMany<FilaDeBus>();
    return { elementos: await armarBusesEnVista(filas, this.red), total, ...pagina };
  }

  private filtrar(filtros: FiltrosDeBuses): SelectQueryBuilder<Bus> {
    const consulta = consultaDeBuses(this.buses);
    if (filtros.sinLinea === true) {
      consulta.andWhere('b.linea_id IS NULL');
    } else if (filtros.lineaId !== undefined) {
      consulta.andWhere('b.linea_id = :lineaId', { lineaId: filtros.lineaId });
    }
    if (filtros.estado !== undefined) {
      consulta.andWhere('b.estado = :estado', { estado: filtros.estado });
    }
    if (filtros.parqueoId !== undefined) {
      consulta.andWhere('b.parqueo_id = :parqueoId', { parqueoId: filtros.parqueoId });
    }
    if (filtros.busqueda !== undefined && filtros.busqueda.trim() !== '') {
      consulta.andWhere("b.placa ILIKE :busqueda ESCAPE '\\'", {
        busqueda: patronDeBusqueda(filtros.busqueda),
      });
    }
    return consulta;
  }
}
