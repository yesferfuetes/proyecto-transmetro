import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { editarMunicipalidadEnBackend } from '../data/municipalidades';
import { editarMunicipalidad } from './editar-municipalidad';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/municipalidades', () => ({ editarMunicipalidadEnBackend: vi.fn() }));
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

const VALIDO = { nombre: 'Guatemala', departamento: '', fechaIncorporacion: '' };

describe('editarMunicipalidad', () => {
  beforeEach(() => {
    comoRol('ADMINISTRADOR');
  });

  it('edita la municipalidad y vuelve al listado', async () => {
    vi.mocked(editarMunicipalidadEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(editarMunicipalidad(1, VALIDO)).rejects.toThrow('redirect:/municipalidades');

    expect(editarMunicipalidadEnBackend).toHaveBeenCalledWith(1, { nombre: 'Guatemala' });
    expect(rutasInvalidadas()).toEqual(['/municipalidades']);
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await editarMunicipalidad(1, { nombre: 'x'.repeat(151) });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(editarMunicipalidadEnBackend).not.toHaveBeenCalled();
  });

  it('niega el acceso al supervisor sin llamar al backend', async () => {
    comoRol('SUPERVISOR_MUNICIPAL');

    const resultado = await editarMunicipalidad(1, VALIDO);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
    expect(editarMunicipalidadEnBackend).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el error del backend', async () => {
    const error = errorDelBackend('MUNICIPALIDAD_DUPLICADA', 409);
    vi.mocked(editarMunicipalidadEnBackend).mockResolvedValue(error);

    await expect(editarMunicipalidad(1, VALIDO)).resolves.toEqual(error);
  });
});
