import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { cambiarBusEnBackend } from '../data/pilotos';
import { cambiarBusDePiloto } from './cambiar-bus-de-piloto';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/pilotos', () => ({ cambiarBusEnBackend: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

function comoRol(rol: Rol): void {
  vi.mocked(leerToken).mockResolvedValue('tok');
  vi.mocked(solicitar).mockResolvedValue(sesionDe(rol));
}

describe('cambiarBusDePiloto', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('cambia el bus e invalida listado y ficha sin salir de la ficha', async () => {
    vi.mocked(cambiarBusEnBackend).mockResolvedValue({ ok: true, datos: undefined });
    await expect(cambiarBusDePiloto(7, { busId: '3' })).resolves.toEqual({ ok: true });
    expect(cambiarBusEnBackend).toHaveBeenCalledWith(7, { busId: 3 });
    expect(vi.mocked(revalidatePath).mock.calls.map(([ruta]) => ruta)).toEqual([
      '/pilotos',
      '/pilotos/7',
    ]);
  });

  it('deja al piloto sin bus cuando el valor viene vacío', async () => {
    vi.mocked(cambiarBusEnBackend).mockResolvedValue({ ok: true, datos: undefined });
    await cambiarBusDePiloto(7, { busId: '' });
    expect(cambiarBusEnBackend).toHaveBeenCalledWith(7, { busId: null });
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await cambiarBusDePiloto(7, { busId: 'TM-1' });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(cambiarBusEnBackend).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each<Rol>(['OPERADOR_ESTACION', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await cambiarBusDePiloto(7, { busId: '3' });
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(cambiarBusEnBackend).not.toHaveBeenCalled();
    },
  );

  it.each(['BUS_DE_BAJA', 'BUS_NO_EXISTE'])(
    'devuelve tal cual el error %s del backend',
    async (codigo) => {
      const error = errorDelBackend(codigo);
      vi.mocked(cambiarBusEnBackend).mockResolvedValue(error);
      await expect(cambiarBusDePiloto(7, { busId: '3' })).resolves.toEqual(error);
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );
});
