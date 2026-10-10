import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { And, FindOptionsWhere, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import { TipoDeReporteInvalido } from '../../errors/errores-de-reportes';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { UsuariosAdapter } from '../../infrastructure/adapters/usuarios.adapter';
import { describirFiltros } from '../../services/describir-filtros';
import { leerFiltros } from '../../services/filtros';
import { desplazamiento, Pagina } from '../../services/paginacion';
import { leerRango } from '../../services/rango-de-fechas';
import { esTipoDeReporte } from '../../services/tipos-de-reporte';
import {
  ConsultaEnBitacora,
  FiltrosDeBitacora,
  ListarConsultasDeReporte,
} from '../impl/listar-consultas-de-reporte.query';

@QueryHandler(ListarConsultasDeReporte)
export class ListarConsultasDeReporteHandler implements IQueryHandler<ListarConsultasDeReporte> {
  constructor(
    @InjectRepository(ReporteConsulta) private readonly constancias: Repository<ReporteConsulta>,
    private readonly red: RedAdapter,
    private readonly usuarios: UsuariosAdapter,
  ) {}

  async execute({
    filtros,
    pagina,
  }: ListarConsultasDeReporte): Promise<Pagina<ConsultaEnBitacora>> {
    const [filas, total] = await this.constancias.findAndCount({
      where: this.condiciones(filtros),
      order: { fechaHora: 'DESC', id: 'DESC' },
      skip: desplazamiento(pagina),
      take: pagina.tamano,
    });
    const ids = [...new Set(filas.map((fila) => fila.usuarioId))];
    const [red, usuarios] = await Promise.all([
      this.red.obtenerRed(),
      ids.length === 0 ? Promise.resolve([]) : this.usuarios.obtenerUsuarios(ids),
    ]);
    const nombres = new Map(usuarios.map((u) => [u.id, u]));
    const elementos = filas.flatMap((fila) =>
      esTipoDeReporte(fila.tipoReporte)
        ? [
            {
              id: fila.id,
              usuario: nombres.get(fila.usuarioId) ?? {
                id: fila.usuarioId,
                nombre: '',
                correo: '',
              },
              tipo: fila.tipoReporte,
              filtros: describirFiltros(leerFiltros(fila.filtrosJson), red),
              fechaHora: fila.fechaHora,
            },
          ]
        : [],
    );
    return { elementos, total, ...pagina };
  }

  private condiciones(filtros: FiltrosDeBitacora): FindOptionsWhere<ReporteConsulta> {
    const { desde, hasta } = leerRango(filtros.desde, filtros.hasta);
    const donde: FindOptionsWhere<ReporteConsulta> = {};
    if (filtros.usuarioId !== undefined) {
      donde.usuarioId = filtros.usuarioId;
    }
    if (filtros.tipo !== undefined) {
      if (!esTipoDeReporte(filtros.tipo)) {
        throw new TipoDeReporteInvalido();
      }
      donde.tipoReporte = filtros.tipo;
    }
    if (desde !== null && hasta !== null) {
      donde.fechaHora = And(MoreThanOrEqual(desde), LessThan(hasta));
    } else if (desde !== null) {
      donde.fechaHora = MoreThanOrEqual(desde);
    } else if (hasta !== null) {
      donde.fechaHora = LessThan(hasta);
    }
    return donde;
  }
}
