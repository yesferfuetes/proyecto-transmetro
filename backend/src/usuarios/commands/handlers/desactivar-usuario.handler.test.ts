import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioDesactivado } from '../../events/eventos-de-usuarios';
import { DesactivarUsuario } from '../impl/desactivar-usuario.command';
import { DesactivarUsuarioHandler } from './desactivar-usuario.handler';

const A = 1;
const B = 2;

function usuario(datos: Partial<Usuario>): Usuario {
  return Object.assign(new Usuario(), { rol: 'ADMINISTRADOR', activo: true, ...datos });
}

describe('DesactivarUsuarioHandler', () => {
  let unidad: UnidadDeTrabajoSimulada;
  let usuarios: Record<'findOneBy' | 'find' | 'update', jest.Mock>;
  let publicar: jest.Mock;
  let handler: DesactivarUsuarioHandler;

  beforeEach(() => {
    unidad = new UnidadDeTrabajoSimulada();
    usuarios = { findOneBy: jest.fn(), find: jest.fn(), update: jest.fn() };
    unidad.registrar(Usuario, usuarios as unknown as RepositorioSimulado<Usuario>);
    publicar = jest.fn();
    handler = new DesactivarUsuarioHandler(unidad, { publish: publicar } as unknown as EventBus);
  });

  it('con dos administradores activos, A desactiva a B y queda constancia de actor y afectado', async () => {
    usuarios.findOneBy.mockResolvedValue(usuario({ id: B }));
    usuarios.find.mockResolvedValue([usuario({ id: A }), usuario({ id: B })]);

    await handler.execute(new DesactivarUsuario(B, A));

    expect(usuarios.update).toHaveBeenCalledWith({ id: B }, { activo: false });
    expect(publicar).toHaveBeenCalledWith(new UsuarioDesactivado(A, B));
    const [evento] = publicar.mock.calls[0] as [UsuarioDesactivado];
    expect(evento).toMatchObject({
      usuarioId: A,
      accion: 'USUARIO_DESACTIVADO',
      entidad: 'usuario',
      entidadId: String(B),
    });
  });

  it('bloquea las filas de los administradores activos antes de contarlos', async () => {
    usuarios.findOneBy.mockResolvedValue(usuario({ id: B }));
    usuarios.find.mockResolvedValue([usuario({ id: A }), usuario({ id: B })]);

    await handler.execute(new DesactivarUsuario(B, A));

    expect(usuarios.find).toHaveBeenCalledWith(
      expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
    );
  });

  it('rechaza que un administrador se desactive a sí mismo', async () => {
    await expect(handler.execute(new DesactivarUsuario(A, A))).rejects.toMatchObject({
      codigo: 'AUTODESACTIVACION_NO_PERMITIDA',
    });
    expect(usuarios.update).not.toHaveBeenCalled();
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza desactivar al último administrador activo', async () => {
    usuarios.findOneBy.mockResolvedValue(usuario({ id: B }));
    usuarios.find.mockResolvedValue([usuario({ id: B })]);

    await expect(handler.execute(new DesactivarUsuario(B, A))).rejects.toMatchObject({
      codigo: 'ULTIMO_ADMINISTRADOR',
    });
    expect(usuarios.update).not.toHaveBeenCalled();
    expect(publicar).not.toHaveBeenCalled();
  });

  it('desactiva a un operador sin contar administradores', async () => {
    usuarios.findOneBy.mockResolvedValue(usuario({ id: 9, rol: 'OPERADOR_ESTACION' }));

    await handler.execute(new DesactivarUsuario(9, A));

    expect(usuarios.find).not.toHaveBeenCalled();
    expect(usuarios.update).toHaveBeenCalledWith({ id: 9 }, { activo: false });
  });

  it('no cambia nada ni deja constancia si el usuario ya estaba desactivado', async () => {
    usuarios.findOneBy.mockResolvedValue(usuario({ id: 9, activo: false }));

    await handler.execute(new DesactivarUsuario(9, A));

    expect(usuarios.update).not.toHaveBeenCalled();
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un usuario inexistente', async () => {
    usuarios.findOneBy.mockResolvedValue(null);

    await expect(handler.execute(new DesactivarUsuario(404, A))).rejects.toMatchObject({
      codigo: 'USUARIO_NO_EXISTE',
    });
  });
});
