import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { editarParqueoEnBackend } from '../data/parqueos';
import { editarParqueo } from './editar-parqueo';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/parqueos', () => ({ editarParqueoEnBackend: vi.fn() }));
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

const VALIDO = { capacidadVehiculos: '40' };

describe('editarParqueo', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('edita la capacidad, invalida la flota y vuelve al listado', async () => {
    vi.mocked(editarParqueoEnBackend).mockResolvedValue({ ok: true, datos: undefined });
    await expect(editarParqueo(4, VALIDO)).rejects.toThrow('redirect:/flota/parqueos');
    expect(editarParqueoEnBackend).toHaveBeenCalledWith(4, { capacidadVehiculos: 40 });
    expect(rutasInvalidadas()).toEqual(['/flota', '/flota/lineas', '/flota/parqueos']);
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await editarParqueo(4, { capacidadVehiculos: '' });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(editarParqueoEnBackend).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each<Rol>(['OPERADOR_ESTACION', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await editarParqueo(4, VALIDO);
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(editarParqueoEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error CAPACIDAD_PARQUEO_INSUFICIENTE del backend', async () => {
    const error = errorDelBackend('CAPACIDAD_PARQUEO_INSUFICIENTE');
    vi.mocked(editarParqueoEnBackend).mockResolvedValue(error);
    await expect(editarParqueo(4, VALIDO)).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
