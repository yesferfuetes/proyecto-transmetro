import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { asignarLineaEnBackend } from '../data/buses';
import { asignarLinea } from './asignar-linea';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/buses', () => ({ asignarLineaEnBackend: vi.fn() }));
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

const VALIDO = { lineaId: '3' };

describe('asignarLinea', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('asigna la línea e invalida la flota sin salir del detalle', async () => {
    vi.mocked(asignarLineaEnBackend).mockResolvedValue({ ok: true, datos: undefined });
    await expect(asignarLinea(7, VALIDO)).resolves.toEqual({ ok: true });
    expect(asignarLineaEnBackend).toHaveBeenCalledWith(7, { lineaId: 3 });
    expect(rutasInvalidadas()).toEqual(['/flota', '/flota/7', '/flota/lineas', '/flota/parqueos']);
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await asignarLinea(7, { lineaId: 'L3' });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(asignarLineaEnBackend).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each<Rol>(['OPERADOR_ESTACION', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await asignarLinea(7, VALIDO);
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(asignarLineaEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error FLOTA_MAXIMA_EXCEDIDA del backend', async () => {
    const error = errorDelBackend('FLOTA_MAXIMA_EXCEDIDA');
    vi.mocked(asignarLineaEnBackend).mockResolvedValue(error);
    await expect(asignarLinea(7, VALIDO)).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
