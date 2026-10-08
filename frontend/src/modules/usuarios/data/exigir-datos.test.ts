import { describe, expect, it, vi } from 'vitest';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';
import { exigirDatos } from './exigir-datos';

vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

function rechazo(codigo: string): { ok: false; error: ErrorDeBackend } {
  return { ok: false, error: { codigo, mensaje: codigo, detalles: [], estado: 401 } };
}

describe('exigirDatos', () => {
  it('entrega los datos de un resultado exitoso', () => {
    expect(exigirDatos({ ok: true, datos: [1, 2] })).toEqual([1, 2]);
  });

  it.each(['SESION_EXPIRADA', 'NO_AUTENTICADO'])('con %s lleva a iniciar sesión', (codigo) => {
    expect(() => exigirDatos(rechazo(codigo))).toThrow('redirect:/login?motivo=expirada');
  });

  it('sin permiso lleva a acceso denegado', () => {
    expect(() => exigirDatos(rechazo('ACCESO_DENEGADO'))).toThrow('redirect:/acceso-denegado');
  });

  it('cualquier otro fallo sube al límite de error del segmento', () => {
    expect(() => exigirDatos(rechazo('TIEMPO_AGOTADO'))).toThrow(/TIEMPO_AGOTADO/);
  });
});
