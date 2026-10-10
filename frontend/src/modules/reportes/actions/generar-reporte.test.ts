import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { registrarConsulta } from '../data/reportes';
import { generarReporte } from './generar-reporte';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/reportes', () => ({ registrarConsulta: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

function comoRol(rol: Rol): void {
  vi.mocked(leerToken).mockResolvedValue('tok');
  vi.mocked(solicitar).mockResolvedValue(sesionDe(rol));
}

describe('generarReporte', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('registra la consulta y lleva al reporte de su tipo', async () => {
    vi.mocked(registrarConsulta).mockResolvedValue({ ok: true, datos: { id: 41 } });
    await expect(generarReporte({ tipo: 'LINEAS', municipalidadId: '2' })).rejects.toThrow(
      'redirect:/reportes/lineas?consulta=41',
    );
    expect(registrarConsulta).toHaveBeenCalledWith({ tipo: 'LINEAS', municipalidadId: 2 });
    expect(revalidatePath).toHaveBeenCalledWith('/reportes/bitacora');
  });

  it.each([
    ['ESTACIONES', '/reportes/estaciones?consulta=5'],
    ['BUSES', '/reportes/buses?consulta=5'],
  ])('el reporte de %s se abre en %s', async (tipo, destino) => {
    vi.mocked(registrarConsulta).mockResolvedValue({ ok: true, datos: { id: 5 } });
    await expect(generarReporte({ tipo, lineaId: '', estacionId: '' })).rejects.toThrow(
      `redirect:${destino}`,
    );
    expect(registrarConsulta).toHaveBeenCalledWith({ tipo });
  });

  it('el administrador también puede generar', async () => {
    comoRol('ADMINISTRADOR');
    vi.mocked(registrarConsulta).mockResolvedValue({ ok: true, datos: { id: 6 } });
    await expect(generarReporte({ tipo: 'BUSES' })).rejects.toThrow('redirect:/reportes/buses');
  });

  it.each([
    ['sin tipo', { tipo: '' }],
    ['con un tipo desconocido', { tipo: 'PILOTOS' }],
    ['con una línea que no es número', { tipo: 'LINEAS', lineaId: 'L1' }],
    ['con una estación negativa', { tipo: 'ESTACIONES', estacionId: '-3' }],
  ])('rechaza la entrada %s sin llamar al backend', async (_caso, entrada) => {
    const resultado = await generarReporte(entrada);
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(registrarConsulta).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('niega el acceso al operador sin llamar al backend', async () => {
    comoRol('OPERADOR_ESTACION');
    const resultado = await generarReporte({ tipo: 'LINEAS' });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
    expect(registrarConsulta).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el error del backend y no invalida nada', async () => {
    const error = errorDelBackend('LINEA_NO_EXISTE');
    vi.mocked(registrarConsulta).mockResolvedValue(error);
    await expect(generarReporte({ tipo: 'LINEAS', lineaId: 99 })).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
