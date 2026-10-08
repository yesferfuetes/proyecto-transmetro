import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioReactivado } from '../../events/eventos-de-usuarios';
import { ReactivarUsuario } from '../impl/reactivar-usuario.command';
import { ReactivarUsuarioHandler } from './reactivar-usuario.handler';

describe('ReactivarUsuarioHandler', () => {
  let usuarios: Record<'findOneBy' | 'update', jest.Mock>;
  let publicar: jest.Mock;
  let handler: ReactivarUsuarioHandler;

  beforeEach(() => {
    const unidad = new UnidadDeTrabajoSimulada();
    usuarios = { findOneBy: jest.fn(), update: jest.fn() };
    unidad.registrar(Usuario, usuarios as unknown as RepositorioSimulado<Usuario>);
    publicar = jest.fn();
    handler = new ReactivarUsuarioHandler(unidad, { publish: publicar } as unknown as EventBus);
  });

  it('reactiva a un usuario desactivado, sin tocar su contraseña, y deja constancia', async () => {
    usuarios.findOneBy.mockResolvedValue(Object.assign(new Usuario(), { id: 9, activo: false }));

    await handler.execute(new ReactivarUsuario(9, 1));

    expect(usuarios.update).toHaveBeenCalledWith({ id: 9 }, { activo: true });
    expect(publicar).toHaveBeenCalledWith(new UsuarioReactivado(1, 9));
  });

  it('no cambia nada si ya estaba activo', async () => {
    usuarios.findOneBy.mockResolvedValue(Object.assign(new Usuario(), { id: 9, activo: true }));

    await handler.execute(new ReactivarUsuario(9, 1));

    expect(usuarios.update).not.toHaveBeenCalled();
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un usuario inexistente', async () => {
    usuarios.findOneBy.mockResolvedValue(null);

    await expect(handler.execute(new ReactivarUsuario(404, 1))).rejects.toMatchObject({
      codigo: 'USUARIO_NO_EXISTE',
    });
    expect(publicar).not.toHaveBeenCalled();
  });
});
