import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { UsuariosError } from '../../errors/businessError';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ObtenerMiCuenta } from '../impl/obtener-mi-cuenta.query';
import type { EstacionAsignable, MiCuenta } from '../impl/vistas';
import { aEstacionAsignable, leerRol } from './lectura';

@QueryHandler(ObtenerMiCuenta)
export class ObtenerMiCuentaHandler implements IQueryHandler<ObtenerMiCuenta> {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly red: RedAdapter,
  ) {}

  async execute({ id }: ObtenerMiCuenta): Promise<MiCuenta> {
    const usuario = await this.usuarios.findOneBy({ id });
    if (!usuario) {
      throw new UsuariosError('USUARIO_NO_EXISTE');
    }
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.email,
      rol: leerRol(usuario),
      estacion: await this.estacion(usuario.estacionId),
    };
  }

  private async estacion(id: number | null): Promise<EstacionAsignable | null> {
    if (id === null) {
      return null;
    }
    const estacion = await this.red.obtenerEstacion(id);
    return estacion ? aEstacionAsignable(estacion) : null;
  }
}
