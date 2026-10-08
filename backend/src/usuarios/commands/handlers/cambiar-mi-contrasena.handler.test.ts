import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Usuario } from '../../entities/usuario.entity';
import { ContrasenaCambiada } from '../../events/eventos-de-usuarios';
import { CambiarMiContrasena } from '../impl/cambiar-mi-contrasena.command';
import { CambiarMiContrasenaHandler } from './cambiar-mi-contrasena.handler';

jest.mock('../../../shared/seguridad/cifrador-de-contrasenas', () => ({
  cifrarContrasena: jest.fn((texto: string) => Promise.resolve(`cifrada:${texto}`)),
  verificarContrasena: jest.fn((texto: string, guardado: string) =>
    Promise.resolve(guardado === `cifrada:${texto}`),
  ),
}));

describe('CambiarMiContrasenaHandler', () => {
  let usuarios: Record<'findOne' | 'update', jest.Mock>;
  let publicar: jest.Mock;
  let handler: CambiarMiContrasenaHandler;

  beforeEach(() => {
    const unidad = new UnidadDeTrabajoSimulada();
    usuarios = { findOne: jest.fn(), update: jest.fn() };
    unidad.registrar(Usuario, usuarios as unknown as RepositorioSimulado<Usuario>);
    usuarios.findOne.mockResolvedValue(
      Object.assign(new Usuario(), { id: 5, passwordHash: 'cifrada:Actual123' }),
    );
    publicar = jest.fn();
    handler = new CambiarMiContrasenaHandler(unidad, { publish: publicar } as unknown as EventBus);
  });

  it('con la contraseña actual correcta guarda la nueva y deja constancia', async () => {
    await handler.execute(new CambiarMiContrasena(5, 'Actual123', 'Nueva4567'));

    expect(usuarios.findOne).toHaveBeenCalledWith({
      select: { id: true, passwordHash: true },
      where: { id: 5 },
    });
    expect(usuarios.update).toHaveBeenCalledWith({ id: 5 }, { passwordHash: 'cifrada:Nueva4567' });
    expect(publicar).toHaveBeenCalledWith(new ContrasenaCambiada(5));
  });

  it('con la contraseña actual incorrecta rechaza con CREDENCIALES_INVALIDAS y no cambia nada', async () => {
    await expect(
      handler.execute(new CambiarMiContrasena(5, 'Equivocada1', 'Nueva4567')),
    ).rejects.toMatchObject({ codigo: 'CREDENCIALES_INVALIDAS' });
    expect(usuarios.update).not.toHaveBeenCalled();
    expect(publicar).not.toHaveBeenCalled();
  });

  it.each(['abcdefgh', 'abc123'])('rechaza la nueva contraseña débil %s', async (debil) => {
    await expect(
      handler.execute(new CambiarMiContrasena(5, 'Actual123', debil)),
    ).rejects.toMatchObject({ codigo: 'CONTRASENA_DEBIL' });
    expect(usuarios.update).not.toHaveBeenCalled();
  });

  it('el evento no contiene ninguna de las dos contraseñas', async () => {
    await handler.execute(new CambiarMiContrasena(5, 'Actual123', 'Nueva4567'));

    const serializado = JSON.stringify(publicar.mock.calls);
    expect(serializado).not.toContain('Actual123');
    expect(serializado).not.toContain('Nueva4567');
  });

  it('rechaza si el usuario de la sesión ya no existe', async () => {
    usuarios.findOne.mockResolvedValue(null);

    await expect(
      handler.execute(new CambiarMiContrasena(5, 'Actual123', 'Nueva4567')),
    ).rejects.toMatchObject({ codigo: 'USUARIO_NO_EXISTE' });
  });
});
