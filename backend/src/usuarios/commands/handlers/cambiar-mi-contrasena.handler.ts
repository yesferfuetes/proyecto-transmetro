import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import {
  cifrarContrasena,
  verificarContrasena,
} from '../../../shared/seguridad/cifrador-de-contrasenas';
import { Usuario } from '../../entities/usuario.entity';
import { UsuariosError } from '../../errors/businessError';
import { ContrasenaCambiada } from '../../events/eventos-de-usuarios';
import { CambiarMiContrasena } from '../impl/cambiar-mi-contrasena.command';
import { exigirContrasenaFuerte } from './reglas-de-usuario';

@CommandHandler(CambiarMiContrasena)
export class CambiarMiContrasenaHandler implements ICommandHandler<CambiarMiContrasena> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: CambiarMiContrasena): Promise<void> {
    await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const repositorio = contexto.repositorio(Usuario);
      const usuario = await repositorio.findOne({
        select: { id: true, passwordHash: true },
        where: { id: comando.actorId },
      });
      if (!usuario) {
        throw new UsuariosError('USUARIO_NO_EXISTE');
      }
      if (!(await verificarContrasena(comando.contrasenaActual, usuario.passwordHash))) {
        throw new UsuariosError('CREDENCIALES_INVALIDAS');
      }
      exigirContrasenaFuerte(comando.contrasenaNueva);
      const passwordHash = await cifrarContrasena(comando.contrasenaNueva);
      await repositorio.update({ id: usuario.id }, { passwordHash });
    });
    this.eventos.publish(new ContrasenaCambiada(comando.actorId));
  }
}
