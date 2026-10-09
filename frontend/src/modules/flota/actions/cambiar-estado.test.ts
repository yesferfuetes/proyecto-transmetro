import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { cambiarEstadoEnBackend } from '../data/buses';
import { cambiarEstado } from './cambiar-estado';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/buses', () => ({ cambiarEstadoEnBackend: vi.fn() }));
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

const VALIDO = { estado: 'MANTENIMIENTO' };

describe('cambiarEstado', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('cambia el estado e invalida la flota sin salir del detalle', async () => {
    vi.mocked(cambiarEstadoEnBackend).mockResolvedValue({ ok: true, datos: undefined });
    await expect(cambiarEstado(7, VALIDO)).resolves.toEqual({ ok: true });
    expect(cambiarEstadoEnBackend).toHaveBeenCalledWith(7, { estado: 'MANTENIMIENTO' });
    expect(rutasInvalidadas()).toEqual(['/flota', '/flota/7', '/flota/lineas', '/flota/parqueos']);
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await cambiarEstado(7, { estado: 'ELIMINADO' });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(cambiarEstadoEnBackend).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each<Rol>(['OPERADOR_ESTACION', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await cambiarEstado(7, VALIDO);
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(cambiarEstadoEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error FLOTA_MINIMA_INSUFICIENTE del backend', async () => {
    const error = errorDelBackend('FLOTA_MINIMA_INSUFICIENTE');
    vi.mocked(cambiarEstadoEnBackend).mockResolvedValue(error);
    await expect(cambiarEstado(7, VALIDO)).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
