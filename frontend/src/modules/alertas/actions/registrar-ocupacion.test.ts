import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { registrarOcupacionEnBackend } from '../data/alertas';
import { registrarOcupacion } from './registrar-ocupacion';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/alertas', () => ({ registrarOcupacionEnBackend: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

function comoRol(rol: Rol): void {
  vi.mocked(leerToken).mockResolvedValue('tok');
  vi.mocked(solicitar).mockResolvedValue(sesionDe(rol));
}

const VALIDO = { busId: '7', pasajeros: '150' };

describe('registrarOcupacion', () => {
  beforeEach(() => {
    comoRol('OPERADOR_ESTACION');
  });

  it('con alerta nueva usa la estación de la sesión, invalida y lleva a la lista resaltada', async () => {
    vi.mocked(registrarOcupacionEnBackend).mockResolvedValue({ ok: true, datos: { alertaId: 12 } });
    await expect(registrarOcupacion(VALIDO)).rejects.toThrow('redirect:/alertas?resaltada=12');
    expect(registrarOcupacionEnBackend).toHaveBeenCalledWith({
      busId: 7,
      pasajeros: 150,
      estacionId: 3,
    });
    expect(vi.mocked(revalidatePath).mock.calls).toEqual([['/alertas']]);
  });

  it('con 0 pasajeros envía la cifra y no la toma por vacía', async () => {
    vi.mocked(registrarOcupacionEnBackend).mockResolvedValue({
      ok: true,
      datos: { alertaId: null },
    });
    await expect(registrarOcupacion({ busId: 7, pasajeros: 0 })).resolves.toEqual({
      ok: true,
      alertaId: null,
    });
    expect(registrarOcupacionEnBackend).toHaveBeenCalledWith({
      busId: 7,
      pasajeros: 0,
      estacionId: 3,
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each([
    ['vacío', { busId: '7', pasajeros: '' }],
    ['negativo', { busId: '7', pasajeros: '-1' }],
    ['decimal', { busId: '7', pasajeros: '2.5' }],
    ['sin bus', { busId: '', pasajeros: '10' }],
  ])('rechaza la entrada inválida (%s) sin llamar al backend', async (_nombre, entrada) => {
    const resultado = await registrarOcupacion(entrada);
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(registrarOcupacionEnBackend).not.toHaveBeenCalled();
  });

  it.each<Rol>(['SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await registrarOcupacion(VALIDO);
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(registrarOcupacionEnBackend).not.toHaveBeenCalled();
    },
  );

  it.each(['ALERTA_PENDIENTE_EXISTENTE', 'PASAJEROS_EXCEDEN_CAPACIDAD', 'ESTACION_AJENA'])(
    'devuelve tal cual el error %s del backend',
    async (codigo) => {
      const error = errorDelBackend(codigo);
      vi.mocked(registrarOcupacionEnBackend).mockResolvedValue(error);
      await expect(registrarOcupacion(VALIDO)).resolves.toEqual(error);
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );
});
