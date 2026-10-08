import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { UsuariosError } from '../../errors/businessError';
import { ObtenerUsuario } from '../impl/obtener-usuario.query';
import type { UsuarioDetalle } from '../impl/vistas';
import { leerRol } from './lectura';

@QueryHandler(ObtenerUsuario)
export class ObtenerUsuarioHandler implements IQueryHandler<ObtenerUsuario> {
  constructor(@InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>) {}

  async execute({ id }: ObtenerUsuario): Promise<UsuarioDetalle> {
    const usuario = await this.usuarios.findOneBy({ id });
    if (!usuario) {
      throw new UsuariosError('USUARIO_NO_EXISTE');
    }
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.email,
      rol: leerRol(usuario),
      estacionId: usuario.estacionId,
      activo: usuario.activo,
      creadoEn: usuario.creadoEn,
    };
  }
}
