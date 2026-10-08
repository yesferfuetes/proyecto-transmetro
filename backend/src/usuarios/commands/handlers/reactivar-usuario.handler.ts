import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioReactivado } from '../../events/eventos-de-usuarios';
import { ReactivarUsuario } from '../impl/reactivar-usuario.command';
import { buscarUsuario } from './reglas-de-usuario';

@CommandHandler(ReactivarUsuario)
export class ReactivarUsuarioHandler implements ICommandHandler<ReactivarUsuario> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: ReactivarUsuario): Promise<void> {
    const cambio = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const repositorio = contexto.repositorio(Usuario);
      const usuario = await buscarUsuario(repositorio, comando.id);
      if (usuario.activo) {
        return false;
      }
      await repositorio.update({ id: usuario.id }, { activo: true });
      return true;
    });
    if (cambio) {
      this.eventos.publish(new UsuarioReactivado(comando.actorId, comando.id));
    }
  }
}
