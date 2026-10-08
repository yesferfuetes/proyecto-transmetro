import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { esRol } from '../../../shared/auth/rol';
import type { UsuarioSesion } from '../../../shared/auth/usuario-sesion';
import { Usuario } from '../../entities/usuario.entity';
import { ObtenerUsuarioDeSesion } from '../impl/obtener-usuario-de-sesion.query';

@QueryHandler(ObtenerUsuarioDeSesion)
export class ObtenerUsuarioDeSesionHandler implements IQueryHandler<ObtenerUsuarioDeSesion> {
  constructor(@InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>) {}

  async execute({ id }: ObtenerUsuarioDeSesion): Promise<UsuarioSesion | null> {
    const usuario = await this.usuarios.findOneBy({ id, activo: true });
    if (!usuario || !esRol(usuario.rol)) {
      return null;
    }
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.email,
      rol: usuario.rol,
      estacionId: usuario.estacionId,
    };
  }
}
