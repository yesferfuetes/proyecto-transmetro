import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { cambiarEstadoDeLineaEnBackend } from '../data/lineas';
import { cambiarEstadoDeLinea } from './cambiar-estado-de-linea';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/lineas', () => ({ cambiarEstadoDeLineaEnBackend: vi.fn() }));
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

describe('cambiarEstadoDeLinea', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('cambia el estado, invalida el listado y el detalle, y se queda en la página', async () => {
    vi.mocked(cambiarEstadoDeLineaEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(cambiarEstadoDeLinea(4, { estado: 'ACTIVA' })).resolves.toEqual({ ok: true });

    expect(cambiarEstadoDeLineaEnBackend).toHaveBeenCalledWith(4, { estado: 'ACTIVA' });
    expect(rutasInvalidadas()).toEqual(['/lineas', '/lineas/4']);
  });

  it('rechaza un estado fuera de los tres sin llamar al backend', async () => {
    const resultado = await cambiarEstadoDeLinea(4, { estado: 'CERRADA' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(cambiarEstadoDeLineaEnBackend).not.toHaveBeenCalled();
  });

  it('niega el acceso al operador sin llamar al backend', async () => {
    comoRol('OPERADOR_ESTACION');

    const resultado = await cambiarEstadoDeLinea(4, { estado: 'ACTIVA' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
    expect(cambiarEstadoDeLineaEnBackend).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el recorrido insuficiente del backend', async () => {
    const error = errorDelBackend('RECORRIDO_INSUFICIENTE');
    vi.mocked(cambiarEstadoDeLineaEnBackend).mockResolvedValue(error);

    await expect(cambiarEstadoDeLinea(4, { estado: 'ACTIVA' })).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
