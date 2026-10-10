import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { editarPilotoEnBackend } from '../data/pilotos';
import { editarPiloto } from './editar-piloto';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/pilotos', () => ({ editarPilotoEnBackend: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

function comoRol(rol: Rol): void {
  vi.mocked(leerToken).mockResolvedValue('tok');
  vi.mocked(solicitar).mockResolvedValue(sesionDe(rol));
}

const VALIDO = {
  nombre: 'Ana López',
  dpi: '1234567890101',
  direccionResidencia: 'Zona 1',
  telefono: '55551234',
  correo: 'ana@example.com',
  historialEducativo: 'Perito contador',
};

describe('editarPiloto', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('edita el expediente, invalida listado y ficha y vuelve a la ficha', async () => {
    vi.mocked(editarPilotoEnBackend).mockResolvedValue({ ok: true, datos: undefined });
    await expect(editarPiloto(7, VALIDO)).rejects.toThrow('redirect:/pilotos/7');
    expect(editarPilotoEnBackend).toHaveBeenCalledWith(7, VALIDO);
    expect(vi.mocked(revalidatePath).mock.calls.map(([ruta]) => ruta)).toEqual([
      '/pilotos',
      '/pilotos/7',
    ]);
  });

  it('rechaza la entrada inválida sin llamar al backend', async () => {
    const resultado = await editarPiloto(7, { ...VALIDO, telefono: '123', nombre: '' });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(editarPilotoEnBackend).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('rechaza un identificador inválido sin llamar al backend', async () => {
    const resultado = await editarPiloto('abc', VALIDO);
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(editarPilotoEnBackend).not.toHaveBeenCalled();
  });

  it.each<Rol>(['OPERADOR_ESTACION', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await editarPiloto(7, VALIDO);
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(editarPilotoEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error DPI_PILOTO_DUPLICADO del backend', async () => {
    const error = errorDelBackend('DPI_PILOTO_DUPLICADO', 409);
    vi.mocked(editarPilotoEnBackend).mockResolvedValue(error);
    await expect(editarPiloto(7, VALIDO)).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
