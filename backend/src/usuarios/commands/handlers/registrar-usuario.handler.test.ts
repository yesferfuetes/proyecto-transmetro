import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import type { EstacionResumen } from '../../../shared/contratos/red';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioRegistrado } from '../../events/eventos-de-usuarios';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { RegistrarUsuario } from '../impl/registrar-usuario.command';
import { RegistrarUsuarioHandler } from './registrar-usuario.handler';

jest.mock('../../../shared/seguridad/cifrador-de-contrasenas', () => ({
  cifrarContrasena: jest.fn((texto: string) => Promise.resolve(`cifrada:${texto}`)),
}));

const ESTACION: EstacionResumen = {
  id: 3,
  codigo: 'E03',
  nombre: 'Plaza Barrios',
  municipalidadId: 1,
  tieneParqueo: false,
};

const ADMIN_ID = 1;

function comando(datos: Partial<RegistrarUsuario> = {}): RegistrarUsuario {
  const base = {
    nombre: 'Ana López',
    correo: 'ana@muni.gt',
    rol: 'OPERADOR_ESTACION',
    contrasena: 'Secreta123',
    estacionId: 3 as number | null,
    ...datos,
  };
  return new RegistrarUsuario(
    base.nombre,
    base.correo,
    base.rol,
    base.contrasena,
    base.estacionId,
    ADMIN_ID,
  );
}

describe('RegistrarUsuarioHandler', () => {
  let usuarios: Record<'findOneBy' | 'save', jest.Mock>;
  let publicar: jest.Mock;
  let obtenerEstacion: jest.Mock;
  let handler: RegistrarUsuarioHandler;

  beforeEach(() => {
    const unidad = new UnidadDeTrabajoSimulada();
    usuarios = { findOneBy: jest.fn(), save: jest.fn() };
    unidad.registrar(Usuario, usuarios as unknown as RepositorioSimulado<Usuario>);
    usuarios.findOneBy.mockResolvedValue(null);
    usuarios.save.mockImplementation((entidad) =>
      Promise.resolve(Object.assign(entidad as Usuario, { id: 20 })),
    );
    publicar = jest.fn();
    obtenerEstacion = jest.fn((id: number) =>
      Promise.resolve(id === ESTACION.id ? ESTACION : null),
    );
    handler = new RegistrarUsuarioHandler(
      unidad,
      { publish: publicar } as unknown as EventBus,
      { obtenerEstacion } as unknown as RedAdapter,
    );
  });

  async function rechazo(datos: Partial<RegistrarUsuario>): Promise<unknown> {
    return handler.execute(comando(datos)).catch((error: unknown) => error);
  }

  it('registra un operador con una estación existente, activo, y devuelve su id', async () => {
    await expect(handler.execute(comando())).resolves.toBe(20);

    expect(usuarios.save).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Ana López',
        email: 'ana@muni.gt',
        rol: 'OPERADOR_ESTACION',
        estacionId: 3,
        activo: true,
      }),
    );
    expect(publicar).toHaveBeenCalledWith(
      new UsuarioRegistrado(ADMIN_ID, 20, 'OPERADOR_ESTACION', 3),
    );
  });

  it('acepta un segundo operador en la misma estación', async () => {
    usuarios.findOneBy.mockResolvedValue(null);
    await handler.execute(comando({ correo: 'uno@muni.gt' }));
    await handler.execute(comando({ correo: 'dos@muni.gt' }));

    expect(usuarios.save).toHaveBeenCalledTimes(2);
  });

  it('guarda el correo normalizado', async () => {
    await handler.execute(comando({ correo: '  Ana@MUNI.gt ' }));

    expect(usuarios.findOneBy).toHaveBeenCalledWith({ email: 'ana@muni.gt' });
    expect(usuarios.save).toHaveBeenCalledWith(expect.objectContaining({ email: 'ana@muni.gt' }));
  });

  it('guarda la contraseña cifrada y el evento no la contiene', async () => {
    await handler.execute(comando());

    const [guardado] = usuarios.save.mock.calls[0] as [Usuario];
    expect(guardado.passwordHash).toBe('cifrada:Secreta123');
    expect(JSON.stringify(publicar.mock.calls)).not.toContain('Secreta123');
  });

  it('registra un supervisor sin estación', async () => {
    await handler.execute(comando({ rol: 'SUPERVISOR_MUNICIPAL', estacionId: null }));

    expect(usuarios.save).toHaveBeenCalledWith(
      expect.objectContaining({ rol: 'SUPERVISOR_MUNICIPAL', estacionId: null }),
    );
  });

  it.each<[string, Partial<RegistrarUsuario>, string]>([
    ['un operador sin estación', { estacionId: null }, 'OPERADOR_SIN_ESTACION'],
    ['un operador con una estación inexistente', { estacionId: 99 }, 'ESTACION_NO_EXISTE'],
    [
      'un supervisor con estación',
      { rol: 'SUPERVISOR_MUNICIPAL', estacionId: 3 },
      'ESTACION_NO_APLICA',
    ],
    [
      'un administrador con estación',
      { rol: 'ADMINISTRADOR', estacionId: 3 },
      'ESTACION_NO_APLICA',
    ],
    ['un rol fuera de los tres', { rol: 'GUARDIA' }, 'ROL_INVALIDO'],
    ['un rol en minúsculas', { rol: 'administrador', estacionId: null }, 'ROL_INVALIDO'],
    ['la contraseña abc123', { contrasena: 'abc123' }, 'CONTRASENA_DEBIL'],
    ['la contraseña abcdefgh, sin número', { contrasena: 'abcdefgh' }, 'CONTRASENA_DEBIL'],
    ['la contraseña 12345678, sin letra', { contrasena: '12345678' }, 'CONTRASENA_DEBIL'],
  ])('rechaza %s sin crear nada ni dejar constancia', async (_caso, datos, codigo) => {
    await expect(rechazo(datos)).resolves.toMatchObject({ codigo });
    expect(usuarios.save).not.toHaveBeenCalled();
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un correo ya registrado escrito en mayúsculas', async () => {
    usuarios.findOneBy.mockResolvedValue(
      Object.assign(new Usuario(), { id: 5, email: 'ana@muni.gt', activo: true }),
    );

    await expect(rechazo({ correo: 'ANA@muni.gt' })).resolves.toMatchObject({
      codigo: 'EMAIL_DUPLICADO',
    });
    expect(usuarios.findOneBy).toHaveBeenCalledWith({ email: 'ana@muni.gt' });
    expect(usuarios.save).not.toHaveBeenCalled();
  });

  it('rechaza el correo de un usuario desactivado', async () => {
    usuarios.findOneBy.mockResolvedValue(
      Object.assign(new Usuario(), { id: 5, email: 'ana@muni.gt', activo: false }),
    );

    await expect(rechazo({})).resolves.toMatchObject({ codigo: 'EMAIL_DUPLICADO' });
    expect(publicar).not.toHaveBeenCalled();
  });
});
