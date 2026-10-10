import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { UsuarioResumen } from '../../../shared/contratos/usuarios';
import { Usuario } from '../../entities/usuario.entity';
import { ObtenerUsuariosResumen } from '../impl/obtener-usuarios-resumen.query';

@QueryHandler(ObtenerUsuariosResumen)
export class ObtenerUsuariosResumenHandler implements IQueryHandler<ObtenerUsuariosResumen> {
  constructor(@InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>) {}

  async execute({ ids }: ObtenerUsuariosResumen): Promise<UsuarioResumen[]> {
    if (ids.length === 0) {
      return [];
    }
    const encontrados = await this.usuarios.find({
      where: { id: In([...ids]) },
      order: { id: 'ASC' },
    });
    return encontrados.map(({ id, nombre, email }) => ({ id, nombre, correo: email }));
  }
}
