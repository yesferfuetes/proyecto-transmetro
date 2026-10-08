import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { editarEstacionEnBackend } from '../data/estaciones';
import { editarEstacion } from './editar-estacion';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/estaciones', () => ({ editarEstacionEnBackend: vi.fn() }));
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
  nombre: 'Trébol',
  municipalidadId: 1,
  tieneParqueo: false,
  latitud: '',
  longitud: '',
};

describe('editarEstacion', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('edita la estación sin enviar el código y vuelve al detalle', async () => {
    vi.mocked(editarEstacionEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(editarEstacion(3, { ...VALIDO, codigo: 'X1' })).rejects.toThrow(
      'redirect:/estaciones/3',
    );

    expect(editarEstacionEnBackend).toHaveBeenCalledWith(3, {
      nombre: 'Trébol',
      municipalidadId: 1,
      tieneParqueo: false,
      latitud: undefined,
      longitud: undefined,
    });
    expect(rutasInvalidadas()).toEqual(['/estaciones', '/estaciones/3']);
  });

  it('una sola coordenada es entrada inválida y no llama al backend', async () => {
    const resultado = await editarEstacion(3, { ...VALIDO, latitud: '14.6' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(editarEstacionEnBackend).not.toHaveBeenCalled();
  });

  it('niega el acceso al administrador sin llamar al backend', async () => {
    comoRol('ADMINISTRADOR');

    const resultado = await editarEstacion(3, VALIDO);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
    expect(editarEstacionEnBackend).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el error del backend', async () => {
    const error = errorDelBackend('COORDENADAS_INVALIDAS');
    vi.mocked(editarEstacionEnBackend).mockResolvedValue(error);

    await expect(editarEstacion(3, VALIDO)).resolves.toEqual(error);
  });
});
