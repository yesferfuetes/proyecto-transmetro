import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { editarBusEnBackend } from '../data/buses';
import { editarBus } from './editar-bus';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/buses', () => ({ editarBusEnBackend: vi.fn() }));
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

const VALIDO = { capacidadMax: '90' };

describe('editarBus', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('edita la capacidad, invalida la flota y vuelve al detalle', async () => {
    vi.mocked(editarBusEnBackend).mockResolvedValue({ ok: true, datos: undefined });
    await expect(editarBus('7', VALIDO)).rejects.toThrow('redirect:/flota/7');
    expect(editarBusEnBackend).toHaveBeenCalledWith(7, { capacidadMax: 90 });
    expect(rutasInvalidadas()).toEqual(['/flota', '/flota/7', '/flota/lineas', '/flota/parqueos']);
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await editarBus('7', { capacidadMax: 'mucha' });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(editarBusEnBackend).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each<Rol>(['OPERADOR_ESTACION', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await editarBus(7, VALIDO);
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(editarBusEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error CAPACIDAD_INVALIDA del backend', async () => {
    const error = errorDelBackend('CAPACIDAD_INVALIDA');
    vi.mocked(editarBusEnBackend).mockResolvedValue(error);
    await expect(editarBus(7, VALIDO)).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
