import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Usuario } from '../../entities/usuario.entity';
import { ContrasenaAsignada } from '../../events/eventos-de-usuarios';
import { AsignarContrasena } from '../impl/asignar-contrasena.command';
import { AsignarContrasenaHandler } from './asignar-contrasena.handler';

jest.mock('../../../shared/seguridad/cifrador-de-contrasenas', () => ({
  cifrarContrasena: jest.fn((texto: string) => Promise.resolve(`cifrada:${texto}`)),
}));

describe('AsignarContrasenaHandler', () => {
  let usuarios: Record<'findOneBy' | 'update', jest.Mock>;
  let publicar: jest.Mock;
  let handler: AsignarContrasenaHandler;

  beforeEach(() => {
    const unidad = new UnidadDeTrabajoSimulada();
    usuarios = { findOneBy: jest.fn(), update: jest.fn() };
    unidad.registrar(Usuario, usuarios as unknown as RepositorioSimulado<Usuario>);
    usuarios.findOneBy.mockResolvedValue(Object.assign(new Usuario(), { id: 9, activo: true }));
    publicar = jest.fn();
    handler = new AsignarContrasenaHandler(unidad, { publish: publicar } as unknown as EventBus);
  });

  it('reemplaza el hash por el de la contraseña nueva, sin exigir otro cambio', async () => {
    await handler.execute(new AsignarContrasena(9, 'NuevaClave7', 1));

    expect(usuarios.update).toHaveBeenCalledWith(
      { id: 9 },
      { passwordHash: 'cifrada:NuevaClave7' },
    );
  });

  it('deja constancia de la acción sin la contraseña', async () => {
    await handler.execute(new AsignarContrasena(9, 'NuevaClave7', 1));

    expect(publicar).toHaveBeenCalledWith(new ContrasenaAsignada(1, 9));
    const [evento] = publicar.mock.calls[0] as [ContrasenaAsignada];
    expect(evento.accion).toBe('CONTRASENA_ASIGNADA');
    expect(JSON.stringify(evento)).not.toContain('NuevaClave7');
  });

  it.each(['abc123', 'abcdefgh', '1234567890'])('rechaza la contraseña débil %s', async (debil) => {
    await expect(handler.execute(new AsignarContrasena(9, debil, 1))).rejects.toMatchObject({
      codigo: 'CONTRASENA_DEBIL',
    });
    expect(usuarios.update).not.toHaveBeenCalled();
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un usuario inexistente', async () => {
    usuarios.findOneBy.mockResolvedValue(null);

    await expect(
      handler.execute(new AsignarContrasena(404, 'NuevaClave7', 1)),
    ).rejects.toMatchObject({ codigo: 'USUARIO_NO_EXISTE' });
  });
});
