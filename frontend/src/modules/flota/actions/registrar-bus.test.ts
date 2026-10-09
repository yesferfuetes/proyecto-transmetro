import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { registrarBusEnBackend } from '../data/buses';
import { registrarBus } from './registrar-bus';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/buses', () => ({ registrarBusEnBackend: vi.fn() }));
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
  placa: ' tm-0001 ',
  capacidadMax: '120',
  parqueoId: '4',
  lineaId: '',
};

describe('registrarBus', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('registra el bus, invalida la flota y lleva al detalle', async () => {
    vi.mocked(registrarBusEnBackend).mockResolvedValue({ ok: true, datos: { id: 9 } });
    await expect(registrarBus(VALIDO)).rejects.toThrow('redirect:/flota/9');
    expect(registrarBusEnBackend).toHaveBeenCalledWith({
      placa: 'tm-0001',
      capacidadMax: 120,
      parqueoId: 4,
      lineaId: null,
    });
    expect(rutasInvalidadas()).toEqual(['/flota', '/flota/9', '/flota/lineas', '/flota/parqueos']);
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await registrarBus({ ...VALIDO, placa: '', parqueoId: '' });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(registrarBusEnBackend).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each<Rol>(['OPERADOR_ESTACION', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await registrarBus(VALIDO);
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(registrarBusEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error PARQUEO_LLENO del backend', async () => {
    const error = errorDelBackend('PARQUEO_LLENO');
    vi.mocked(registrarBusEnBackend).mockResolvedValue(error);
    await expect(registrarBus(VALIDO)).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
