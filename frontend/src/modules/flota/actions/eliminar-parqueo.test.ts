import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { eliminarParqueoEnBackend } from '../data/parqueos';
import { eliminarParqueo } from './eliminar-parqueo';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/parqueos', () => ({ eliminarParqueoEnBackend: vi.fn() }));
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

describe('eliminarParqueo', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('elimina el parqueo e invalida la flota sin salir del listado', async () => {
    vi.mocked(eliminarParqueoEnBackend).mockResolvedValue({ ok: true, datos: undefined });
    await expect(eliminarParqueo('4')).resolves.toEqual({ ok: true });
    expect(eliminarParqueoEnBackend).toHaveBeenCalledWith(4);
    expect(rutasInvalidadas()).toEqual(['/flota', '/flota/lineas', '/flota/parqueos']);
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await eliminarParqueo('cuatro');
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(eliminarParqueoEnBackend).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each<Rol>(['OPERADOR_ESTACION', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await eliminarParqueo(4);
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(eliminarParqueoEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error PARQUEO_CON_BUSES del backend', async () => {
    const error = errorDelBackend('PARQUEO_CON_BUSES');
    vi.mocked(eliminarParqueoEnBackend).mockResolvedValue(error);
    await expect(eliminarParqueo(4)).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
