import type { INestApplication } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Rol } from '../../shared/auth/rol';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { FiltroDeExcepciones } from '../../shared/errors/filtro-de-excepciones';
import { crearTuboDeValidacion } from '../../shared/errors/tubo-de-validacion';
import { EditarUsuario } from '../commands/impl/editar-usuario.command';
import { IniciarSesion } from '../commands/impl/iniciar-sesion.command';
import { RegistrarUsuario } from '../commands/impl/registrar-usuario.command';
import { ListarUsuarios } from '../queries/impl/listar-usuarios.query';
import { ObtenerMiCuenta } from '../queries/impl/obtener-mi-cuenta.query';
import { ObtenerUsuarioDeSesion } from '../queries/impl/obtener-usuario-de-sesion.query';
import { EmisorDeTokens } from '../services/emisor-de-tokens.service';
import { VerificadorDeSesionGuard } from '../strategies/verificador-de-sesion.guard';
import { MiCuentaController } from './mi-cuenta.controller';
import { SesionesController } from './sesiones.controller';
import { UsuariosController } from './usuarios.controller';

/** El token de prueba es el id del usuario; cada id tiene un rol fijo. */
const ROL_POR_ID: Record<number, Rol> = {
  1: 'ADMINISTRADOR',
  2: 'SUPERVISOR_MUNICIPAL',
  3: 'OPERADOR_ESTACION',
};
const ADMIN = '1';
const SUPERVISOR = '2';
const OPERADOR = '3';

function usuarioDeSesion(id: number): UsuarioSesion | null {
  const rol = ROL_POR_ID[id];
  return rol
    ? { id, nombre: `Usuario ${id}`, correo: `u${id}@muni.gt`, rol, estacionId: null }
    : null;
}

describe('controladores de usuarios', () => {
  let app: INestApplication;
  let base: string;
  const comandos = jest.fn();
  const consultas = jest.fn();

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      controllers: [SesionesController, MiCuentaController, UsuariosController],
      providers: [
        { provide: CommandBus, useValue: { execute: comandos } },
        { provide: QueryBus, useValue: { execute: consultas } },
        {
          provide: EmisorDeTokens,
          useValue: {
            emitir: (): object => ({
              token: 'token-nuevo',
              expiraEn: new Date('2026-10-07T16:00:00.000Z'),
            }),
            verificar: (token: string): object | string =>
              Number(token) > 0 ? { usuarioId: Number(token) } : 'invalido',
          },
        },
        { provide: APP_GUARD, useClass: VerificadorDeSesionGuard },
        { provide: APP_PIPE, useFactory: crearTuboDeValidacion },
        { provide: APP_FILTER, useClass: FiltroDeExcepciones },
      ],
    }).compile();
    app = modulo.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    const servidor = app.getHttpServer() as Server;
    const { port } = servidor.address() as AddressInfo;
    base = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    comandos.mockReset().mockResolvedValue(undefined);
    consultas
      .mockReset()
      .mockImplementation((consulta: unknown) =>
        Promise.resolve(
          consulta instanceof ObtenerUsuarioDeSesion ? usuarioDeSesion(consulta.id) : { ok: true },
        ),
      );
  });

  async function solicitar(
    metodo: string,
    ruta: string,
    token?: string,
    cuerpo?: object,
  ): Promise<{ estado: number; datos: Record<string, unknown> | null }> {
    const respuesta = await fetch(`${base}${ruta}`, {
      method: metodo,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    const texto = await respuesta.text();
    return {
      estado: respuesta.status,
      datos: texto ? (JSON.parse(texto) as Record<string, unknown>) : null,
    };
  }

  function comandosEjecutados(): unknown[] {
    return comandos.mock.calls.map(([comando]: unknown[]) => comando);
  }

  it('abre sesión sin token y devuelve el token con su vencimiento en ISO 8601', async () => {
    comandos.mockResolvedValue(1);

    const { estado, datos } = await solicitar('POST', '/sesiones', undefined, {
      correo: 'ana@muni.gt',
      contrasena: 'Secreta123',
    });

    expect(estado).toBe(200);
    expect(datos).toEqual({ token: 'token-nuevo', expiraEn: '2026-10-07T16:00:00.000Z' });
    expect(comandosEjecutados()).toEqual([new IniciarSesion('ana@muni.gt', 'Secreta123')]);
  });

  it('con un campo vacío al abrir sesión responde ENTRADA_INVALIDA sin consultar', async () => {
    const { estado, datos } = await solicitar('POST', '/sesiones', undefined, {
      correo: 'ana@muni.gt',
      contrasena: '',
    });

    expect(estado).toBe(400);
    expect(datos).toMatchObject({ codigo: 'ENTRADA_INVALIDA' });
    expect(comandos).not.toHaveBeenCalled();
  });

  it('sin sesión la administración de usuarios responde NO_AUTENTICADO', async () => {
    const { estado, datos } = await solicitar('GET', '/usuarios');

    expect(estado).toBe(401);
    expect(datos).toMatchObject({ codigo: 'NO_AUTENTICADO' });
  });

  it('un operador no puede abrir el listado de usuarios', async () => {
    const { estado, datos } = await solicitar('GET', '/usuarios', OPERADOR);

    expect(estado).toBe(403);
    expect(datos).toMatchObject({ codigo: 'ACCESO_DENEGADO' });
    expect(consultas).not.toHaveBeenCalledWith(expect.any(ListarUsuarios));
  });

  it('un supervisor no puede registrar usuarios y no se crea nada', async () => {
    const { estado, datos } = await solicitar('POST', '/usuarios', SUPERVISOR, {
      nombre: 'Nuevo',
      correo: 'nuevo@muni.gt',
      rol: 'OPERADOR_ESTACION',
      contrasena: 'Secreta123',
      estacionId: 3,
    });

    expect(estado).toBe(403);
    expect(datos).toMatchObject({ codigo: 'ACCESO_DENEGADO' });
    expect(comandos).not.toHaveBeenCalled();
  });

  it('cualquier rol consulta su propia cuenta en /usuarios/yo', async () => {
    const { estado } = await solicitar('GET', '/usuarios/yo', OPERADOR);

    expect(estado).toBe(200);
    expect(consultas).toHaveBeenCalledWith(new ObtenerMiCuenta(3));
  });

  it('lista con 25 por página por defecto y convierte los filtros', async () => {
    await solicitar('GET', '/usuarios?activo=false&estacionId=4&rol=OPERADOR_ESTACION', ADMIN);

    const [consulta] = consultas.mock.calls
      .map(([enviada]: unknown[]) => enviada)
      .filter((enviada): enviada is ListarUsuarios => enviada instanceof ListarUsuarios);
    expect(consulta).toMatchObject({
      filtros: { activo: false, estacionId: 4, rol: 'OPERADOR_ESTACION' },
      pagina: 1,
      tamano: 25,
    });
  });

  it.each(['tamano=101', 'pagina=0', 'rol=GUARDIA', 'activo=quizas'])(
    'rechaza el filtro %s con ENTRADA_INVALIDA',
    async (filtro) => {
      const { estado, datos } = await solicitar('GET', `/usuarios?${filtro}`, ADMIN);

      expect(estado).toBe(400);
      expect(datos).toMatchObject({ codigo: 'ENTRADA_INVALIDA' });
    },
  );

  it('registra con el actor de la sesión y deja al command validar el rol', async () => {
    comandos.mockResolvedValue(20);

    const { estado, datos } = await solicitar('POST', '/usuarios', ADMIN, {
      nombre: 'Nuevo',
      correo: 'nuevo@muni.gt',
      rol: 'GUARDIA',
      contrasena: 'abc',
    });

    expect(estado).toBe(201);
    expect(datos).toEqual({ id: 20 });
    expect(comandosEjecutados()).toEqual([
      new RegistrarUsuario('Nuevo', 'nuevo@muni.gt', 'GUARDIA', 'abc', null, 1),
    ]);
  });

  it('no acepta el actor en el cuerpo', async () => {
    const { estado } = await solicitar('POST', '/usuarios', ADMIN, {
      nombre: 'Nuevo',
      correo: 'nuevo@muni.gt',
      rol: 'SUPERVISOR_MUNICIPAL',
      contrasena: 'Secreta123',
      actorId: 99,
    });

    expect(estado).toBe(400);
    expect(comandos).not.toHaveBeenCalled();
  });

  it('al editar, estacionId null retira la estación', async () => {
    const { estado } = await solicitar('PATCH', '/usuarios/5', ADMIN, { estacionId: null });

    expect(estado).toBe(204);
    const [comando] = comandosEjecutados() as EditarUsuario[];
    expect(comando).toBeInstanceOf(EditarUsuario);
    expect(comando).toMatchObject({ id: 5, actorId: 1, cambios: { estacionId: null } });
  });

  it('al editar, rechaza un nombre nulo', async () => {
    const { estado } = await solicitar('PATCH', '/usuarios/5', ADMIN, { nombre: null });

    expect(estado).toBe(400);
    expect(comandos).not.toHaveBeenCalled();
  });

  it('rechaza un id que no es entero', async () => {
    const { estado } = await solicitar('GET', '/usuarios/abc', ADMIN);

    expect(estado).toBe(400);
  });

  it.each([
    ['POST', '/usuarios/5/desactivacion'],
    ['POST', '/usuarios/5/reactivacion'],
  ])('%s %s responde 204', async (metodo, ruta) => {
    const { estado } = await solicitar(metodo, ruta, ADMIN);

    expect(estado).toBe(204);
    expect(comandos).toHaveBeenCalledTimes(1);
  });

  it('no existe una ruta para eliminar usuarios: solo se desactivan', async () => {
    const { estado } = await solicitar('DELETE', '/usuarios/5', ADMIN);

    expect(estado).toBe(404);
    expect(comandos).not.toHaveBeenCalled();
  });

  it('cualquier rol cambia su propia contraseña', async () => {
    const { estado } = await solicitar('PUT', '/usuarios/yo/contrasena', OPERADOR, {
      contrasenaActual: 'Actual123',
      contrasenaNueva: 'Nueva4567',
    });

    expect(estado).toBe(204);
    expect(comandosEjecutados()).toEqual([
      expect.objectContaining({ actorId: 3, contrasenaActual: 'Actual123' }),
    ]);
  });

  it('un operador no puede asignar contraseñas a otros', async () => {
    const { estado } = await solicitar('PUT', '/usuarios/5/contrasena', OPERADOR, {
      contrasena: 'Nueva4567',
    });

    expect(estado).toBe(403);
    expect(comandos).not.toHaveBeenCalled();
  });
});
