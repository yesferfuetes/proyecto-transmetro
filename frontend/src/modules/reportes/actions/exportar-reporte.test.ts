import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { leerExportacion, registrarConsulta } from '../data/reportes';
import { exportarReporte } from './exportar-reporte';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/reportes', () => ({ registrarConsulta: vi.fn(), leerExportacion: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

function comoRol(rol: Rol): void {
  vi.mocked(leerToken).mockResolvedValue('tok');
  vi.mocked(solicitar).mockResolvedValue(sesionDe(rol));
}

const ARCHIVO = { nombreDeArchivo: 'reporte-buses-20261009-1030.csv', contenido: 'Placa\r\nTM-1' };

describe('exportarReporte', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('deja una constancia nueva y devuelve el archivo', async () => {
    vi.mocked(registrarConsulta).mockResolvedValue({ ok: true, datos: { id: 8 } });
    vi.mocked(leerExportacion).mockResolvedValue({ ok: true, datos: ARCHIVO });
    await expect(exportarReporte({ tipo: 'BUSES', lineaId: '1' })).resolves.toEqual({
      ok: true,
      archivo: ARCHIVO,
    });
    expect(registrarConsulta).toHaveBeenCalledWith({ tipo: 'BUSES', lineaId: 1 });
    expect(leerExportacion).toHaveBeenCalledWith(8);
    expect(revalidatePath).toHaveBeenCalledWith('/reportes/bitacora');
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await exportarReporte({ tipo: 'ACCESOS' });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(registrarConsulta).not.toHaveBeenCalled();
    expect(leerExportacion).not.toHaveBeenCalled();
  });

  it('niega el acceso al operador sin llamar al backend', async () => {
    comoRol('OPERADOR_ESTACION');
    const resultado = await exportarReporte({ tipo: 'BUSES' });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
    expect(registrarConsulta).not.toHaveBeenCalled();
  });

  it('si no se puede dejar la constancia, no pide el archivo y devuelve el error tal cual', async () => {
    const error = errorDelBackend('CONSTANCIA_NO_REGISTRADA', 500);
    vi.mocked(registrarConsulta).mockResolvedValue(error);
    await expect(exportarReporte({ tipo: 'LINEAS' })).resolves.toEqual(error);
    expect(leerExportacion).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('devuelve el error del backend al leer la exportación', async () => {
    const error = errorDelBackend('CONSULTA_NO_EXISTE', 404);
    vi.mocked(registrarConsulta).mockResolvedValue({ ok: true, datos: { id: 8 } });
    vi.mocked(leerExportacion).mockResolvedValue(error);
    await expect(exportarReporte({ tipo: 'LINEAS' })).resolves.toEqual(error);
  });
});
