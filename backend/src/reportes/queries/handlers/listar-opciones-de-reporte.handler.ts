import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { UsuariosAdapter } from '../../infrastructure/adapters/usuarios.adapter';
import { compararTexto } from '../../services/armar-reportes';
import {
  ListarOpcionesDeReporte,
  OpcionesDeReporte,
} from '../impl/listar-opciones-de-reporte.query';

@QueryHandler(ListarOpcionesDeReporte)
export class ListarOpcionesDeReporteHandler implements IQueryHandler<ListarOpcionesDeReporte> {
  constructor(
    @InjectRepository(ReporteConsulta) private readonly constancias: Repository<ReporteConsulta>,
    private readonly red: RedAdapter,
    private readonly usuarios: UsuariosAdapter,
  ) {}

  async execute(): Promise<OpcionesDeReporte> {
    const [red, autores] = await Promise.all([
      this.red.obtenerRed(),
      this.constancias
        .createQueryBuilder('c')
        .select('c.usuario_id', 'usuarioId')
        .distinct(true)
        .getRawMany<{ usuarioId: number }>(),
    ]);
    const ids = autores.map((autor) => Number(autor.usuarioId));
    const usuarios = ids.length === 0 ? [] : await this.usuarios.obtenerUsuarios(ids);
    return {
      lineas: red.lineas
        .map(({ id, codigo, nombre }) => ({ id, codigo, nombre }))
        .sort((a, b) => compararTexto(a.codigo, b.codigo)),
      estaciones: red.estaciones
        .map(({ id, codigo, nombre }) => ({ id, codigo, nombre }))
        .sort((a, b) => compararTexto(a.codigo, b.codigo)),
      municipalidades: [...red.municipalidades].sort((a, b) => compararTexto(a.nombre, b.nombre)),
      usuarios: usuarios
        .map(({ id, nombre, correo }) => ({ id, nombre, correo }))
        .sort((a, b) => compararTexto(a.nombre, b.nombre)),
    };
  }
}
