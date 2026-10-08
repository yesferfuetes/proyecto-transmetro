import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { FiltrosDeUsuarios, ListarUsuarios } from '../impl/listar-usuarios.query';
import type { EstacionAsignable, PaginaDeUsuarios } from '../impl/vistas';
import { aEstacionAsignable, leerRol } from './lectura';

@QueryHandler(ListarUsuarios)
export class ListarUsuariosHandler implements IQueryHandler<ListarUsuarios> {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly red: RedAdapter,
  ) {}

  async execute({ filtros, pagina, tamano }: ListarUsuarios): Promise<PaginaDeUsuarios> {
    const [filas, total] = await this.usuarios.findAndCount({
      where: condiciones(filtros),
      order: { nombre: 'ASC', id: 'ASC' },
      skip: (pagina - 1) * tamano,
      take: tamano,
    });
    const estaciones = await this.estacionesPorId(filas);
    const elementos = filas.map((usuario) => ({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.email,
      rol: leerRol(usuario),
      estacion: usuario.estacionId === null ? null : (estaciones.get(usuario.estacionId) ?? null),
      activo: usuario.activo,
    }));
    return { elementos, total, pagina, tamano };
  }

  /** Una sola consulta a la red por página. */
  private async estacionesPorId(filas: Usuario[]): Promise<Map<number, EstacionAsignable>> {
    const ids = [
      ...new Set(
        filas.flatMap((usuario) => (usuario.estacionId === null ? [] : [usuario.estacionId])),
      ),
    ];
    if (ids.length === 0) {
      return new Map();
    }
    const estaciones = await this.red.obtenerEstaciones(ids);
    return new Map(estaciones.map((estacion) => [estacion.id, aEstacionAsignable(estacion)]));
  }
}

function condiciones(filtros: FiltrosDeUsuarios): FindOptionsWhere<Usuario>[] {
  const base: FindOptionsWhere<Usuario> = {};
  if (filtros.rol !== undefined) {
    base.rol = filtros.rol;
  }
  if (filtros.estacionId !== undefined) {
    base.estacionId = filtros.estacionId;
  }
  if (filtros.activo !== undefined) {
    base.activo = filtros.activo;
  }
  const busqueda = filtros.busqueda?.trim();
  if (!busqueda) {
    return [base];
  }
  const patron = ILike(`%${escaparComodines(busqueda)}%`);
  return [
    { ...base, nombre: patron },
    { ...base, email: patron },
  ];
}

/** `%` y `_` escritos por la persona se buscan como texto, no como comodines. */
function escaparComodines(texto: string): string {
  return texto.replace(/[\\%_]/g, (caracter) => `\\${caracter}`);
}
