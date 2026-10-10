import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { atenderEnBackend } from '../data/alertas';
import { atenderAlerta } from './atender-alerta';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/alertas', () => ({ atenderEnBackend: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

function comoRol(rol: Rol): void {
  vi.mocked(leerToken).mockResolvedValue('tok');
  vi.mocked(solicitar).mockResolvedValue(sesionDe(rol));
}

describe('atenderAlerta', () => {
  beforeEach(() => {
    comoRol('OPERADOR_ESTACION');
  });

  it('atiende e invalida la lista de alertas', async () => {
    vi.mocked(atenderEnBackend).mockResolvedValue({ ok: true, datos: undefined });
    await expect(atenderAlerta(5)).resolves.toEqual({ ok: true });
    expect(atenderEnBackend).toHaveBeenCalledWith(5);
    expect(vi.mocked(revalidatePath).mock.calls).toEqual([['/alertas']]);
  });

  it.each([0, -3, 'abc', '', null, 1.5])('rechaza el id %j sin llamar al backend', async (id) => {
    const resultado = await atenderAlerta(id);
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(atenderEnBackend).not.toHaveBeenCalled();
  });

  it.each<Rol>(['SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await atenderAlerta(5);
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(atenderEnBackend).not.toHaveBeenCalled();
    },
  );

  it.each(['ALERTA_YA_ATENDIDA', 'ESTACION_AJENA'])(
    'devuelve tal cual el error %s del backend',
    async (codigo) => {
      const error = errorDelBackend(codigo, 409);
      vi.mocked(atenderEnBackend).mockResolvedValue(error);
      await expect(atenderAlerta(5)).resolves.toEqual(error);
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );
});
