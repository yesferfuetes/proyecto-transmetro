import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { cifrarContrasena } from '../../../shared/seguridad/cifrador-de-contrasenas';
import { Usuario } from '../../entities/usuario.entity';
import { ContrasenaAsignada } from '../../events/eventos-de-usuarios';
import { AsignarContrasena } from '../impl/asignar-contrasena.command';
import { buscarUsuario, exigirContrasenaFuerte } from './reglas-de-usuario';

@CommandHandler(AsignarContrasena)
export class AsignarContrasenaHandler implements ICommandHandler<AsignarContrasena> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: AsignarContrasena): Promise<void> {
    await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const repositorio = contexto.repositorio(Usuario);
      const usuario = await buscarUsuario(repositorio, comando.id);
      exigirContrasenaFuerte(comando.contrasena);
      const passwordHash = await cifrarContrasena(comando.contrasena);
      await repositorio.update({ id: usuario.id }, { passwordHash });
    });
    this.eventos.publish(new ContrasenaAsignada(comando.actorId, comando.id));
  }
}
