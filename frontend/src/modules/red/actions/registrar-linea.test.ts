import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { registrarLineaEnBackend } from '../data/lineas';
import { registrarLinea } from './registrar-linea';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/lineas', () => ({ registrarLineaEnBackend: vi.fn() }));
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
  codigo: ' l20 ',
  nombre: 'Línea 20',
  municipalidadId: '2',
  estado: 'EN_CONSTRUCCION',
};

describe('registrarLinea', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('registra la línea, invalida el listado y lleva al detalle', async () => {
    vi.mocked(registrarLineaEnBackend).mockResolvedValue({ ok: true, datos: { id: 20 } });

    await expect(registrarLinea(VALIDO)).rejects.toThrow('redirect:/lineas/20');

    expect(registrarLineaEnBackend).toHaveBeenCalledWith({
      codigo: 'l20',
      nombre: 'Línea 20',
      municipalidadId: 2,
      estado: 'EN_CONSTRUCCION',
    });
    expect(rutasInvalidadas()).toEqual(['/lineas', '/lineas/20']);
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await registrarLinea({ ...VALIDO, codigo: '', estado: 'CERRADA' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(registrarLineaEnBackend).not.toHaveBeenCalled();
  });

  it('niega el acceso al operador sin llamar al backend', async () => {
    comoRol('OPERADOR_ESTACION');

    const resultado = await registrarLinea(VALIDO);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
    expect(registrarLineaEnBackend).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el error del backend', async () => {
    const error = errorDelBackend('CODIGO_LINEA_DUPLICADO', 409);
    vi.mocked(registrarLineaEnBackend).mockResolvedValue(error);

    await expect(registrarLinea(VALIDO)).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
