import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import {
  cifrarContrasena,
  verificarContrasena,
} from '../../../shared/seguridad/cifrador-de-contrasenas';
import { Usuario } from '../../entities/usuario.entity';
import { CodigoDeUsuarios, UsuariosError } from '../../errors/businessError';
import { InicioDeSesionFallido } from '../../events/eventos-de-usuarios';
import { IniciarSesion } from '../impl/iniciar-sesion.command';
import { normalizarCorreo } from './reglas-de-usuario';

type Resultado = { usuarioId: number } | { rechazo: CodigoDeUsuarios };

@CommandHandler(IniciarSesion)
export class IniciarSesionHandler implements ICommandHandler<IniciarSesion> {
  /** Hash contra el que se compara cuando el correo no existe, para que la respuesta tarde igual. */
  private hashFicticio?: Promise<string>;

  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: IniciarSesion): Promise<number> {
    const correo = normalizarCorreo(comando.correo);
    const resultado = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const usuario = await contexto.repositorio(Usuario).findOne({
        select: { id: true, activo: true, passwordHash: true },
        where: { email: correo },
      });
      return this.evaluar(usuario, comando.contrasena);
    });
    if ('rechazo' in resultado) {
      this.eventos.publish(new InicioDeSesionFallido(correo));
      throw new UsuariosError(resultado.rechazo);
    }
    return resultado.usuarioId;
  }

  private async evaluar(usuario: Usuario | null, contrasena: string): Promise<Resultado> {
    if (!usuario) {
      await verificarContrasena(contrasena, await this.obtenerHashFicticio());
      return { rechazo: 'CREDENCIALES_INVALIDAS' };
    }
    if (!(await verificarContrasena(contrasena, usuario.passwordHash))) {
      return { rechazo: 'CREDENCIALES_INVALIDAS' };
    }
    return usuario.activo ? { usuarioId: usuario.id } : { rechazo: 'USUARIO_INACTIVO' };
  }

  private obtenerHashFicticio(): Promise<string> {
    this.hashFicticio ??= cifrarContrasena('contrasena-ficticia-1');
    return this.hashFicticio;
  }
}
