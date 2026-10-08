import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { editarLineaEnBackend } from '../data/lineas';
import { editarLinea } from './editar-linea';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/lineas', () => ({ editarLineaEnBackend: vi.fn() }));
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

const VALIDO = { nombre: 'Línea 1 renovada', municipalidadId: 1 };

describe('editarLinea', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('edita la línea sin enviar código ni estado y vuelve al detalle', async () => {
    vi.mocked(editarLineaEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(editarLinea(4, { ...VALIDO, codigo: 'X9', estado: 'ACTIVA' })).rejects.toThrow(
      'redirect:/lineas/4',
    );

    expect(editarLineaEnBackend).toHaveBeenCalledWith(4, VALIDO);
    expect(rutasInvalidadas()).toEqual(['/lineas', '/lineas/4']);
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await editarLinea(4, { nombre: '', municipalidadId: '' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(editarLineaEnBackend).not.toHaveBeenCalled();
  });

  it('niega el acceso al operador sin llamar al backend', async () => {
    comoRol('OPERADOR_ESTACION');

    const resultado = await editarLinea(4, VALIDO);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
    expect(editarLineaEnBackend).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el error del backend', async () => {
    const error = errorDelBackend('MUNICIPALIDAD_NO_EXISTE');
    vi.mocked(editarLineaEnBackend).mockResolvedValue(error);

    await expect(editarLinea(4, VALIDO)).resolves.toEqual(error);
  });
});
