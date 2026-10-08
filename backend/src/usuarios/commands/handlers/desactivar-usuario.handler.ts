import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Usuario } from '../../entities/usuario.entity';
import { UsuariosError } from '../../errors/businessError';
import { UsuarioDesactivado } from '../../events/eventos-de-usuarios';
import { DesactivarUsuario } from '../impl/desactivar-usuario.command';
import {
  buscarUsuario,
  esAdministradorActivo,
  exigirOtroAdministradorActivo,
} from './reglas-de-usuario';

@CommandHandler(DesactivarUsuario)
export class DesactivarUsuarioHandler implements ICommandHandler<DesactivarUsuario> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: DesactivarUsuario): Promise<void> {
    if (comando.id === comando.actorId) {
      throw new UsuariosError('AUTODESACTIVACION_NO_PERMITIDA');
    }
    const cambio = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const repositorio = contexto.repositorio(Usuario);
      const usuario = await buscarUsuario(repositorio, comando.id);
      if (!usuario.activo) {
        return false;
      }
      if (esAdministradorActivo(usuario)) {
        await exigirOtroAdministradorActivo(repositorio, usuario.id);
      }
      await repositorio.update({ id: usuario.id }, { activo: false });
      return true;
    });
    if (cambio) {
      this.eventos.publish(new UsuarioDesactivado(comando.actorId, comando.id));
    }
  }
}
