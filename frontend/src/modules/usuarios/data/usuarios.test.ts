import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';
import { esquemaFiltrosUsuarios } from '../schemas/usuario';
import { crearSesion } from './sesiones';
import {
  desactivarUsuarioEnBackend,
  listarUsuarios,
  obtenerUsuario,
  registrarUsuarioEnBackend,
} from './usuarios';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn() }));

const fetchSimulado = vi.fn<typeof fetch>();

function respuesta(cuerpo: unknown, estado = 200): Response {
  return new Response(JSON.stringify(cuerpo), { status: estado });
}

function llamada(): { url: unknown; opciones: RequestInit | undefined } {
  const [url, opciones] = fetchSimulado.mock.calls[0] ?? [];
  return { url, opciones };
}

const USUARIO = {
  id: 4,
  nombre: 'Luis Pérez',
  correo: 'luis@transmetro.test',
  rol: 'OPERADOR_ESTACION',
  estacion: { id: 3, codigo: 'E03', nombre: 'Trébol' },
  activo: true,
};

const FILTROS = esquemaFiltrosUsuarios.parse({
  pagina: '2',
  rol: 'OPERADOR_ESTACION',
  busqueda: 'luis',
});

describe('datos de usuarios', () => {
  beforeEach(() => {
    vi.stubEnv('BACKEND_URL', 'http://backend.prueba:3001');
    vi.stubGlobal('fetch', fetchSimulado);
    vi.mocked(leerToken).mockResolvedValue('tok');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('entrega la página de usuarios cuando la respuesta cumple el esquema', async () => {
    const pagina = { elementos: [USUARIO], total: 26, pagina: 2, tamano: 25 };
    fetchSimulado.mockResolvedValue(respuesta(pagina));

    await expect(listarUsuarios(FILTROS)).resolves.toEqual({ ok: true, datos: pagina });
  });

  it('pide la página con los filtros, 25 filas y el token de la sesión', async () => {
    fetchSimulado.mockResolvedValue(respuesta({ elementos: [], total: 0, pagina: 2, tamano: 25 }));

    await listarUsuarios(FILTROS);

    const { url, opciones } = llamada();
    expect(url).toEqual(
      new URL(
        'http://backend.prueba:3001/usuarios?rol=OPERADOR_ESTACION&busqueda=luis&pagina=2&tamano=25',
      ),
    );
    expect(opciones?.headers).toMatchObject({ Authorization: 'Bearer tok' });
    expect(opciones?.signal).toBeInstanceOf(AbortSignal);
  });

  it('rechaza una respuesta que no cumple el esquema', async () => {
    fetchSimulado.mockResolvedValue(respuesta({ elementos: [{ id: 'cuatro' }], total: 1 }));

    const resultado = await listarUsuarios(FILTROS);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'RESPUESTA_INVALIDA' } });
  });

  it('descarta el hash de la contraseña aunque el backend lo envíe', async () => {
    const conHash = { ...USUARIO, passwordHash: 'scrypt$32768$8$1$sal$hash' };
    fetchSimulado.mockResolvedValueOnce(
      respuesta({ elementos: [conHash], total: 1, pagina: 1, tamano: 25 }),
    );
    fetchSimulado.mockResolvedValueOnce(
      respuesta({
        id: 4,
        nombre: 'Luis Pérez',
        correo: 'luis@transmetro.test',
        rol: 'OPERADOR_ESTACION',
        estacionId: 3,
        activo: true,
        creadoEn: '2026-10-07T12:00:00Z',
        passwordHash: 'scrypt$32768$8$1$sal$hash',
      }),
    );

    const listado = await listarUsuarios(esquemaFiltrosUsuarios.parse({}));
    const detalle = await obtenerUsuario(4);

    expect(JSON.stringify(listado)).not.toContain('scrypt');
    expect(JSON.stringify(detalle)).not.toContain('scrypt');
    expect(detalle).toMatchObject({ ok: true, datos: { id: 4, estacionId: 3 } });
  });

  it('registra con POST y devuelve el identificador', async () => {
    fetchSimulado.mockResolvedValue(respuesta({ id: 9 }, 201));
    const datos = {
      nombre: 'Ana',
      correo: 'ana@transmetro.test',
      rol: 'SUPERVISOR_MUNICIPAL' as const,
      contrasena: 'clave1234',
    };

    await expect(registrarUsuarioEnBackend(datos)).resolves.toEqual({ ok: true, datos: { id: 9 } });
    const { url, opciones } = llamada();
    expect(url).toEqual(new URL('http://backend.prueba:3001/usuarios'));
    expect(opciones).toMatchObject({ method: 'POST', body: JSON.stringify(datos) });
  });

  it('acepta la respuesta vacía de una desactivación', async () => {
    fetchSimulado.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(desactivarUsuarioEnBackend(4)).resolves.toEqual({ ok: true, datos: undefined });
    const { url, opciones } = llamada();
    expect(url).toEqual(new URL('http://backend.prueba:3001/usuarios/4/desactivacion'));
    expect(opciones).toMatchObject({ method: 'POST' });
  });

  it('devuelve el error del backend con su código', async () => {
    fetchSimulado.mockResolvedValue(
      respuesta({ codigo: 'USUARIO_NO_EXISTE', mensaje: 'No existe.', detalles: [] }, 404),
    );

    await expect(obtenerUsuario(99)).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'USUARIO_NO_EXISTE', estado: 404 },
    });
  });
});

describe('crearSesion', () => {
  beforeEach(() => {
    vi.stubEnv('BACKEND_URL', 'http://backend.prueba:3001');
    vi.stubGlobal('fetch', fetchSimulado);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('abre la sesión sin enviar token', async () => {
    fetchSimulado.mockResolvedValue(
      respuesta({ token: 'nuevo', expiraEn: '2026-10-07T20:00:00Z' }),
    );

    const resultado = await crearSesion({ correo: 'ana@transmetro.test', contrasena: 'clave1234' });

    expect(resultado).toEqual({
      ok: true,
      datos: { token: 'nuevo', expiraEn: '2026-10-07T20:00:00Z' },
    });
    expect(leerToken).not.toHaveBeenCalled();
    expect(llamada().opciones?.headers).not.toHaveProperty('Authorization');
  });

  it('informa tiempo agotado si el backend no responde', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tiempo', 'TimeoutError'));

    const resultado = await crearSesion({ correo: 'ana@transmetro.test', contrasena: 'x' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'TIEMPO_AGOTADO' } });
  });
});
