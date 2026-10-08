import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';
import {
  listarMunicipalidades,
  listarTodasLasMunicipalidades,
  obtenerMunicipalidad,
  registrarMunicipalidadEnBackend,
} from './municipalidades';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn() }));

const fetchSimulado = vi.fn<typeof fetch>();

function responder(cuerpo: unknown, estado = 200): void {
  fetchSimulado.mockResolvedValue(
    new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), { status: estado }),
  );
}

function llamada(): { url: string; opciones: RequestInit | undefined } {
  const [url, opciones] = fetchSimulado.mock.calls[0] ?? [];
  return { url: url instanceof Request ? url.url : (url?.toString() ?? ''), opciones };
}

beforeEach(() => {
  vi.stubEnv('BACKEND_URL', 'http://backend.prueba:3001');
  vi.stubGlobal('fetch', fetchSimulado);
  vi.mocked(leerToken).mockResolvedValue('tok');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function municipalidad(id: number): Record<string, unknown> {
  return {
    id,
    nombre: `Municipio ${id}`,
    departamento: 'Guatemala',
    fechaIncorporacion: null,
    numeroDeLineas: 0,
    numeroDeEstaciones: 0,
    sinRed: true,
  };
}

describe('datos de municipalidades', () => {
  it('lista una página con su tamaño', async () => {
    const pagina = { elementos: [municipalidad(1)], total: 1, pagina: 2, tamano: 25 };
    responder(pagina);

    await expect(listarMunicipalidades(2)).resolves.toEqual({ ok: true, datos: pagina });
    expect(llamada().url).toBe('http://backend.prueba:3001/municipalidades?pagina=2&tamano=25');
  });

  it('para los selectores recorre todas las páginas', async () => {
    fetchSimulado
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ elementos: [municipalidad(1)], total: 2, pagina: 1, tamano: 1 }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ elementos: [municipalidad(2)], total: 2, pagina: 2, tamano: 1 }),
        ),
      );

    const resultado = await listarTodasLasMunicipalidades();

    expect(resultado.ok && resultado.datos.map((m) => m.id)).toEqual([1, 2]);
    expect(fetchSimulado).toHaveBeenCalledTimes(2);
  });

  it('una respuesta que no cumple el esquema es RESPUESTA_INVALIDA', async () => {
    responder({ id: 1, nombre: 3 });

    const resultado = await obtenerMunicipalidad(1);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'RESPUESTA_INVALIDA' } });
  });

  it('si el backend no responde a tiempo devuelve TIEMPO_AGOTADO', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tarde', 'TimeoutError'));

    const resultado = await listarMunicipalidades(1);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'TIEMPO_AGOTADO' } });
  });

  it('devuelve el error de negocio al registrar', async () => {
    responder({ codigo: 'MUNICIPALIDAD_DUPLICADA', mensaje: 'Ya existe.', detalles: [] }, 409);

    const resultado = await registrarMunicipalidadEnBackend({
      nombre: 'Guatemala',
      departamento: undefined,
    });

    expect(resultado).toMatchObject({
      ok: false,
      error: { codigo: 'MUNICIPALIDAD_DUPLICADA', estado: 409 },
    });
  });
});
