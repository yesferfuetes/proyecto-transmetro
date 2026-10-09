import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { cambiarParqueoEnBackend } from '../data/buses';
import { cambiarParqueo } from './cambiar-parqueo';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/buses', () => ({ cambiarParqueoEnBackend: vi.fn() }));
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

const VALIDO = { parqueoId: '2' };

describe('cambiarParqueo', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('cambia el parqueo e invalida la flota sin salir del detalle', async () => {
    vi.mocked(cambiarParqueoEnBackend).mockResolvedValue({ ok: true, datos: undefined });
    await expect(cambiarParqueo(7, VALIDO)).resolves.toEqual({ ok: true });
    expect(cambiarParqueoEnBackend).toHaveBeenCalledWith(7, { parqueoId: 2 });
    expect(rutasInvalidadas()).toEqual(['/flota', '/flota/7', '/flota/lineas', '/flota/parqueos']);
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await cambiarParqueo(7, { parqueoId: '' });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(cambiarParqueoEnBackend).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each<Rol>(['OPERADOR_ESTACION', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await cambiarParqueo(7, VALIDO);
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(cambiarParqueoEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error PARQUEO_LLENO del backend', async () => {
    const error = errorDelBackend('PARQUEO_LLENO');
    vi.mocked(cambiarParqueoEnBackend).mockResolvedValue(error);
    await expect(cambiarParqueo(7, VALIDO)).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
