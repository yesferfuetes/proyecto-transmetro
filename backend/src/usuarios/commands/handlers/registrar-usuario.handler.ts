import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { cifrarContrasena } from '../../../shared/seguridad/cifrador-de-contrasenas';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioRegistrado } from '../../events/eventos-de-usuarios';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { RegistrarUsuario } from '../impl/registrar-usuario.command';
import {
  exigirContrasenaFuerte,
  exigirCorreoLibre,
  exigirRol,
  normalizarCorreo,
  resolverEstacion,
} from './reglas-de-usuario';

@CommandHandler(RegistrarUsuario)
export class RegistrarUsuarioHandler implements ICommandHandler<RegistrarUsuario> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
    private readonly red: RedAdapter,
  ) {}

  async execute(comando: RegistrarUsuario): Promise<number> {
    const registrado = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const repositorio = contexto.repositorio(Usuario);
      const rol = exigirRol(comando.rol);
      const estacionId = await resolverEstacion(rol, comando.estacionId, this.red);
      const correo = normalizarCorreo(comando.correo);
      await exigirCorreoLibre(repositorio, correo, null);
      exigirContrasenaFuerte(comando.contrasena);
      const nuevo = Object.assign(new Usuario(), {
        nombre: comando.nombre.trim(),
        email: correo,
        passwordHash: await cifrarContrasena(comando.contrasena),
        rol,
        estacionId,
        activo: true,
      });
      const { id } = await repositorio.save(nuevo);
      return { id, rol, estacionId };
    });
    this.eventos.publish(
      new UsuarioRegistrado(comando.actorId, registrado.id, registrado.rol, registrado.estacionId),
    );
    return registrado.id;
  }
}
