import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { registrarParqueoEnBackend } from '../data/parqueos';
import { registrarParqueo } from './registrar-parqueo';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/parqueos', () => ({ registrarParqueoEnBackend: vi.fn() }));
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

const VALIDO = { estacionId: '5', codigo: ' p1 ', capacidadVehiculos: '30' };

describe('registrarParqueo', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('registra el parqueo, invalida la flota y lleva al listado', async () => {
    vi.mocked(registrarParqueoEnBackend).mockResolvedValue({ ok: true, datos: { id: 4 } });
    await expect(registrarParqueo(VALIDO)).rejects.toThrow('redirect:/flota/parqueos');
    expect(registrarParqueoEnBackend).toHaveBeenCalledWith({
      estacionId: 5,
      codigo: 'p1',
      capacidadVehiculos: 30,
    });
    expect(rutasInvalidadas()).toEqual(['/flota', '/flota/lineas', '/flota/parqueos']);
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await registrarParqueo({
      ...VALIDO,
      estacionId: '',
      capacidadVehiculos: 'x',
    });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(registrarParqueoEnBackend).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each<Rol>(['OPERADOR_ESTACION', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await registrarParqueo(VALIDO);
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(registrarParqueoEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error ESTACION_SIN_PARQUEO del backend', async () => {
    const error = errorDelBackend('ESTACION_SIN_PARQUEO');
    vi.mocked(registrarParqueoEnBackend).mockResolvedValue(error);
    await expect(registrarParqueo(VALIDO)).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
