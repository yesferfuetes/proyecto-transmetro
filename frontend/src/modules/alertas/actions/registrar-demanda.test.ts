import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { registrarDemandaEnBackend } from '../data/alertas';
import { registrarDemanda } from './registrar-demanda';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/alertas', () => ({ registrarDemandaEnBackend: vi.fn() }));
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

describe('registrarDemanda', () => {
  beforeEach(() => {
    comoRol('OPERADOR_ESTACION');
  });

  it('con alerta nueva usa la estación de la sesión, invalida y lleva a la lista resaltada', async () => {
    vi.mocked(registrarDemandaEnBackend).mockResolvedValue({ ok: true, datos: { alertaId: 12 } });
    await expect(registrarDemanda(VALIDO)).rejects.toThrow('redirect:/alertas?resaltada=12');
    expect(registrarDemandaEnBackend).toHaveBeenCalledWith({
      busId: 7,
      pasajeros: 150,
      estacionId: 3,
    });
    expect(vi.mocked(revalidatePath).mock.calls).toEqual([['/alertas']]);
  });

  it('con 0 pasajeros envía la cifra y no la toma por vacía', async () => {
    vi.mocked(registrarDemandaEnBackend).mockResolvedValue({ ok: true, datos: { alertaId: null } });
    await expect(registrarDemanda({ busId: 7, pasajeros: 0 })).resolves.toEqual({
      ok: true,
      alertaId: null,
    });
    expect(registrarDemandaEnBackend).toHaveBeenCalledWith({
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
    const resultado = await registrarDemanda(entrada);
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(registrarDemandaEnBackend).not.toHaveBeenCalled();
  });

  it.each<Rol>(['SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await registrarDemanda(VALIDO);
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(registrarDemandaEnBackend).not.toHaveBeenCalled();
    },
  );

  it.each(['ALERTA_PENDIENTE_EXISTENTE', 'PASAJEROS_EXCEDEN_CAPACIDAD', 'ESTACION_AJENA'])(
    'devuelve tal cual el error %s del backend',
    async (codigo) => {
      const error = errorDelBackend(codigo);
      vi.mocked(registrarDemandaEnBackend).mockResolvedValue(error);
      await expect(registrarDemanda(VALIDO)).resolves.toEqual(error);
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );
});
