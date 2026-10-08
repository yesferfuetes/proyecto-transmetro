import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { verificarContrasena } from '../../../shared/seguridad/cifrador-de-contrasenas';
import { Usuario } from '../../entities/usuario.entity';
import { InicioDeSesionFallido } from '../../events/eventos-de-usuarios';
import { IniciarSesion } from '../impl/iniciar-sesion.command';
import { IniciarSesionHandler } from './iniciar-sesion.handler';

jest.mock('../../../shared/seguridad/cifrador-de-contrasenas', () => ({
  cifrarContrasena: jest.fn((texto: string) => Promise.resolve(`cifrada:${texto}`)),
  verificarContrasena: jest.fn((texto: string, guardado: string) =>
    Promise.resolve(guardado === `cifrada:${texto}`),
  ),
}));

function usuario(datos: Partial<Usuario>): Usuario {
  return Object.assign(new Usuario(), {
    id: 7,
    activo: true,
    passwordHash: 'cifrada:Secreta123',
    ...datos,
  });
}

describe('IniciarSesionHandler', () => {
  let unidad: UnidadDeTrabajoSimulada;
  let usuarios: Record<'findOne', jest.Mock>;
  let publicar: jest.Mock;
  let handler: IniciarSesionHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    unidad = new UnidadDeTrabajoSimulada();
    usuarios = { findOne: jest.fn() };
    unidad.registrar(Usuario, usuarios as unknown as RepositorioSimulado<Usuario>);
    publicar = jest.fn();
    handler = new IniciarSesionHandler(unidad, { publish: publicar } as unknown as EventBus);
  });

  it('devuelve el id del usuario activo con credenciales válidas y no publica nada', async () => {
    usuarios.findOne.mockResolvedValue(usuario({}));

    await expect(handler.execute(new IniciarSesion('ana@muni.gt', 'Secreta123'))).resolves.toBe(7);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('pide el hash de forma explícita y busca el correo normalizado', async () => {
    usuarios.findOne.mockResolvedValue(usuario({}));

    await handler.execute(new IniciarSesion('  ANA@Muni.GT ', 'Secreta123'));

    expect(usuarios.findOne).toHaveBeenCalledWith({
      select: { id: true, activo: true, passwordHash: true },
      where: { email: 'ana@muni.gt' },
    });
  });

  it('rechaza un correo inexistente con CREDENCIALES_INVALIDAS y deja constancia', async () => {
    usuarios.findOne.mockResolvedValue(null);

    await expect(
      handler.execute(new IniciarSesion('nadie@muni.gt', 'Secreta123')),
    ).rejects.toMatchObject({ codigo: 'CREDENCIALES_INVALIDAS' });
    expect(publicar).toHaveBeenCalledWith(new InicioDeSesionFallido('nadie@muni.gt'));
  });

  it('con un correo inexistente verifica igual la contraseña contra un hash ficticio', async () => {
    usuarios.findOne.mockResolvedValue(null);

    await expect(
      handler.execute(new IniciarSesion('nadie@muni.gt', 'Secreta123')),
    ).rejects.toThrow();
    expect(verificarContrasena).toHaveBeenCalledTimes(1);
    expect(verificarContrasena).toHaveBeenCalledWith('Secreta123', expect.any(String));
  });

  it('rechaza una contraseña incorrecta con el mismo código y mensaje que un correo inexistente', async () => {
    usuarios.findOne.mockResolvedValueOnce(usuario({})).mockResolvedValueOnce(null);

    const incorrecta = await handler
      .execute(new IniciarSesion('ana@muni.gt', 'Otra1234'))
      .catch((error: unknown) => error);
    const inexistente = await handler
      .execute(new IniciarSesion('nadie@muni.gt', 'Otra1234'))
      .catch((error: unknown) => error);

    expect(incorrecta).toMatchObject({ codigo: 'CREDENCIALES_INVALIDAS' });
    expect((incorrecta as Error).message).toBe((inexistente as Error).message);
    expect(publicar).toHaveBeenCalledWith(new InicioDeSesionFallido('ana@muni.gt'));
  });

  it('a un usuario desactivado con la contraseña correcta le dice que está inactivo', async () => {
    usuarios.findOne.mockResolvedValue(usuario({ activo: false }));

    await expect(
      handler.execute(new IniciarSesion('ana@muni.gt', 'Secreta123')),
    ).rejects.toMatchObject({ codigo: 'USUARIO_INACTIVO' });
    expect(publicar).toHaveBeenCalledWith(new InicioDeSesionFallido('ana@muni.gt'));
  });

  it('a un usuario desactivado con la contraseña incorrecta le responde como a cualquiera', async () => {
    usuarios.findOne.mockResolvedValue(usuario({ activo: false }));

    await expect(
      handler.execute(new IniciarSesion('ana@muni.gt', 'Otra1234')),
    ).rejects.toMatchObject({ codigo: 'CREDENCIALES_INVALIDAS' });
  });

  it('la constancia del intento fallido guarda el correo y nunca la contraseña', async () => {
    usuarios.findOne.mockResolvedValue(null);

    await expect(
      handler.execute(new IniciarSesion('nadie@muni.gt', 'Secreta123')),
    ).rejects.toThrow();

    const [evento] = publicar.mock.calls[0] as [InicioDeSesionFallido];
    expect(evento).toMatchObject({
      usuarioId: null,
      correoIntentado: 'nadie@muni.gt',
      accion: 'INICIO_SESION_FALLIDO',
    });
    expect(JSON.stringify(evento)).not.toContain('Secreta123');
  });
});
