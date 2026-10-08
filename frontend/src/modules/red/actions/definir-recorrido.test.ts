import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { borrarToken, leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { definirRecorridoEnBackend } from '../data/lineas';
import { definirRecorrido } from './definir-recorrido';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/lineas', () => ({ definirRecorridoEnBackend: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

const VALIDO = {
  paradas: [
    { estacionId: 1, distanciaSiguienteKm: 1.2 },
    { estacionId: 2, distanciaSiguienteKm: 0.8 },
    { estacionId: 3, distanciaSiguienteKm: null },
  ],
};

function comoRol(rol: Rol): void {
  vi.mocked(leerToken).mockResolvedValue('tok');
  vi.mocked(solicitar).mockResolvedValue(sesionDe(rol));
}

describe('definirRecorrido', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('guarda el recorrido, invalida líneas, la línea y estaciones, y vuelve al detalle', async () => {
    vi.mocked(definirRecorridoEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(definirRecorrido(7, VALIDO)).rejects.toThrow('redirect:/lineas/7');

    expect(definirRecorridoEnBackend).toHaveBeenCalledWith(7, VALIDO);
    expect(vi.mocked(revalidatePath).mock.calls.map(([ruta]) => ruta)).toEqual([
      '/lineas',
      '/lineas/7',
      '/estaciones',
    ]);
  });

  it('rechaza una estación repetida sin llamar al backend', async () => {
    const repetida = {
      paradas: [
        { estacionId: 1, distanciaSiguienteKm: 1 },
        { estacionId: 1, distanciaSiguienteKm: null },
      ],
    };

    const resultado = await definirRecorrido(7, repetida);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(definirRecorridoEnBackend).not.toHaveBeenCalled();
  });

  it('rechaza una distancia faltante antes de la última parada sin llamar al backend', async () => {
    const sinDistancia = {
      paradas: [
        { estacionId: 1, distanciaSiguienteKm: 1 },
        { estacionId: 2, distanciaSiguienteKm: null },
        { estacionId: 3, distanciaSiguienteKm: null },
      ],
    };

    const resultado = await definirRecorrido(7, sinDistancia);

    expect(resultado).toMatchObject({
      ok: false,
      error: {
        codigo: 'ENTRADA_INVALIDA',
        detalles: [{ campo: 'datos.paradas.1.distanciaSiguienteKm' }],
      },
    });
    expect(definirRecorridoEnBackend).not.toHaveBeenCalled();
  });

  it('rechaza un id de línea que no es entero', async () => {
    const resultado = await definirRecorrido('abc', VALIDO);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(definirRecorridoEnBackend).not.toHaveBeenCalled();
  });

  it.each<Rol>(['OPERADOR_ESTACION', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);

      const resultado = await definirRecorrido(7, VALIDO);

      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(definirRecorridoEnBackend).not.toHaveBeenCalled();
    },
  );

  it('sin sesión responde que no está autenticado', async () => {
    vi.mocked(leerToken).mockResolvedValue(undefined);

    const resultado = await definirRecorrido(7, VALIDO);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'NO_AUTENTICADO' } });
  });

  it('devuelve tal cual el error de negocio del backend y no invalida nada', async () => {
    const error = errorDelBackend('ESTACION_SIN_LINEA');
    vi.mocked(definirRecorridoEnBackend).mockResolvedValue(error);

    const resultado = await definirRecorrido(7, VALIDO);

    expect(resultado).toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('con la sesión vencida borra la cookie y lleva a iniciar sesión', async () => {
    vi.mocked(definirRecorridoEnBackend).mockResolvedValue(errorDelBackend('SESION_EXPIRADA', 401));

    await expect(definirRecorrido(7, VALIDO)).rejects.toThrow('redirect:/login?motivo=expirada');
    expect(borrarToken).toHaveBeenCalled();
  });
});
