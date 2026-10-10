import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';
import { registrarPilotoEnBackend } from '../data/pilotos';
import { registrarPiloto } from './registrar-piloto';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/pilotos', () => ({ registrarPilotoEnBackend: vi.fn() }));
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
  nombre: ' Ana López ',
  dpi: '1234 56789 0101',
  direccionResidencia: 'Zona 1',
  telefono: '5555-1234',
  correo: '',
  historialEducativo: 'Bachiller en computación',
  busId: '4',
};

describe('registrarPiloto', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('registra el piloto, invalida el listado y lleva a su ficha', async () => {
    vi.mocked(registrarPilotoEnBackend).mockResolvedValue({ ok: true, datos: { id: 9 } });
    await expect(registrarPiloto(VALIDO)).rejects.toThrow('redirect:/pilotos/9');
    expect(registrarPilotoEnBackend).toHaveBeenCalledWith({
      nombre: 'Ana López',
      dpi: '1234 56789 0101',
      direccionResidencia: 'Zona 1',
      telefono: '5555-1234',
      correo: undefined,
      historialEducativo: 'Bachiller en computación',
      busId: 4,
    });
    expect(rutasInvalidadas()).toEqual(['/pilotos', '/pilotos/9']);
  });

  it('registra sin bus cuando no se elige ninguno', async () => {
    vi.mocked(registrarPilotoEnBackend).mockResolvedValue({ ok: true, datos: { id: 9 } });
    await expect(registrarPiloto({ ...VALIDO, busId: '' })).rejects.toThrow('redirect');
    expect(registrarPilotoEnBackend).toHaveBeenCalledWith(
      expect.objectContaining({ busId: undefined }),
    );
  });

  it.each([
    ['un DPI de 12 dígitos', { dpi: '123456789010' }, 'dpi'],
    ['un DPI con letras', { dpi: '12345678901AB' }, 'dpi'],
    ['un teléfono corto', { telefono: '5555123' }, 'telefono'],
    ['una dirección vacía', { direccionResidencia: '  ' }, 'direccionResidencia'],
    ['un historial vacío', { historialEducativo: '' }, 'historialEducativo'],
    ['un nombre vacío', { nombre: '' }, 'nombre'],
    ['un correo sin arroba', { correo: 'ana.example.com' }, 'correo'],
  ])('rechaza %s sin llamar al backend', async (_caso, cambio, campo) => {
    const resultado = await registrarPiloto({ ...VALIDO, ...cambio });
    expect(resultado).toMatchObject({
      ok: false,
      error: { codigo: 'ENTRADA_INVALIDA', detalles: [{ campo }] },
    });
    expect(registrarPilotoEnBackend).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each<Rol>(['OPERADOR_ESTACION', 'ADMINISTRADOR'])(
    'niega el acceso a %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);
      const resultado = await registrarPiloto(VALIDO);
      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(registrarPilotoEnBackend).not.toHaveBeenCalled();
    },
  );

  it.each(['DPI_PILOTO_DUPLICADO', 'BUS_DE_BAJA'])(
    'devuelve tal cual el error %s del backend',
    async (codigo) => {
      const error = errorDelBackend(codigo);
      vi.mocked(registrarPilotoEnBackend).mockResolvedValue(error);
      await expect(registrarPiloto(VALIDO)).resolves.toEqual(error);
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );
});
