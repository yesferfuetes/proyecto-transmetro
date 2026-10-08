import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { registrarEstacionEnBackend } from '../data/estaciones';
import { registrarEstacion } from './registrar-estacion';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/estaciones', () => ({ registrarEstacionEnBackend: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

function comoRol(rol: Rol): void {
  vi.mocked(leerToken).mockResolvedValue('tok');
  vi.mocked(solicitar).mockResolvedValue(sesionDe(rol));
}

function rutasInvalidadas(): unknown[] {
  return vi.mocked(revalidatePath).mock.calls.map(([ruta]) => ruta);
}

const VALIDO = {
  codigo: 'E90',
  nombre: 'Estación nueva',
  municipalidadId: '1',
  tieneParqueo: true,
  latitud: '14.6',
  longitud: '-90.5',
};

describe('registrarEstacion', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('registra la estación, invalida el listado y lleva al detalle', async () => {
    vi.mocked(registrarEstacionEnBackend).mockResolvedValue({ ok: true, datos: { id: 90 } });

    await expect(registrarEstacion(VALIDO)).rejects.toThrow('redirect:/estaciones/90');

    expect(registrarEstacionEnBackend).toHaveBeenCalledWith({
      codigo: 'E90',
      nombre: 'Estación nueva',
      municipalidadId: 1,
      tieneParqueo: true,
      latitud: 14.6,
      longitud: -90.5,
    });
    expect(rutasInvalidadas()).toEqual(['/estaciones', '/estaciones/90']);
  });

  it('una sola coordenada es entrada inválida y no llama al backend', async () => {
    const resultado = await registrarEstacion({ ...VALIDO, longitud: '' });

    expect(resultado).toMatchObject({
      ok: false,
      error: { codigo: 'ENTRADA_INVALIDA', detalles: [{ campo: 'longitud' }] },
    });
    expect(registrarEstacionEnBackend).not.toHaveBeenCalled();
  });

  it('niega el acceso al operador sin llamar al backend', async () => {
    comoRol('OPERADOR_ESTACION');

    const resultado = await registrarEstacion(VALIDO);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
    expect(registrarEstacionEnBackend).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el error del backend', async () => {
    const error = errorDelBackend('CODIGO_ESTACION_DUPLICADO', 409);
    vi.mocked(registrarEstacionEnBackend).mockResolvedValue(error);

    await expect(registrarEstacion(VALIDO)).resolves.toEqual(error);
  });
});
