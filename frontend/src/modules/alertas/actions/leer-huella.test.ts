import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import { leerToken } from '@/shared/lib/sesion/cookie';
import { leerHuella } from '../data/huella';
import { leerHuellaDeAlertas } from './leer-huella';
import { errorDelBackend, sesionDe } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/huella', () => ({ leerHuella: vi.fn() }));

const HUELLA = { pendientes: 2, atendidas: 1, ultimaId: 9 };

describe('leerHuellaDeAlertas', () => {
  beforeEach(() => {
    vi.mocked(leerToken).mockResolvedValue('tok');
  });

  it.each(['OPERADOR_ESTACION', 'SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR'] as const)(
    'devuelve la huella con la sesión de %s',
    async (rol) => {
      vi.mocked(solicitar).mockResolvedValue(sesionDe(rol));
      vi.mocked(leerHuella).mockResolvedValue({ ok: true, datos: HUELLA });
      await expect(leerHuellaDeAlertas()).resolves.toEqual({ ok: true, datos: HUELLA });
    },
  );

  it('sin sesión rechaza sin llamar al backend de alertas', async () => {
    vi.mocked(leerToken).mockResolvedValue(undefined);
    const resultado = await leerHuellaDeAlertas();
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'NO_AUTENTICADO' } });
    expect(leerHuella).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el error del backend', async () => {
    vi.mocked(solicitar).mockResolvedValue(sesionDe('OPERADOR_ESTACION'));
    const error = errorDelBackend('TIEMPO_AGOTADO', 0);
    vi.mocked(leerHuella).mockResolvedValue(error);
    await expect(leerHuellaDeAlertas()).resolves.toEqual(error);
  });
});
