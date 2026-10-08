import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { registrarMunicipalidadEnBackend } from '../data/municipalidades';
import { registrarMunicipalidad } from './registrar-municipalidad';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/municipalidades', () => ({ registrarMunicipalidadEnBackend: vi.fn() }));
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

const VALIDO = { nombre: ' Mixco ', departamento: 'Guatemala', fechaIncorporacion: '2026-10-01' };

describe('registrarMunicipalidad', () => {
  beforeEach(() => {
    comoRol('ADMINISTRADOR');
  });

  it('registra la municipalidad, invalida el listado y vuelve a él', async () => {
    vi.mocked(registrarMunicipalidadEnBackend).mockResolvedValue({ ok: true, datos: { id: 9 } });

    await expect(registrarMunicipalidad(VALIDO)).rejects.toThrow('redirect:/municipalidades');

    expect(registrarMunicipalidadEnBackend).toHaveBeenCalledWith({ ...VALIDO, nombre: 'Mixco' });
    expect(rutasInvalidadas()).toEqual(['/municipalidades']);
  });

  it('rechaza un nombre vacío o una fecha mal escrita sin llamar al backend', async () => {
    const resultado = await registrarMunicipalidad({ nombre: ' ', fechaIncorporacion: '01/10' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(registrarMunicipalidadEnBackend).not.toHaveBeenCalled();
  });

  it('niega el acceso al supervisor sin llamar al backend', async () => {
    comoRol('SUPERVISOR_MUNICIPAL');

    const resultado = await registrarMunicipalidad(VALIDO);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
    expect(registrarMunicipalidadEnBackend).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el error del backend', async () => {
    const error = errorDelBackend('MUNICIPALIDAD_DUPLICADA', 409);
    vi.mocked(registrarMunicipalidadEnBackend).mockResolvedValue(error);

    await expect(registrarMunicipalidad(VALIDO)).resolves.toEqual(error);
  });
});
