import type { Repository } from 'typeorm';
import type { EstacionResumen } from '../../../shared/contratos/red';
import { Usuario } from '../../entities/usuario.entity';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ObtenerMiCuenta } from '../impl/obtener-mi-cuenta.query';
import { ObtenerUsuarioDeSesion } from '../impl/obtener-usuario-de-sesion.query';
import { ObtenerUsuario } from '../impl/obtener-usuario.query';
import { ListarEstacionesAsignablesHandler } from './listar-estaciones-asignables.handler';
import { ObtenerMiCuentaHandler } from './obtener-mi-cuenta.handler';
import { ObtenerUsuarioDeSesionHandler } from './obtener-usuario-de-sesion.handler';
import { ObtenerUsuarioHandler } from './obtener-usuario.handler';

function estacion(id: number, codigo: string): EstacionResumen {
  return { id, codigo, nombre: `Estación ${codigo}`, municipalidadId: 1, tieneParqueo: false };
}

const CREADO_EN = new Date('2026-10-01T12:00:00.000Z');

const OPERADOR = Object.assign(new Usuario(), {
  id: 7,
  nombre: 'Luis',
  email: 'luis@muni.gt',
  rol: 'OPERADOR_ESTACION',
  estacionId: 3,
  activo: true,
  creadoEn: CREADO_EN,
  passwordHash: 'scrypt$secreto',
});

function repositorio(encontrado: Usuario | null): {
  repo: Repository<Usuario>;
  findOneBy: jest.Mock;
} {
  const findOneBy = jest.fn().mockResolvedValue(encontrado);
  return { repo: { findOneBy } as unknown as Repository<Usuario>, findOneBy };
}

describe('ObtenerUsuarioDeSesionHandler', () => {
  it('devuelve el usuario activo con su rol y estación actuales', async () => {
    const { repo, findOneBy } = repositorio(OPERADOR);

    await expect(
      new ObtenerUsuarioDeSesionHandler(repo).execute(new ObtenerUsuarioDeSesion(7)),
    ).resolves.toEqual({
      id: 7,
      nombre: 'Luis',
      correo: 'luis@muni.gt',
      rol: 'OPERADOR_ESTACION',
      estacionId: 3,
    });
    expect(findOneBy).toHaveBeenCalledWith({ id: 7, activo: true });
  });

  it('devuelve null si el usuario no existe o está desactivado', async () => {
    const { repo } = repositorio(null);

    await expect(
      new ObtenerUsuarioDeSesionHandler(repo).execute(new ObtenerUsuarioDeSesion(7)),
    ).resolves.toBeNull();
  });

  it('devuelve null si el rol guardado no es uno de los tres', async () => {
    const { repo } = repositorio(Object.assign(new Usuario(), { ...OPERADOR, rol: 'GUARDIA' }));

    await expect(
      new ObtenerUsuarioDeSesionHandler(repo).execute(new ObtenerUsuarioDeSesion(7)),
    ).resolves.toBeNull();
  });
});

describe('ObtenerMiCuentaHandler', () => {
  it('devuelve la cuenta con la estación y sin la contraseña', async () => {
    const { repo } = repositorio(OPERADOR);
    const red = { obtenerEstacion: jest.fn().mockResolvedValue(estacion(3, 'E03')) };

    const cuenta = await new ObtenerMiCuentaHandler(repo, red as unknown as RedAdapter).execute(
      new ObtenerMiCuenta(7),
    );

    expect(cuenta).toEqual({
      id: 7,
      nombre: 'Luis',
      correo: 'luis@muni.gt',
      rol: 'OPERADOR_ESTACION',
      estacion: { id: 3, codigo: 'E03', nombre: 'Estación E03' },
    });
    expect(JSON.stringify(cuenta)).not.toContain('scrypt');
  });

  it('sin estación no consulta la red', async () => {
    const { repo } = repositorio(Object.assign(new Usuario(), { ...OPERADOR, estacionId: null }));
    const red = { obtenerEstacion: jest.fn() };

    const cuenta = await new ObtenerMiCuentaHandler(repo, red as unknown as RedAdapter).execute(
      new ObtenerMiCuenta(7),
    );

    expect(cuenta.estacion).toBeNull();
    expect(red.obtenerEstacion).not.toHaveBeenCalled();
  });

  it('rechaza un usuario inexistente', async () => {
    const { repo } = repositorio(null);

    await expect(
      new ObtenerMiCuentaHandler(repo, {} as RedAdapter).execute(new ObtenerMiCuenta(7)),
    ).rejects.toMatchObject({ codigo: 'USUARIO_NO_EXISTE' });
  });
});

describe('ObtenerUsuarioHandler', () => {
  it('devuelve el detalle sin la contraseña', async () => {
    const { repo } = repositorio(OPERADOR);

    const detalle = await new ObtenerUsuarioHandler(repo).execute(new ObtenerUsuario(7));

    expect(detalle).toEqual({
      id: 7,
      nombre: 'Luis',
      correo: 'luis@muni.gt',
      rol: 'OPERADOR_ESTACION',
      estacionId: 3,
      activo: true,
      creadoEn: CREADO_EN,
    });
    expect(JSON.stringify(detalle)).not.toContain('scrypt');
  });

  it('rechaza un usuario inexistente', async () => {
    const { repo } = repositorio(null);

    await expect(
      new ObtenerUsuarioHandler(repo).execute(new ObtenerUsuario(7)),
    ).rejects.toMatchObject({ codigo: 'USUARIO_NO_EXISTE' });
  });
});

describe('ListarEstacionesAsignablesHandler', () => {
  it('devuelve las estaciones de la red ordenadas por código, solo con id, código y nombre', async () => {
    const red = {
      listarEstaciones: jest
        .fn()
        .mockResolvedValue([estacion(2, 'E12'), estacion(1, 'E01'), estacion(3, 'E05')]),
    };

    await expect(
      new ListarEstacionesAsignablesHandler(red as unknown as RedAdapter).execute(),
    ).resolves.toEqual([
      { id: 1, codigo: 'E01', nombre: 'Estación E01' },
      { id: 3, codigo: 'E05', nombre: 'Estación E05' },
      { id: 2, codigo: 'E12', nombre: 'Estación E12' },
    ]);
  });
});
