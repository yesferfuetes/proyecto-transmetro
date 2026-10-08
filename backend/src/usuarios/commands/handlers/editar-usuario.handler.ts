import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import type { Repository } from 'typeorm';
import type { Rol } from '../../../shared/auth/rol';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioEditado } from '../../events/eventos-de-usuarios';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { CambiosDeUsuario, EditarUsuario } from '../impl/editar-usuario.command';
import {
  buscarUsuario,
  esAdministradorActivo,
  exigirCorreoLibre,
  exigirOtroAdministradorActivo,
  exigirRol,
  normalizarCorreo,
  resolverEstacion,
} from './reglas-de-usuario';

interface ValoresResultantes {
  nombre: string;
  email: string;
  rol: Rol;
  estacionId: number | null;
}

/** Nombre de cada campo tal como se informa en la auditoría. */
const CAMPOS: ReadonlyArray<[keyof ValoresResultantes, string]> = [
  ['nombre', 'nombre'],
  ['email', 'correo'],
  ['rol', 'rol'],
  ['estacionId', 'estacion'],
];

@CommandHandler(EditarUsuario)
export class EditarUsuarioHandler implements ICommandHandler<EditarUsuario> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
    private readonly red: RedAdapter,
  ) {}

  async execute(comando: EditarUsuario): Promise<void> {
    const campos = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const repositorio = contexto.repositorio(Usuario);
      const usuario = await buscarUsuario(repositorio, comando.id);
      const resultantes = await this.resolver(repositorio, usuario, comando.cambios);
      if (esAdministradorActivo(usuario) && resultantes.rol !== 'ADMINISTRADOR') {
        await exigirOtroAdministradorActivo(repositorio, usuario.id);
      }
      const cambiados = CAMPOS.filter(([campo]) => usuario[campo] !== resultantes[campo]);
      if (cambiados.length > 0) {
        await repositorio.update({ id: usuario.id }, resultantes);
      }
      return cambiados.map(([, nombre]) => nombre);
    });
    if (campos.length > 0) {
      this.eventos.publish(new UsuarioEditado(comando.actorId, comando.id, campos));
    }
  }

  /**
   * Calcula el rol y la estación resultantes (lo que llega o lo que ya tenía) y los valida juntos:
   * un operador que deja de serlo pierde su estación aunque no se indique.
   */
  private async resolver(
    repositorio: Repository<Usuario>,
    usuario: Usuario,
    cambios: CambiosDeUsuario,
  ): Promise<ValoresResultantes> {
    const rol = exigirRol(cambios.rol ?? usuario.rol);
    const estacionId = await resolverEstacion(rol, estacionPedida(rol, usuario, cambios), this.red);
    const email = cambios.correo === undefined ? usuario.email : normalizarCorreo(cambios.correo);
    if (email !== usuario.email) {
      await exigirCorreoLibre(repositorio, email, usuario.id);
    }
    const nombre = cambios.nombre === undefined ? usuario.nombre : cambios.nombre.trim();
    return { nombre, email, rol, estacionId };
  }
}

/** La estación indicada; si no se indica, la actual solo cuando el rol resultante es operador. */
function estacionPedida(rol: Rol, usuario: Usuario, cambios: CambiosDeUsuario): number | null {
  if (cambios.estacionId !== undefined) {
    return cambios.estacionId;
  }
  return rol === 'OPERADOR_ESTACION' ? usuario.estacionId : null;
}
